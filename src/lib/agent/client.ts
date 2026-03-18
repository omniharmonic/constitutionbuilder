import Anthropic from '@anthropic-ai/sdk';

// Singleton client — reused across requests within a warm function invocation
let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return client;
}

// Model selection per Tech Architecture §4.1
export const MODELS = {
  conversation: 'claude-sonnet-4-5-20250929',
  tagger: 'claude-sonnet-4-5-20250929',
  drafter: 'claude-opus-4-6',
  synthesizer: 'claude-opus-4-6',
} as const;

// Transient error codes that should be retried
const RETRYABLE_STATUS_CODES = new Set([429, 500, 529]);

export async function streamWithRetry(
  params: Anthropic.MessageCreateParams,
  maxRetries = 3
) {
  const client = getAnthropicClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return client.messages.stream(params);
    } catch (error) {
      lastError = error as Error;

      // Only retry on transient errors
      if (
        error instanceof Anthropic.APIError &&
        RETRYABLE_STATUS_CODES.has(error.status)
      ) {
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * 2 ** attempt, 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // Non-retryable error — throw immediately
      throw error;
    }
  }

  throw lastError ?? new Error('Failed after retries');
}
