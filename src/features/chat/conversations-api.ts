import { api, json } from '@/lib/api/client';
import type { Conversation, ConversationSummary } from '@/lib/api/types';
export const listConversations = () =>
  api<{ conversations: ConversationSummary[] }>('v1/conversations');
export const createConversation = () => api<Conversation>('v1/conversations', json({}));
export const getConversation = (id: string) =>
  api<Conversation>('v1/conversations/' + encodeURIComponent(id));
export const renameConversation = (id: string, title: string) =>
  api<Conversation>('v1/conversations/' + encodeURIComponent(id), {
    ...json({ title }),
    method: 'PATCH',
  });
export const deleteConversation = (id: string) =>
  api('v1/conversations/' + encodeURIComponent(id), { method: 'DELETE' });
