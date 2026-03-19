import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { db } from '@/lib/db/client';
import { sessionParticipants, users, messages, conversations, taggedResponses } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSessionById } from '@/lib/db/queries/sessions';
import { findOrCreateParticipant } from '@/lib/db/queries/conversations';
import { createParticipantToken, setParticipantCookie } from '@/lib/utils/tokens';

export async function GET(
  _request: Request,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await segmentData.params;

    const participants = await db
      .select({
        id: sessionParticipants.id,
        displayName: users.displayName,
        email: users.email,
        status: sessionParticipants.status,
        startedAt: sessionParticipants.startedAt,
        completedAt: sessionParticipants.completedAt,
        messageCount: sql<number>`(
          SELECT COUNT(*)::int FROM ${messages}
          JOIN ${conversations} ON ${conversations.id} = ${messages.conversationId}
          WHERE ${conversations.participantId} = ${sessionParticipants.id}
        )`,
        insightCount: sql<number>`(
          SELECT COUNT(*)::int FROM ${taggedResponses}
          WHERE ${taggedResponses.participantId} = ${sessionParticipants.id}
        )`,
      })
      .from(sessionParticipants)
      .innerJoin(users, eq(users.id, sessionParticipants.userId))
      .where(eq(sessionParticipants.sessionId, id))
      .orderBy(sessionParticipants.invitedAt);

    return NextResponse.json({ participants });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(
  request: Request,
  segmentData: { params: Promise<{ id: string }> }
) {
  const { id } = await segmentData.params;
  const body = await request.json();
  const { displayName, email } = body;

  if (!displayName) {
    return NextResponse.json(
      { error: 'Display name is required' },
      { status: 400 }
    );
  }

  const session = await getSessionById(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Allow joining during survey phase (new participants)
  // Allow re-authentication during feedback phase (returning participants only)
  if (session.phase !== 'survey' && session.phase !== 'feedback') {
    return NextResponse.json(
      { error: `This session is currently in the ${session.phase} phase` },
      { status: 400 }
    );
  }

  if (session.config?.requireEmail && !email) {
    return NextResponse.json(
      { error: 'Email is required for this session' },
      { status: 400 }
    );
  }

  const result = await findOrCreateParticipant({
    sessionId: id,
    displayName,
    email,
  });

  const token = await createParticipantToken({
    participantId: result.participant.id,
    sessionId: id,
    userId: result.user.id,
    conversationId: result.conversation!.id,
  });

  await setParticipantCookie(token);

  return NextResponse.json({
    participantId: result.participant.id,
    conversationId: result.conversation!.id,
    isReturning: result.isReturning,
  });
}
