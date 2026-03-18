import { getAnthropicClient, MODELS } from './client';
import { buildTaggerSystemPrompt } from './prompts/system-tagger';
import { TAG_EXTRACTION_SCHEMA, type TagExtractionResult } from './schemas/tag-extraction';
import { getComponentFromTag } from '@/lib/constitution/tags';
import {
  insertTaggedResponses,
  updateConversationAgentState,
} from '@/lib/db/queries/tagged-responses';

interface TaggerInput {
  conversationId: string;
  sessionId: string;
  participantId: string;
  phase: 'survey' | 'feedback';
  userMessage: string;
  assistantMessage: string;
  currentComponent?: string;
  coveredComponents: string[];
}

export async function triggerTagging(input: TaggerInput): Promise<void> {
  try {
    const client = getAnthropicClient();

    const systemPrompt = buildTaggerSystemPrompt(
      input.currentComponent,
      input.coveredComponents
    );

    const response = await client.messages.create({
      model: MODELS.tagger,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is the latest exchange from the conversation:\n\n**Participant said:**\n${input.userMessage}\n\n**Facilitator responded:**\n${input.assistantMessage}\n\nExtract any constitutional insights and update the conversation state.`,
        },
      ],
      output_config: {
        format: {
          type: 'json_schema' as const,
          schema: TAG_EXTRACTION_SCHEMA.schema,
        },
      },
    });

    // Extract the text content
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') return;

    const result: TagExtractionResult = JSON.parse(textBlock.text);

    // Write tagged responses to database
    if (result.insights.length > 0) {
      await insertTaggedResponses(
        result.insights.map((insight) => ({
          conversationId: input.conversationId,
          sessionId: input.sessionId,
          participantId: input.participantId,
          phase: input.phase,
          tag: insight.tag,
          component: getComponentFromTag(insight.tag),
          content: insight.content,
          confidence: insight.confidence,
        }))
      );
    }

    // Update conversation agent state
    const stateUpdate = result.stateUpdate;
    await updateConversationAgentState(input.conversationId, {
      currentComponent: stateUpdate.currentComponent,
      coveredComponents: stateUpdate.newlyCoveredComponents,
      participantDepth: stateUpdate.participantDepth,
      conversationPhase: stateUpdate.conversationPhase,
      insightCount:
        (input.coveredComponents.length > 0 ? undefined : 0) ??
        undefined,
    });

    // Update insight count by reading current and adding
    // (simpler: just count from DB)
  } catch (error) {
    // Tagging failures should never affect the participant's experience
    console.error('[Tagger] Error:', error instanceof Error ? error.message : error);
  }
}
