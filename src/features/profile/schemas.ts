import { z } from 'zod';
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your display name.')
    .max(80, 'Use at most 80 characters.')
    .refine(
      (value) => !Array.from(value).some((character) => character.charCodeAt(0) < 32),
      'Use a name without control characters.',
    ),
});
export const passwordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, 'Enter your current password.')
      .max(128, 'Use at most 128 characters.'),
    new_password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(128, 'Use at most 128 characters.'),
    confirm_password: z
      .string()
      .min(1, 'Confirm your new password.')
      .max(128, 'Use at most 128 characters.'),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match.',
  })
  .refine((values) => values.new_password !== values.current_password, {
    path: ['new_password'],
    message: 'Choose a different password.',
  });
export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;
