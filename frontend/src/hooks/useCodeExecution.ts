import { useState, useCallback } from 'react';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  signal: string | null;
}

const LANGUAGE_VERSIONS: Record<string, string> = {
  python: '3.10.0',
  javascript: '18.15.0',
  java: '15.0.2',
  cpp: '10.2.0',
  c: '10.2.0',
  typescript: '5.0.3',
};

const EXTENSIONS: Record<string, string> = {
  python: 'py',
  javascript: 'js',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  typescript: 'ts',
};

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

export function useCodeExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeCode = useCallback(async (
    language: string,
    code: string,
    stdin?: string
  ): Promise<ExecutionResult> => {
    setIsExecuting(true);
    setError(null);

    const lang = language.toLowerCase();
    const version = LANGUAGE_VERSIONS[lang];
    if (!version) {
      const err = `Unsupported language: ${language}`;
      setError(err);
      setIsExecuting(false);
      throw new Error(err);
    }

    try {
      const response = await fetch(PISTON_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang === 'cpp' ? 'c++' : lang,
          version,
          files: [{ name: `main.${EXTENSIONS[lang] || 'txt'}`, content: code }],
          stdin: stdin || '',
          run_timeout: 10000,
          compile_timeout: 10000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Piston API error: ${response.status}`);
      }

      const data = await response.json();
      const run = data.run || {};

      const result: ExecutionResult = {
        stdout: (run.stdout || '').trim(),
        stderr: (run.stderr || '').trim(),
        exitCode: run.code ?? -1,
        signal: run.signal || null,
      };

      setLastResult(result);
      setIsExecuting(false);
      return result;
    } catch (err: any) {
      const message = err.message || 'Code execution failed';
      setError(message);
      setIsExecuting(false);
      throw err;
    }
  }, []);

  return { executeCode, isExecuting, lastResult, error };
}
