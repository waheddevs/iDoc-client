export type User = { id: string; email: string; name?: string; avatar_version?: string | null };
export type Doc = {
  total_pages?: number | null;
  text_pages?: number | null;
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
export type AnswerMetadata = {
  answer_status?: 'answered' | 'insufficient_evidence' | 'unverified';
  mode?: 'question' | 'summary';
  coverage?: {
    total_chunks: number;
    reviewed_chunks: number;
    partial: boolean;
    basis: 'indexed_text';
  } | null;
};
export type Message = AnswerMetadata & {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
};
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
export type Completion = AnswerMetadata & {
  choices: { message: { role: 'assistant'; content: string } }[];
  sources: Source[] | null;
};

export type Profile = {
  user: User;
  has_password: boolean;
  google_connected: boolean;
  created_at: number;
};
export type ConversationSummary = {
  id: string;
  title: string;
  revision: number;
  created_at: number;
  updated_at: number;
  pending: boolean;
  error: string | null;
};
export type Conversation = ConversationSummary & {
  messages: Message[];
  document_ids: string[] | null;
};
