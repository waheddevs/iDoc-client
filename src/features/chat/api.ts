import { api, json } from '@/lib/api/client';
import type { Completion, Message } from '@/lib/api/types';
export const completeChat = (messages: Message[], ids: string[]) =>
  api<Completion>(
    'v1/chat/completions',
    json({
      messages: messages.map(({ role, content }) => ({ role, content })),
      document_ids: ids.length ? ids : null,
      use_context: true,
      include_sources: true,
      stream: false,
    }),
  );
