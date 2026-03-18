import { db } from '@/lib/db/client';
import { sessions, sessionParticipants, type SessionConfig } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function createSession(data: {
  name: string;
  slug: string;
  adminId: string;
  description?: string;
  config?: SessionConfig;
}) {
  const [session] = await db.insert(sessions).values(data).returning();
  return session;
}

export async function getSessionsByAdmin(adminId: string) {
  const result = await db
    .select({
      id: sessions.id,
      name: sessions.name,
      slug: sessions.slug,
      description: sessions.description,
      phase: sessions.phase,
      createdAt: sessions.createdAt,
      updatedAt: sessions.updatedAt,
      participantCount: sql<number>`(
        SELECT COUNT(*)::int FROM session_participants
        WHERE session_id = ${sessions.id}
      )`,
    })
    .from(sessions)
    .where(eq(sessions.adminId, adminId))
    .orderBy(desc(sessions.createdAt));
  return result;
}

export async function getSessionById(id: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  return session || null;
}

export async function getSessionBySlug(slug: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.slug, slug))
    .limit(1);
  return session || null;
}

export async function updateSession(id: string, data: {
  name?: string;
  description?: string;
  config?: SessionConfig;
  phase?: typeof sessions.phase.enumValues[number];
}) {
  const [updated] = await db
    .update(sessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sessions.id, id))
    .returning();
  return updated;
}

export async function deleteSession(id: string) {
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function getSessionParticipants(sessionId: string) {
  return db
    .select()
    .from(sessionParticipants)
    .where(eq(sessionParticipants.sessionId, sessionId));
}
