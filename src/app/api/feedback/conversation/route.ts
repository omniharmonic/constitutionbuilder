import { NextRequest, NextResponse } from 'next/server';
import { getParticipantFromCookie } from '@/lib/utils/tokens';
import { findFeedbackConversation } from '@/lib/db/queries/feedback';
import { getSessionById } from '@/lib/db/queries/sessions';

export async function GET(request: NextRequest) {
  const participant = await getParticipantFromCookie();
  if (!participant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get('sessionId');
  const participantId = request.nextUrl.searchParams.get('participantId');

  if (!sessionId || !participantId) {
    return NextResponse.json({ error: 'sessionId and participantId required' }, { status: 400 });
  }

  if (participantId !== participant.participantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const conversation = await findFeedbackConversation(sessionId, participantId);
  if (!conversation) {
    return NextResponse.json({ error: 'No feedback conversation found' }, { status: 404 });
  }

  const session = await getSessionById(sessionId);

  return NextResponse.json({
    conversationId: conversation.id,
    draft: session?.constitutionDraft || null,
  });
}
