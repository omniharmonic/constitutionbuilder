import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getSessionById } from '@/lib/db/queries/sessions';
import { sendInviteEmail } from '@/lib/email/send';
import { db } from '@/lib/db/client';
import { users, sessionParticipants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: Request,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await segmentData.params;
    const body = await request.json();
    const { emails } = body as { emails: string[] };

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'At least one email address is required' },
        { status: 400 }
      );
    }

    const session = await getSessionById(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const participantUrl = `${appUrl}/s/${session.slug}`;

    const results: { email: string; status: 'sent' | 'already_invited' | 'error' }[] = [];

    for (const email of emails) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) continue;

      // Check if already invited
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, trimmedEmail))
        .limit(1);

      if (existingUser) {
        const [existingParticipant] = await db
          .select()
          .from(sessionParticipants)
          .where(
            and(
              eq(sessionParticipants.sessionId, id),
              eq(sessionParticipants.userId, existingUser.id)
            )
          )
          .limit(1);

        if (existingParticipant) {
          results.push({ email: trimmedEmail, status: 'already_invited' });
          continue;
        }
      }

      // Create user if needed
      let userId: string;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const [newUser] = await db
          .insert(users)
          .values({
            email: trimmedEmail,
            displayName: trimmedEmail.split('@')[0],
            role: 'participant',
          })
          .returning();
        userId = newUser.id;
      }

      // Create participant record
      await db.insert(sessionParticipants).values({
        sessionId: id,
        userId,
        status: 'invited',
      });

      // Send email
      try {
        await sendInviteEmail({
          to: trimmedEmail,
          sessionName: session.name,
          sessionDescription: session.description || undefined,
          participantUrl,
        });
        results.push({ email: trimmedEmail, status: 'sent' });
      } catch {
        results.push({ email: trimmedEmail, status: 'error' });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to send invitations' }, { status: 500 });
  }
}
