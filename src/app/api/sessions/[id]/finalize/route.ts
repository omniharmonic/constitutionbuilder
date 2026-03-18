import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getSessionById, getSessionParticipants } from '@/lib/db/queries/sessions';
import { db } from '@/lib/db/client';
import { sessions, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getResendClient } from '@/lib/email/client';
import { buildFinalConstitutionHtml } from '@/lib/email/templates/final';

export async function POST(
  _request: Request,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await segmentData.params;

    const session = await getSessionById(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.phase === 'finalized') {
      return NextResponse.json({ error: 'Session is already finalized' }, { status: 400 });
    }

    if (!session.constitutionDraft) {
      return NextResponse.json({ error: 'No draft to finalize' }, { status: 400 });
    }

    // Transition to finalized
    await db
      .update(sessions)
      .set({ phase: 'finalized', updatedAt: new Date() })
      .where(eq(sessions.id, id));

    // Email final constitution to all participants with email
    const participants = await getSessionParticipants(id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const downloadUrl = `${appUrl}/api/export?sessionId=${id}`;
    const resend = getResendClient();
    const emailFrom = process.env.EMAIL_FROM || 'Constitution Builder <noreply@example.com>';

    const emailResults: { email: string; status: string }[] = [];

    if (resend) {
    for (const participant of participants) {
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
          subject: `${session.name} Constitution — Finalized`,
          html: buildFinalConstitutionHtml({
            sessionName: session.name,
            downloadUrl,
          }),
        });
        emailResults.push({ email: user.email, status: 'sent' });
      } catch {
        emailResults.push({ email: user.email, status: 'error' });
      }
    }
    }

    return NextResponse.json({
      finalized: true,
      emailResults,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Finalization failed' }, { status: 500 });
  }
}
