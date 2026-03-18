export const FEEDBACK_CLASSIFICATION_SCHEMA = {
  name: 'feedback_classification',
  strict: true,
  schema: {
    type: 'object' as const,
    properties: {
      feedbackItems: {
        type: 'array' as const,
        description: 'Classified feedback items from this exchange. Empty array if the exchange is purely conversational.',
        items: {
          type: 'object' as const,
          properties: {
            component: {
              type: 'string' as const,
              description: 'The constitution component being discussed, e.g. "identity.vision"',
            },
            feedbackType: {
              type: 'string' as const,
              enum: ['agreement', 'disagreement', 'suggestion', 'question', 'concern'],
              description: 'The type of feedback',
            },
            content: {
              type: 'string' as const,
              description: 'Summarized feedback in the participant\'s own language. 1-3 sentences.',
            },
          },
          required: ['component', 'feedbackType', 'content'],
          additionalProperties: false,
        },
      },
    },
    required: ['feedbackItems'],
    additionalProperties: false,
  },
} as const;

export interface FeedbackClassificationResult {
  feedbackItems: Array<{
    component: string;
    feedbackType: 'agreement' | 'disagreement' | 'suggestion' | 'question' | 'concern';
    content: string;
  }>;
}
