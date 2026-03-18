import { db } from '@/lib/db/client';
import { draftSections, sessions } from '@/lib/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';

export async function upsertDraftSection(data: {
  sessionId: string;
  component: string;
  sectionOrder: number;
  title: string;
  content: string;
  version: number;
  sourceResponseIds?: string[];
}) {
  // Delete existing section for this component/session, then insert fresh
  await db
    .delete(draftSections)
    .where(
      and(
        eq(draftSections.sessionId, data.sessionId),
        eq(draftSections.component, data.component)
      )
    );

  const [section] = await db.insert(draftSections).values(data).returning();
  return section;
}

export async function getDraftSectionsBySession(sessionId: string) {
  return db
    .select()
    .from(draftSections)
    .where(eq(draftSections.sessionId, sessionId))
    .orderBy(asc(draftSections.sectionOrder));
}

export async function updateSessionDraft(
  sessionId: string,
  constitutionDraft: string
) {
  await db
    .update(sessions)
    .set({
      constitutionDraft,
      constitutionVersion: sql`${sessions.constitutionVersion} + 1`,
      phase: 'drafting',
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));
}
