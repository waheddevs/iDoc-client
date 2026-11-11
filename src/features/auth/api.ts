import { api, json } from '@/lib/api/client';
import type { User } from '@/lib/api/types';
export const signIn = (values: { email: string; password: string }) =>
  api('v1/auth/login', json(values));
export const signUp = (values: { email: string; password: string }) =>
  api('v1/auth/signup', json(values));
export const getSession = () => api<{ user: User }>('v1/auth/session');
// Keep navigation intent across provider remounts and late query responses.
let signingOut = false;
export const isSigningOut = () => signingOut;
export const signOut = async () => {
  signingOut = true;
  window.dispatchEvent(new Event('idoc:signing-out'));
  try {
    return await api('v1/auth/logout', json({}));
  } catch (error) {
    signingOut = false;
    window.dispatchEvent(new Event('idoc:sign-out-failed'));
    throw error;
  }
};
