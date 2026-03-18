import { NextResponse } from 'next/server';
import { getParticipantFromCookie } from '@/lib/utils/tokens';

export async function GET() {
  const participant = await getParticipantFromCookie();
  if (!participant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    conversationId: participant.conversationId,
    participantId: participant.participantId,
    sessionId: participant.sessionId,
  });
}
