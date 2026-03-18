import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getSessionById, updateSession, deleteSession } from '@/lib/db/queries/sessions';

export async function GET(
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

    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await segmentData.params;
    const body = await request.json();

    const updated = await updateSession(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await segmentData.params;
    await deleteSession(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
