import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getSessionById } from '@/lib/db/queries/sessions';
import { generateConstitutionZip } from '@/lib/constitution/export';
import slugify from 'slugify';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const sessionId = request.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.constitutionDraft) {
      return NextResponse.json({ error: 'No draft available' }, { status: 400 });
    }

    const zipBuffer = await generateConstitutionZip(
      session.name,
      session.constitutionDraft,
      session.constitutionVersion ?? 1
    );

    const safeName = slugify(session.name, { lower: true, strict: true });

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeName}-constitution-v${session.constitutionVersion ?? 1}.zip"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
