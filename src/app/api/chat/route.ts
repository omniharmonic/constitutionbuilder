import { NextResponse } from 'next/server';
import { getConversationById } from '@/lib/db/queries/conversations';
import { getSessionById } from '@/lib/db/queries/sessions';
import { getMessagesByConversation, insertMessage, updateConversationLastActive } from '@/lib/db/queries/messages';
import { streamConversationResponse } from '@/lib/agent/conversation';
import { createSSEStream } from '@/lib/utils/stream';
import { getParticipantFromCookie } from '@/lib/utils/tokens';
import { db } from '@/lib/db/client';
import { taggedResponses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { triggerTagging } from '@/lib/agent/tagger';

export const maxDuration = 120;

export async function POST(request: Request) {
  const participant = await getParticipantFromCookie();
  if (!participant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { conversationId, message } = body;

  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: 'conversationId and message are required' }, { status: 400 });
  }

  // Verify conversation belongs to this participant
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  if (conversation.participantId !== participant.participantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (conversation.status === 'completed') {
    return NextResponse.json({ error: 'Conversation is already completed' }, { status: 400 });
  }

  // Load session context
  const session = await getSessionById(conversation.sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Load message history
  const history = await getMessagesByConversation(conversationId);

  // Save user message immediately
  await insertMessage({
    conversationId,
    role: 'user',
    content: message.trim(),
  });

  // Build covered components from tagged responses
  const tagged = await db
    .select({ component: taggedResponses.component })
    .from(taggedResponses)
    .where(eq(taggedResponses.conversationId, conversationId));

  const coveredComponents = [...new Set(tagged.map(t => t.component))];

  // Create SSE stream
  const stream = createSSEStream(
    () =>
      streamConversationResponse(
        history.map((m) => ({ role: m.role, content: m.content })),
        message.trim(),
        {
          session: {
            name: session.name,
            description: session.description,
            config: session.config,
          },
          agentState: conversation.agentState ?? {},
          coveredComponents,
        }
      ),
    async (fullResponse) => {
      // Save assistant message
      await insertMessage({
        conversationId,
        role: 'assistant',
        content: fullResponse,
      });

      // Update last active timestamp
      await updateConversationLastActive(conversationId);

      // Trigger tagging pipeline asynchronously (fire-and-forget)
      triggerTagging({
        conversationId,
        sessionId: conversation.sessionId,
        participantId: conversation.participantId,
        phase: conversation.phase,
        userMessage: message.trim(),
        assistantMessage: fullResponse,
        currentComponent: conversation.agentState?.currentComponent,
        coveredComponents,
      }).catch(() => {
        // Tagging errors are silently logged inside triggerTagging
      });
    }
  );

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
