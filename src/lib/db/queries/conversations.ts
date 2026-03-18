import { db } from '@/lib/db/client';
import { conversations, users, sessionParticipants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function findOrCreateParticipant(data: {
  sessionId: string;
  displayName: string;
  email?: string;
}) {
  const { sessionId, displayName, email } = data;

  // Check for returning participant by email
  if (email) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      const [existingParticipant] = await db
        .select()
        .from(sessionParticipants)
        .where(
          and(
            eq(sessionParticipants.sessionId, sessionId),
            eq(sessionParticipants.userId, existingUser.id)
          )
        )
        .limit(1);

      if (existingParticipant) {
        // Find existing conversation
        const [existingConversation] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.participantId, existingParticipant.id))
          .limit(1);

        return {
          user: existingUser,
          participant: existingParticipant,
          conversation: existingConversation || null,
          isReturning: true,
        };
      }
    }
  }

  // Create new user
  const [user] = await db
    .insert(users)
    .values({
      email: email || null,
      displayName,
      role: 'participant',
    })
    .returning();

  // Create participant record
  const [participant] = await db
    .insert(sessionParticipants)
    .values({
      sessionId,
      userId: user.id,
      status: 'in_progress',
      startedAt: new Date(),
    })
    .returning();

  // Create conversation
  const [conversation] = await db
    .insert(conversations)
    .values({
      sessionId,
      participantId: participant.id,
      phase: 'survey',
      status: 'active',
    })
    .returning();

  return {
    user,
    participant,
    conversation,
    isReturning: false,
  };
}

export async function getConversationById(id: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return conversation || null;
}
