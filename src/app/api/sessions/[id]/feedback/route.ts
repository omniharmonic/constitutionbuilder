import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getFeedbackBySession, getFeedbackSummaryBySession } from '@/lib/db/queries/feedback';

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await segmentData.params;
    const detail = request.nextUrl.searchParams.get('detail') === 'true';

    if (detail) {
      const component = request.nextUrl.searchParams.get('component') || undefined;
      const items = await getFeedbackBySession(id, { component });
      return NextResponse.json({ feedback: items });
    }

    const summary = await getFeedbackSummaryBySession(id);
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
