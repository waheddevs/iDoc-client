import { api } from '@/lib/api/client';
import type { Doc } from '@/lib/api/types';
export const listDocuments = () => api<{ documents: Doc[]; total: number }>('v1/documents');
export const deleteDocument = (id: string) =>
  api(`v1/documents/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const uploadDocument = (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return api<{ document_id: string; status: 'success' | 'already_exists' }>('v1/ingest/file', {
    method: 'POST',
    body: data,
  });
};
