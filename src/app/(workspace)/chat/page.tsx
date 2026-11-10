import { requireSession } from '@/lib/auth/session.server';
import { ChatWorkspace } from '@/features/chat/ChatWorkspace';
export const metadata = { title: 'Chat' };
export default async function ChatPage() {
  await requireSession();
  return <ChatWorkspace />;
}
