import { NextResponse } from 'next/server';
import { getSessionFromCookie, clearSessionCookie } from '@/lib/auth/session';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const [user] = await db.select({
    id: users.id,
    email: users.email,
    displayName: users.displayName,
    role: users.role,
  }).from(users).where(eq(users.id, session.userId)).limit(1);

  if (!user) {
    await clearSessionCookie();
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
