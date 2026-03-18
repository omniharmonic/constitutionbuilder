import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { runSynthesis } from '@/lib/agent/synthesizer';
import { encodeSSE } from '@/lib/utils/stream';

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const progress of runSynthesis(sessionId)) {
            controller.enqueue(
              encoder.encode(encodeSSE({ type: 'progress', ...progress }))
            );
          }

          controller.enqueue(encoder.encode(encodeSSE({ type: 'done' })));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Synthesis failed';
          controller.enqueue(encoder.encode(encodeSSE({ type: 'error', message })));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
