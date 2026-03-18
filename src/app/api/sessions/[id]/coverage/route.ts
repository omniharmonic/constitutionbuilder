import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getSessionCoverage } from '@/lib/db/queries/coverage';

export async function GET(
  _request: Request,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await segmentData.params;
    const coverage = await getSessionCoverage(id);
    return NextResponse.json({ coverage });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
