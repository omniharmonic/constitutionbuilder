import { NextResponse } from 'next/server';
import { getConversationById } from '@/lib/db/queries/conversations';
import { getSessionById } from '@/lib/db/queries/sessions';
import { getMessagesByConversation, insertMessage, updateConversationLastActive } from '@/lib/db/queries/messages';
import { streamFeedbackResponse, triggerFeedbackClassification } from '@/lib/agent/feedback';
import { createSSEStream } from '@/lib/utils/stream';
import { getParticipantFromCookie } from '@/lib/utils/tokens';

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

  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  if (conversation.participantId !== participant.participantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (conversation.phase !== 'feedback') {
    return NextResponse.json({ error: 'This is not a feedback conversation' }, { status: 400 });
  }

  const session = await getSessionById(conversation.sessionId);
  if (!session || !session.constitutionDraft) {
    return NextResponse.json({ error: 'Session or draft not found' }, { status: 404 });
  }

  const history = await getMessagesByConversation(conversationId);

  await insertMessage({
    conversationId,
    role: 'user',
    content: message.trim(),
  });

  const stream = createSSEStream(
    () =>
      streamFeedbackResponse(
        history.map((m) => ({ role: m.role, content: m.content })),
        message.trim(),
        session.name,
        session.constitutionDraft!
      ),
    async (fullResponse) => {
      await insertMessage({
        conversationId,
        role: 'assistant',
        content: fullResponse,
      });

      await updateConversationLastActive(conversationId);

      // Classify feedback (awaited so it completes before function terminates)
      await triggerFeedbackClassification({
        conversationId,
        sessionId: conversation.sessionId,
        participantId: conversation.participantId,
        userMessage: message.trim(),
        assistantMessage: fullResponse,
      }).catch(() => {});
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
