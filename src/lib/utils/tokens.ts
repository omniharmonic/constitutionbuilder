import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const PARTICIPANT_COOKIE = 'cb-participant';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export interface ParticipantPayload {
  participantId: string;
  sessionId: string;
  userId: string;
  conversationId: string;
}

export async function createParticipantToken(payload: ParticipantPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(getJwtSecret());
}

export async function verifyParticipantToken(token: string): Promise<ParticipantPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as ParticipantPayload;
  } catch {
    return null;
  }
}

export async function setParticipantCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(PARTICIPANT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function getParticipantFromCookie(): Promise<ParticipantPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PARTICIPANT_COOKIE)?.value;
  if (!token) return null;
  return verifyParticipantToken(token);
}
