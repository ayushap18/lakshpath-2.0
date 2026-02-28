import { InputHTMLAttributes, forwardRef, useState } from 'react';
import Icon from './Icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, hint, className = '', onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary mb-1.5 transition-colors duration-200"
            style={focused ? { color: '#0da2e7' } : undefined}
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
              style={{ color: focused ? '#0da2e7' : error ? '#EF4444' : '#64748B' }}
            >
              <Icon name={icon} size={20} />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-xl py-3 ${
              icon ? 'pl-11' : 'pl-4'
            } pr-4 text-white placeholder-muted outline-none text-sm transition-all duration-300 ${
              error ? 'border-error/50' : ''
            } ${className}`}
            style={{
              background: 'rgba(15,23,42,0.8)',
              border: `1px solid ${
                error ? 'rgba(239,68,68,0.4)'
                : focused ? 'rgba(13,162,231,0.5)'
                : 'rgba(255,255,255,0.06)'
              }`,
              boxShadow: error
                ? '0 0 0 3px rgba(239,68,68,0.08), inset 0 2px 4px rgba(0,0,0,0.15)'
                : focused
                ? '0 0 0 3px rgba(13,162,231,0.1), 0 0 20px rgba(13,162,231,0.06), inset 0 2px 4px rgba(0,0,0,0.1)'
                : 'inset 0 2px 4px rgba(0,0,0,0.15)',
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {/* Focus shimmer line at top */}
          <div
            className="absolute top-0 left-4 right-4 h-px pointer-events-none transition-opacity duration-300"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(13,162,231,0.3), transparent)',
              opacity: focused ? 1 : 0,
            }}
          />
        </div>
        {error && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Icon name="error" size={14} style={{ color: '#EF4444' }} />
            <p className="text-xs text-error">{error}</p>
          </div>
        )}
        {hint && !error && (
          <p className="text-[11px] text-muted mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
