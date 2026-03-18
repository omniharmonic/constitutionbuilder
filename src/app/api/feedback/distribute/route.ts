import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getSessionById, getSessionParticipants } from '@/lib/db/queries/sessions';
import { db } from '@/lib/db/client';
import { sessions, conversations, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getResendClient } from '@/lib/email/client';
import { buildDraftReadyHtml } from '@/lib/email/templates/draft-ready';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.constitutionDraft) {
      return NextResponse.json({ error: 'No draft to distribute' }, { status: 400 });
    }

    const participants = await getSessionParticipants(sessionId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const feedbackUrl = `${appUrl}/s/${session.slug}/feedback`;

    // Create feedback conversations for all active participants
    const activeParticipants = participants.filter(
      p => p.status === 'in_progress' || p.status === 'completed'
    );

    for (const participant of activeParticipants) {
      // Create feedback conversation
      await db.insert(conversations).values({
        sessionId,
        participantId: participant.id,
        phase: 'feedback',
        status: 'active',
      });
    }

    // Send emails to participants with email addresses (skip if no Resend key)
    const resend = getResendClient();
    const emailFrom = process.env.EMAIL_FROM || 'Constitution Builder <noreply@example.com>';
    const emailResults: { email: string; status: string }[] = [];

    if (resend) {
      for (const participant of activeParticipants) {
        const [user] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, participant.userId))
          .limit(1);

        if (!user?.email) continue;

        try {
          await resend.emails.send({
            from: emailFrom,
            to: user.email,
            subject: `Draft constitution ready for review: ${session.name}`,
            html: buildDraftReadyHtml({
              sessionName: session.name,
              feedbackUrl,
            }),
          });
          emailResults.push({ email: user.email, status: 'sent' });
        } catch {
          emailResults.push({ email: user.email, status: 'error' });
        }
      }
    }

    // Transition session phase to feedback
    await db
      .update(sessions)
      .set({ phase: 'feedback', updatedAt: new Date() })
      .where(eq(sessions.id, sessionId));

    return NextResponse.json({
      distributed: true,
      feedbackConversationsCreated: activeParticipants.length,
      emailResults,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
  }
}
