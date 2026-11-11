import { requireSession } from '@/lib/auth/session.server';
import { localWorkspaceEnabled } from '@/lib/server/backend';
import { WorkspaceProvider } from '@/features/workspace/WorkspaceContext';
import { WorkspaceShell } from '@/features/workspace/WorkspaceShell';
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return (
    <WorkspaceProvider local={localWorkspaceEnabled()}>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
