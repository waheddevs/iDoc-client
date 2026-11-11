import { requireSession } from '@/lib/auth/session.server';
import { ChatWorkspace } from '@/features/chat/ChatWorkspace';
export const metadata = { title: 'Chat' };
export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  await requireSession();
  const { conversation } = await searchParams;
  return <ChatWorkspace key={conversation || 'new'} conversationId={conversation || null} />;
}
