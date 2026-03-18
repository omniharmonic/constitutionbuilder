import { getAnthropicClient, MODELS } from './client';
import { buildFeedbackSystemPrompt } from './prompts/system-feedback';
import { FEEDBACK_CLASSIFICATION_SCHEMA, type FeedbackClassificationResult } from './schemas/feedback-classification';
import { insertFeedbackItems } from '@/lib/db/queries/feedback';

interface MessageEntry {
  role: 'user' | 'assistant';
  content: string;
}

export async function* streamFeedbackResponse(
  history: MessageEntry[],
  newMessage: string,
  sessionName: string,
  constitutionDraft: string
): AsyncGenerator<string, string, unknown> {
  const client = getAnthropicClient();

  const systemPrompt = buildFeedbackSystemPrompt(sessionName, constitutionDraft);

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
    yield `\n\n[I encountered an issue: ${errorMessage}. Please try again.]`;
    fullResponse += `\n\n[Error: ${errorMessage}]`;
  }

  return fullResponse;
}

export async function triggerFeedbackClassification(input: {
  conversationId: string;
  sessionId: string;
  participantId: string;
  userMessage: string;
  assistantMessage: string;
}): Promise<void> {
  try {
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: MODELS.tagger,
      max_tokens: 1024,
      system: 'You classify participant feedback on a constitution draft into structured categories. Extract only feedback from the PARTICIPANT (user messages), not from the facilitator.',
      messages: [
        {
          role: 'user',
          content: `Classify the feedback in this exchange:\n\n**Participant said:**\n${input.userMessage}\n\n**Facilitator responded:**\n${input.assistantMessage}\n\nExtract any feedback items.`,
        },
      ],
      output_config: {
        format: {
          type: 'json_schema' as const,
          schema: FEEDBACK_CLASSIFICATION_SCHEMA.schema,
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') return;

    const result: FeedbackClassificationResult = JSON.parse(textBlock.text);

    if (result.feedbackItems.length > 0) {
      await insertFeedbackItems(
        result.feedbackItems.map((item) => ({
          sessionId: input.sessionId,
          participantId: input.participantId,
          conversationId: input.conversationId,
          component: item.component,
          feedbackType: item.feedbackType,
          content: item.content,
        }))
      );
    }
  } catch (error) {
    console.error('[Feedback Classifier] Error:', error instanceof Error ? error.message : error);
  }
}
