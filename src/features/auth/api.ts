import { api, json } from '@/lib/api/client';
import type { User } from '@/lib/api/types';
export const signIn = (values: { email: string; password: string }) =>
  api('v1/auth/login', json(values));
export const getSession = () => api<{ user: User }>('v1/auth/session');
export const signOut = () => api('v1/auth/logout', json({}));
