import { db } from '@/lib/db/client';
import { messages, conversations } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getMessagesByConversation(conversationId: string) {
  return db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

export async function insertMessage(data: {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
}) {
  const [message] = await db
    .insert(messages)
    .values(data)
    .returning();
  return message;
}

export async function updateConversationLastActive(conversationId: string) {
  await db
    .update(conversations)
    .set({ lastActiveAt: new Date() })
    .where(eq(conversations.id, conversationId));
}
