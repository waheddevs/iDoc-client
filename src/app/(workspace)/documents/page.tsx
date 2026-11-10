import { requireSession } from '@/lib/auth/session.server';
import { DocumentLibrary } from '@/features/documents/DocumentLibrary';
export const metadata = { title: 'Documents' };
export default async function DocumentsPage() {
  await requireSession();
  return <DocumentLibrary />;
}
