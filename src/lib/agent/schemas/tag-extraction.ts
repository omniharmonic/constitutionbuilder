// JSON Schema for the tagger's structured output
// Enforced via Anthropic's output_config.format.json_schema

export const TAG_EXTRACTION_SCHEMA = {
  name: 'tag_extraction',
  strict: true,
  schema: {
    type: 'object' as const,
    properties: {
      insights: {
        type: 'array' as const,
        description: 'Extracted constitutional insights from this exchange. Empty array if the exchange is purely conversational with no constitutional signal.',
        items: {
          type: 'object' as const,
          properties: {
            tag: {
              type: 'string' as const,
              description: 'The tag from the taxonomy, e.g. "identity.vision.success_indicators"',
            },
            content: {
              type: 'string' as const,
              description: 'The extracted insight, summarized in the participant\'s own language. 1-3 sentences.',
            },
            confidence: {
              type: 'number' as const,
              description: 'Confidence score: 1.0 = explicit direct statement, 0.7 = clearly implied, 0.4 = inferred from context',
            },
          },
          required: ['tag', 'content', 'confidence'],
          additionalProperties: false,
        },
      },
      stateUpdate: {
        type: 'object' as const,
        description: 'Updates to the conversation agent state',
        properties: {
          currentComponent: {
            type: 'string' as const,
            description: 'The constitution component currently being explored, e.g. "identity.vision"',
          },
          newlyCoveredComponents: {
            type: 'array' as const,
            description: 'Components that were substantively explored in this exchange (have at least 2 quality insights)',
            items: { type: 'string' as const },
          },
          participantDepth: {
            type: 'string' as const,
            enum: ['new', 'active', 'core', 'leadership'],
            description: 'Inferred involvement level based on the depth and specificity of their answers',
          },
          conversationPhase: {
            type: 'string' as const,
            enum: ['opening', 'identity', 'structure', 'protocols', 'closing'],
            description: 'Current phase of the conversation arc',
          },
        },
        required: ['currentComponent', 'newlyCoveredComponents', 'participantDepth', 'conversationPhase'],
        additionalProperties: false,
      },
    },
    required: ['insights', 'stateUpdate'],
    additionalProperties: false,
  },
} as const;

// TypeScript type matching the schema
export interface TagExtractionResult {
  insights: Array<{
    tag: string;
    content: string;
    confidence: number;
  }>;
  stateUpdate: {
    currentComponent: string;
    newlyCoveredComponents: string[];
    participantDepth: 'new' | 'active' | 'core' | 'leadership';
    conversationPhase: 'opening' | 'identity' | 'structure' | 'protocols' | 'closing';
  };
}
