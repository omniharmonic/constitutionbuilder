import { NextResponse } from 'next/server';
import { getParticipantFromCookie } from '@/lib/utils/tokens';
import { getConversationById } from '@/lib/db/queries/conversations';
import { db } from '@/lib/db/client';
import { conversations, sessionParticipants } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  const participant = await getParticipantFromCookie();
  if (!participant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { conversationId } = body;

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
  }

  const conversation = await getConversationById(conversationId);
  if (!conversation || conversation.participantId !== participant.participantId) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  if (conversation.status === 'completed') {
    return NextResponse.json({ error: 'Already completed' }, { status: 400 });
  }

  // Mark conversation as completed
  await db
    .update(conversations)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  // Update participant status and increment submission count
  await db
    .update(sessionParticipants)
    .set({
      status: 'completed',
      completedAt: new Date(),
      submissionCount: sql`${sessionParticipants.submissionCount} + 1`,
    })
    .where(eq(sessionParticipants.id, participant.participantId));

  return NextResponse.json({ success: true });
}
