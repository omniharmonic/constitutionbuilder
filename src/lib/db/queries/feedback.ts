import { db } from '@/lib/db/client';
import { feedback, conversations } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function insertFeedbackItems(
  items: Array<{
    sessionId: string;
    participantId: string;
    conversationId: string;
    component: string;
    feedbackType: 'agreement' | 'disagreement' | 'suggestion' | 'question' | 'concern';
    content: string;
  }>
) {
  if (items.length === 0) return;
  await db.insert(feedback).values(items);
}

export async function getFeedbackBySession(
  sessionId: string,
  filters?: { component?: string; synthesized?: boolean }
) {
  const conditions = [eq(feedback.sessionId, sessionId)];

  if (filters?.component) {
    conditions.push(eq(feedback.component, filters.component));
  }
  if (filters?.synthesized !== undefined) {
    conditions.push(eq(feedback.synthesized, filters.synthesized));
  }

  return db
    .select()
    .from(feedback)
    .where(and(...conditions))
    .orderBy(feedback.createdAt);
}

export async function getUnsynthesizedFeedback(sessionId: string) {
  return getFeedbackBySession(sessionId, { synthesized: false });
}

export async function markFeedbackSynthesized(feedbackIds: string[]) {
  if (feedbackIds.length === 0) return;

  for (const id of feedbackIds) {
    await db
      .update(feedback)
      .set({ synthesized: true })
      .where(eq(feedback.id, id));
  }
}

export async function getFeedbackSummaryBySession(sessionId: string) {
  const result = await db
    .select({
      component: feedback.component,
      feedbackType: feedback.feedbackType,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(feedback)
    .where(eq(feedback.sessionId, sessionId))
    .groupBy(feedback.component, feedback.feedbackType);

  return result;
}

export async function findFeedbackConversation(
  sessionId: string,
  participantId: string
) {
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.sessionId, sessionId),
        eq(conversations.participantId, participantId),
        eq(conversations.phase, 'feedback'),
        eq(conversations.status, 'active')
      )
    )
    .limit(1);
  return conv || null;
}
