import { getSessionFromCookie, type SessionPayload } from './session';

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSessionFromCookie();
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function getOptionalSession(): Promise<SessionPayload | null> {
  return getSessionFromCookie();
}
