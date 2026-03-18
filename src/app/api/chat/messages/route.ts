import { NextRequest, NextResponse } from 'next/server';
import { getParticipantFromCookie } from '@/lib/utils/tokens';
import { getConversationById } from '@/lib/db/queries/conversations';
import { getMessagesByConversation } from '@/lib/db/queries/messages';

export async function GET(request: NextRequest) {
  const participant = await getParticipantFromCookie();
  if (!participant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const conversationId = request.nextUrl.searchParams.get('conversationId');
  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
  }

  const conversation = await getConversationById(conversationId);
  if (!conversation || conversation.participantId !== participant.participantId) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const messages = await getMessagesByConversation(conversationId);

  return NextResponse.json({
    messages,
    status: conversation.status,
  });
}
