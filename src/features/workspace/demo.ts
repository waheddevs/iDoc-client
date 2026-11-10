import type { Config, Doc, Source } from '@/lib/api/types';
// Isolated, explicitly labeled frontend preview. Never used by protected routes.
export const demoDocuments: Doc[] = [
  {
    document_id: 'example-guide',
    file_name: 'Workspace_Guide.pdf',
    file_type: 'pdf',
    size_bytes: 1887436,
    num_chunks: 24,
    ingested_at: '2026-11-10T09:00:00Z',
    status: 'ready',
  },
  {
    document_id: 'example-notes',
    file_name: 'Project_Notes.md',
    file_type: 'md',
    size_bytes: 12288,
    num_chunks: 8,
    ingested_at: '2026-11-10T08:00:00Z',
    status: 'ready',
  },
  {
    document_id: 'example-requirements',
    file_name: 'Requirements.docx',
    file_type: 'docx',
    size_bytes: 430080,
    num_chunks: 16,
    ingested_at: '2026-11-09T12:00:00Z',
    status: 'ready',
  },
];
export const demoConfig: Config = {
  app_name: 'iDoc',
  supported_extensions: ['pdf', 'docx', 'txt', 'md'],
  max_file_size_bytes: 20971520,
  answer_provider: 'Not connected',
  answer_model: 'Not configured',
  embedding_provider: 'Not connected',
  embedding_model: 'Not configured',
  answer_processing: 'local',
  embedding_processing: 'local',
  features: { ocr: false },
};
export function demoAnswer(doc: Doc): { content: string; sources: Source[] } {
  return {
    content:
      '**Example answer** — this is a frontend preview, not an AI-generated response.\n\nThe document workspace lets you upload files, choose a document scope, and inspect the passages behind an answer. [S1]\n\nConnect the backend to ask questions about actual document contents.',
    sources: [
      {
        source_id: 'S1',
        document_id: doc.document_id,
        file_name: doc.file_name,
        page_label: null,
        chunk_index: 0,
        text: 'Example passage: Upload your documents, ask a question, then inspect the original source. This sample text is included only to demonstrate the source inspector.',
        score: null,
      },
    ],
  };
}
