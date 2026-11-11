import { api, json } from '@/lib/api/client';
import type { Completion, Message } from '@/lib/api/types';
export const completeChat = (
  messages: Message[],
  ids: string[],
  conversation?: { id: string; revision: number },
) =>
  api<Completion>(
    'v1/chat/completions',
    json({
      messages: messages.map(({ role, content }) => ({ role, content })),
      document_ids: ids.length ? ids : null,
      ...(conversation
        ? { conversation_id: conversation.id, conversation_revision: conversation.revision }
        : {}),
      use_context: true,
      include_sources: true,
      stream: false,
    }),
  );
