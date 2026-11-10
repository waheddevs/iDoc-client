export type User = { id: string; email: string; name?: string };
export type Doc = {
  document_id: string;
  file_name: string;
  file_type: string;
  size_bytes: number;
  num_chunks: number;
  ingested_at: string;
  status: 'ready' | 'processing' | 'deleting';
};
export type Source = {
  source_id: string;
  document_id: string;
  file_name: string;
  page_label: string | null;
  chunk_index: number;
  text: string;
  score: number | null;
};
export type Message = { role: 'user' | 'assistant'; content: string; sources?: Source[] };
export type Config = {
  app_name: string;
  supported_extensions: string[];
  max_file_size_bytes: number;
  answer_provider: string;
  answer_model: string;
  embedding_provider: string;
  embedding_model: string;
  answer_processing: 'local' | 'cloud';
  embedding_processing: 'local' | 'cloud';
  features: { ocr: boolean };
};
export type Completion = {
  choices: { message: { role: 'assistant'; content: string } }[];
  sources: Source[] | null;
};
