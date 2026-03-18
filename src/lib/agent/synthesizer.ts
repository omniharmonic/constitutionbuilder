import { getAnthropicClient, MODELS } from './client';
import { buildSynthesizerSystemPrompt } from './prompts/system-synthesizer';
import { getUnsynthesizedFeedback, markFeedbackSynthesized } from '@/lib/db/queries/feedback';
import { getDraftSectionsBySession, upsertDraftSection, updateSessionDraft } from '@/lib/db/queries/drafts';
import { getSessionById, getSessionParticipants } from '@/lib/db/queries/sessions';
import { assembleConstitutionMarkdown } from '@/lib/constitution/markdown';
import { getComponentById } from '@/lib/constitution/components';

export interface SynthesisProgress {
  componentId: string;
  title: string;
  status: 'pending' | 'processing' | 'revised' | 'unchanged' | 'error';
  feedbackCount: number;
}

export async function* runSynthesis(
  sessionId: string
): AsyncGenerator<SynthesisProgress, void, unknown> {
  const client = getAnthropicClient();

  const session = await getSessionById(sessionId);
  if (!session) throw new Error('Session not found');

  const allFeedback = await getUnsynthesizedFeedback(sessionId);
  if (allFeedback.length === 0) return;

  const draftSections = await getDraftSectionsBySession(sessionId);
  const participants = await getSessionParticipants(sessionId);
  const activeParticipants = participants.filter(
    p => p.status === 'in_progress' || p.status === 'completed'
  );

  // Group feedback by component
  const feedbackByComponent = new Map<string, typeof allFeedback>();
  for (const item of allFeedback) {
    const comp = item.component || 'general';
    if (!feedbackByComponent.has(comp)) feedbackByComponent.set(comp, []);
    feedbackByComponent.get(comp)!.push(item);
  }

  // Process each component that has feedback
  for (const [component, componentFeedback] of feedbackByComponent) {
    const compDef = getComponentById(component);
    const title = compDef?.title || component;

    yield {
      componentId: component,
      title,
      status: 'processing',
      feedbackCount: componentFeedback.length,
    };

    // Find the current draft section
    const currentSection = draftSections.find(s => s.component === component);
    if (!currentSection) {
      yield { componentId: component, title, status: 'unchanged', feedbackCount: componentFeedback.length };
      await markFeedbackSynthesized(componentFeedback.map(f => f.id));
      continue;
    }

    // Build feedback text
    const feedbackText = componentFeedback
      .map((f, i) => `[${i + 1}] Type: ${f.feedbackType}\n${f.content}`)
      .join('\n\n');

    try {
      const systemPrompt = buildSynthesizerSystemPrompt(session.name, title);

      const response = await client.messages.create({
        model: MODELS.synthesizer,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `## Current Draft for ${title}\n\n${currentSection.content}\n\n## Feedback (${componentFeedback.length} items)\n\n${feedbackText}\n\nProduce the revised section.`,
          },
        ],
      });

      const textBlock = response.content.find(b => b.type === 'text');
      const revisedContent = textBlock?.type === 'text' ? textBlock.text : currentSection.content;

      // Check if content actually changed
      const changed = revisedContent.trim() !== currentSection.content.trim();

      if (changed) {
        await upsertDraftSection({
          sessionId,
          component,
          sectionOrder: currentSection.sectionOrder,
          title: currentSection.title,
          content: revisedContent,
          version: (currentSection.version ?? 1) + 1,
        });
      }

      // Mark feedback as synthesized
      await markFeedbackSynthesized(componentFeedback.map(f => f.id));

      yield {
        componentId: component,
        title,
        status: changed ? 'revised' : 'unchanged',
        feedbackCount: componentFeedback.length,
      };
    } catch (error) {
      console.error(`[Synthesizer] Error for ${component}:`, error);
      yield {
        componentId: component,
        title,
        status: 'error',
        feedbackCount: componentFeedback.length,
      };
    }
  }

  // Reassemble full markdown
  const updatedSections = await getDraftSectionsBySession(sessionId);
  const fullMarkdown = assembleConstitutionMarkdown(
    updatedSections.map(s => ({
      component: s.component,
      title: s.title,
      content: s.content,
    })),
    {
      sessionName: session.name,
      slug: session.slug,
      version: (session.constitutionVersion ?? 1) + 1,
      participantCount: activeParticipants.length,
    }
  );

  await updateSessionDraft(sessionId, fullMarkdown);
}
