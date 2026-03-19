import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getSessionById } from '@/lib/db/queries/sessions';
import { db } from '@/lib/db/client';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
      return NextResponse.json(
        { error: 'Finalized sessions cannot be reopened' },
        { status: 400 }
      );
    }

    if (session.phase === 'survey') {
      return NextResponse.json(
        { error: 'Session is already in survey phase' },
        { status: 400 }
      );
    }

    // Phase transition only — no data is deleted
    await db
      .update(sessions)
      .set({ phase: 'survey', updatedAt: new Date() })
      .where(eq(sessions.id, id));

    return NextResponse.json({ success: true, previousPhase: session.phase });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to reopen survey' }, { status: 500 });
  }
}
