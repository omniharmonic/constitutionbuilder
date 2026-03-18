import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getTaggedResponsesBySession } from '@/lib/db/queries/tagged-responses';

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await segmentData.params;

    const component = request.nextUrl.searchParams.get('component') || undefined;
    const participantId = request.nextUrl.searchParams.get('participantId') || undefined;

    const responses = await getTaggedResponsesBySession(id, { component, participantId });
    return NextResponse.json({ responses });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
