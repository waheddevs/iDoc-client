import { WorkspaceProvider } from '@/features/workspace/WorkspaceContext';
import { WorkspaceShell } from '@/features/workspace/WorkspaceShell';
export const metadata = { title: 'Frontend preview', robots: { index: false, follow: false } };
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider preview>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
