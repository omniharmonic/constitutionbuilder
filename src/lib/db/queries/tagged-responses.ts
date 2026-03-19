import { db } from '@/lib/db/client';
import { taggedResponses, conversations } from '@/lib/db/schema';
import { eq, and, like, sql } from 'drizzle-orm';
import type { ConversationAgentState } from '@/lib/db/schema';

export async function insertTaggedResponses(
  rows: Array<{
    conversationId: string;
    sessionId: string;
    participantId: string;
    phase: 'survey' | 'feedback';
    tag: string;
    component: string;
    content: string;
    confidence: number;
    rawMessageIds?: string[];
  }>
) {
  if (rows.length === 0) return;
  await db.insert(taggedResponses).values(rows);
}

export async function getTaggedResponsesBySession(
  sessionId: string,
  filters?: { component?: string; participantId?: string }
) {
  const conditions = [eq(taggedResponses.sessionId, sessionId)];

  if (filters?.component) {
    // Support both exact match (e.g. "identity.vision") and prefix match (e.g. "identity")
    if (filters.component.includes('.')) {
      conditions.push(eq(taggedResponses.component, filters.component));
    } else {
      conditions.push(like(taggedResponses.component, `${filters.component}.%`));
    }
  }
  if (filters?.participantId) {
    conditions.push(eq(taggedResponses.participantId, filters.participantId));
  }

  return db
    .select()
    .from(taggedResponses)
    .where(and(...conditions))
    .orderBy(taggedResponses.createdAt);
}

export async function getTaggedResponsesByConversation(conversationId: string) {
  return db
    .select()
    .from(taggedResponses)
    .where(eq(taggedResponses.conversationId, conversationId));
}

export async function updateConversationAgentState(
  conversationId: string,
  stateUpdate: Partial<ConversationAgentState>
) {
  // Merge new state with existing state
  const [conversation] = await db
    .select({ agentState: conversations.agentState })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  const currentState = conversation?.agentState ?? {};
  const newState: ConversationAgentState = {
    ...currentState,
    ...stateUpdate,
    // Merge covered components arrays
    coveredComponents: [
      ...new Set([
        ...(currentState.coveredComponents ?? []),
        ...(stateUpdate.coveredComponents ?? []),
      ]),
    ],
  };

  await db
    .update(conversations)
    .set({ agentState: newState })
    .where(eq(conversations.id, conversationId));
}
