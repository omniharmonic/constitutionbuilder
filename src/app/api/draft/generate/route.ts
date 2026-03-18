import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getSessionById, getSessionParticipants } from '@/lib/db/queries/sessions';
import { generateDraft } from '@/lib/agent/drafter';
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

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Guard: check for active participants
    const participants = await getSessionParticipants(sessionId);
    const activeParticipants = participants.filter(
      p => p.status === 'in_progress' || p.status === 'completed'
    );
    if (activeParticipants.length === 0) {
      return NextResponse.json(
        { error: 'No participants have contributed yet. Wait for at least one participant to complete their conversation before generating a draft.' },
        { status: 400 }
      );
    }

    const activeComponents = session.config?.activeComponents;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const progress of generateDraft(
            sessionId,
            session.name,
            session.slug,
            activeComponents
          )) {
            controller.enqueue(
              encoder.encode(encodeSSE({ type: 'progress', ...progress }))
            );
          }

          controller.enqueue(
            encoder.encode(encodeSSE({ type: 'done' }))
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Generation failed';
          controller.enqueue(
            encoder.encode(encodeSSE({ type: 'error', message }))
          );
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
