import { requireSession } from '@/lib/auth/session.server';
import { WorkspaceProvider } from '@/features/workspace/WorkspaceContext';
import { WorkspaceShell } from '@/features/workspace/WorkspaceShell';
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return (
    <WorkspaceProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
