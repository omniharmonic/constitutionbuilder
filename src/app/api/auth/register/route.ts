import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/hash';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, displayName } = body;

  if (!email || !password || !displayName) {
    return NextResponse.json(
      { error: 'Email, password, and display name are required' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'An account with this email already exists' },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db.insert(users).values({
    email,
    displayName,
    passwordHash,
    role: 'admin',
  }).returning();

  const token = await createSessionToken({
    userId: user.id,
    email: user.email!,
    role: 'admin',
  });

  await setSessionCookie(token);

  return NextResponse.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
}
