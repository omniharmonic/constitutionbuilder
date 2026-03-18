import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { createSession, getSessionsByAdmin } from '@/lib/db/queries/sessions';
import { generateSessionSlug } from '@/lib/utils/slugs';

export async function GET() {
  try {
    const session = await requireAdmin();
    const sessions = await getSessionsByAdmin(session.userId);
    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { name, description, config } = body;

    if (!name) {
      return NextResponse.json({ error: 'Session name is required' }, { status: 400 });
    }

    const slug = generateSessionSlug(name);

    const newSession = await createSession({
      name,
      slug,
      adminId: admin.userId,
      description,
      config,
    });

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
