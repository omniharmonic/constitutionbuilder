import { getAnthropicClient, MODELS } from './client';
import { buildConversationSystemPrompt } from './prompts/system-conversation';
import type { ConversationAgentState, SessionConfig } from '@/lib/db/schema';

interface ConversationContext {
  session: {
    name: string;
    description?: string | null;
    config?: SessionConfig | null;
  };
  agentState: ConversationAgentState;
  coveredComponents: string[];
}

interface MessageEntry {
  role: 'user' | 'assistant';
  content: string;
}

export async function* streamConversationResponse(
  history: MessageEntry[],
  newMessage: string,
  context: ConversationContext
): AsyncGenerator<string, string, unknown> {
  const client = getAnthropicClient();

  const systemPrompt = buildConversationSystemPrompt(
    context.session,
    context.agentState,
    context.coveredComponents
  );

  const messages = [
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: newMessage },
  ];

  let fullResponse = '';

  try {
    const stream = client.messages.stream({
      model: MODELS.conversation,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        fullResponse += event.delta.text;
        yield event.delta.text;
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    yield `\n\n[I encountered an issue: ${errorMessage}. Please try sending your message again.]`;
    fullResponse += `\n\n[Error: ${errorMessage}]`;
  }

  return fullResponse;
}
