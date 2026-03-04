import { z } from 'zod';

export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

export const emailRegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const profileSetupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.union([z.number().int().min(13).max(100), z.string()]).optional(),
  college: z.string().max(200).optional(),
  degree: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  graduationYear: z.union([z.number().int().min(2000).max(2040), z.string()]).optional(),
  githubUsername: z.string().max(200).transform(val => {
    // Extract username from full GitHub URL if provided
    const match = val.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/?$/);
    return match ? match[1] : val;
  }).pipe(z.string().max(39).regex(/^[a-zA-Z0-9-]*$/, 'Invalid GitHub username')).optional().or(z.literal('')),
  linkedinUrl: z.string().max(500).optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
}).passthrough();

export const settingsUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  githubUsername: z.string().max(39).optional(),
  linkedinUrl: z.string().max(500).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  college: z.string().max(200).optional(),
  degree: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  graduationYear: z.string().optional(),
}).passthrough();
