export function encodeSSE(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export function createSSEStream(
  generator: () => AsyncGenerator<string, string, unknown>,
  onComplete?: (fullResponse: string) => Promise<void>
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const gen = generator();
        let result = await gen.next();

        while (!result.done) {
          const chunk = result.value;
          controller.enqueue(
            encoder.encode(encodeSSE({ type: 'text', content: chunk }))
          );
          result = await gen.next();
        }

        // result.value contains the full response when done
        const fullResponse = result.value;

        controller.enqueue(
          encoder.encode(encodeSSE({ type: 'done' }))
        );

        if (onComplete) {
          await onComplete(fullResponse);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Stream error';
        controller.enqueue(
          encoder.encode(encodeSSE({ type: 'error', message }))
        );
      } finally {
        controller.close();
      }
    },
  });
}
