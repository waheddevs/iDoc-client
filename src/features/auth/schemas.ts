import { z } from 'zod';

const email = z
  .string()
  .trim()
  .max(254, 'Use at most 254 characters.')
  .min(1, 'Enter your email address.')
  .pipe(z.email('Enter a valid email address.'));
const password = z.string().min(1, 'Enter your password.').max(128, 'Use at most 128 characters.');
export const loginSchema = z.object({ email, password });
export const signupSchema = z
  .object({
    email,
    password: password.min(8, 'Use at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });
export type AuthValues = { email: string; password: string; confirmPassword?: string };
