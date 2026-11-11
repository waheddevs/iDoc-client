import { api, json } from '@/lib/api/client';
import type { Profile } from '@/lib/api/types';
export const getProfile = () => api<Profile>('v1/profile');
export const updateProfile = (name: string) =>
  api<Profile>('v1/profile', { ...json({ name }), method: 'PATCH' });
export const uploadAvatar = (file: File) => {
  const body = new FormData();
  body.append('file', file);
  return api<Profile>('v1/profile/avatar', { method: 'POST', body });
};
export const removeAvatar = () => api<Profile>('v1/profile/avatar', { method: 'DELETE' });
export const changePassword = (values: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) => api('v1/profile/password', json(values));
export const revokeOtherSessions = () => api('v1/profile/sessions/revoke', json({}));
