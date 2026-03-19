import { db } from '@/lib/db/client';
import { conversations, users, sessionParticipants } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function findOrCreateParticipant(data: {
  sessionId: string;
  displayName: string;
  email?: string;
}) {
  const { sessionId, displayName, email } = data;

  // Check for returning participant by email
  if (email) {
    // Find all users with this email, then check if any are already participants
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    for (const existingUser of existingUsers) {
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
        // Find the most recent conversation for this participant
        const [existingConversation] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.participantId, existingParticipant.id))
          .orderBy(desc(conversations.startedAt))
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
