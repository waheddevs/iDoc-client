import { redirect } from 'next/navigation';
import { localWorkspaceEnabled } from '@/lib/server/backend';
import { ProfilePage } from '@/features/profile/ProfilePage';
export default function ProfileRoute() {
  if (localWorkspaceEnabled()) redirect('/chat');
  return <ProfilePage />;
}
