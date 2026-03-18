import { NextResponse } from 'next/server';
import { getSessionBySlug } from '@/lib/db/queries/sessions';

export async function GET(
  _request: Request,
  segmentData: { params: Promise<{ slug: string }> }
) {
  const { slug } = await segmentData.params;
  const session = await getSessionBySlug(slug);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    session: {
      id: session.id,
      name: session.name,
      description: session.description,
      phase: session.phase,
      config: session.config,
    },
  });
}
