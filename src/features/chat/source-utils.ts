import type { Message } from '@/lib/api/types';
// Explicit metadata takes precedence. Text fallback is only for older saved chats.
export function isInsufficientAnswer(content: string, status?: Message['answer_status']) {
  if (status) return status === 'insufficient_evidence';
  return /^(?:the )?available documents do not provide enough information\b/i.test(content.trim());
}
export function usesRetrievedPassages(message: Message) {
  return (
    message.answer_status === 'unverified' ||
    isInsufficientAnswer(message.content, message.answer_status)
  );
}
export function isSummaryQuestion(content: string) {
  return /\b(summari[sz]e|summary|overview|key (?:points|takeaways)|main ideas|xulosa|umumlashtir\w*)\b|\uC694\uC57D/i.test(
    content,
  );
}
