import { api, json } from '@/lib/api/client';
import type { User } from '@/lib/api/types';
export const signIn = (values: { email: string; password: string }) =>
  api('v1/auth/login', json(values));
export const signUp = (values: { email: string; password: string }) =>
  api('v1/auth/signup', json(values));
export const getSession = () => api<{ user: User }>('v1/auth/session');
export const signOut = async () => {
  window.dispatchEvent(new Event('idoc:signing-out'));
  try {
    return await api('v1/auth/logout', json({}));
  } catch (error) {
    window.dispatchEvent(new Event('idoc:sign-out-failed'));
    throw error;
  }
};
