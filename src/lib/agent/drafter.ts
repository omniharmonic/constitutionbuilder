import { getAnthropicClient, MODELS } from './client';
import { buildDrafterSystemPrompt } from './prompts/system-drafter';
import { CONSTITUTION_COMPONENTS } from '@/lib/constitution/components';
import { getTaggedResponsesBySession } from '@/lib/db/queries/tagged-responses';
import { upsertDraftSection, updateSessionDraft } from '@/lib/db/queries/drafts';
import { assembleConstitutionMarkdown } from '@/lib/constitution/markdown';
import { getSessionParticipants } from '@/lib/db/queries/sessions';

export interface DraftProgress {
  componentId: string;
  title: string;
  status: 'pending' | 'processing' | 'complete' | 'insufficient_data';
}

export async function* generateDraft(
  sessionId: string,
  sessionName: string,
  sessionSlug: string,
  activeComponentIds?: string[]
): AsyncGenerator<DraftProgress, void, unknown> {
  const client = getAnthropicClient();

  const components = activeComponentIds
    ? CONSTITUTION_COMPONENTS.filter(c => activeComponentIds.includes(c.id))
    : CONSTITUTION_COMPONENTS;

  // Get all tagged responses for the session
  const allResponses = await getTaggedResponsesBySession(sessionId);
  const participants = await getSessionParticipants(sessionId);
  const activeParticipants = participants.filter(
    p => p.status === 'in_progress' || p.status === 'completed'
  );

  const draftSections: Array<{
    component: string;
    title: string;
    content: string;
  }> = [];

  for (let i = 0; i < components.length; i++) {
    const comp = components[i];

    yield {
      componentId: comp.id,
      title: comp.title,
      status: 'processing',
    };

    // Get responses for this component
    const componentResponses = allResponses.filter(
      r => r.component === comp.id
    );

    if (componentResponses.length === 0) {
      // No data — write placeholder
      const placeholderContent = `> *This section has not yet received participant input. It will be populated when participants discuss ${comp.title.toLowerCase()} topics during their conversations.*`;

      await upsertDraftSection({
        sessionId,
        component: comp.id,
        sectionOrder: i,
        title: comp.title,
        content: placeholderContent,
        version: 1,
      });

      draftSections.push({
        component: comp.id,
        title: comp.title,
        content: placeholderContent,
      });

      yield {
        componentId: comp.id,
        title: comp.title,
        status: 'insufficient_data',
      };
      continue;
    }

    // Build insights text for the prompt
    const insightsText = componentResponses
      .map((r, idx) => `[${idx + 1}] (confidence: ${r.confidence}, tag: ${r.tag})\n${r.content}`)
      .join('\n\n');

    const uniqueParticipants = new Set(componentResponses.map(r => r.participantId));

    try {
      const systemPrompt = buildDrafterSystemPrompt({
        sessionName,
        componentId: comp.id,
        participantCount: uniqueParticipants.size,
      });

      const response = await client.messages.create({
        model: MODELS.drafter,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Here are ${componentResponses.length} tagged insights from ${uniqueParticipants.size} participant(s) for the ${comp.title} component:\n\n${insightsText}\n\nWrite the ${comp.title} section of the constitution based on these insights.`,
          },
        ],
      });

      const textBlock = response.content.find(b => b.type === 'text');
      const content = textBlock?.type === 'text' ? textBlock.text : '> *Draft generation failed for this section.*';

      await upsertDraftSection({
        sessionId,
        component: comp.id,
        sectionOrder: i,
        title: comp.title,
        content,
        version: 1,
        sourceResponseIds: componentResponses.map(r => r.id),
      });

      draftSections.push({
        component: comp.id,
        title: comp.title,
        content,
      });

      yield {
        componentId: comp.id,
        title: comp.title,
        status: 'complete',
      };
    } catch (error) {
      console.error(`[Drafter] Error generating ${comp.id}:`, error);

      const errorContent = `> *An error occurred while generating this section. Please try regenerating the draft.*`;

      await upsertDraftSection({
        sessionId,
        component: comp.id,
        sectionOrder: i,
        title: comp.title,
        content: errorContent,
        version: 1,
      });

      draftSections.push({
        component: comp.id,
        title: comp.title,
        content: errorContent,
      });

      yield {
        componentId: comp.id,
        title: comp.title,
        status: 'insufficient_data',
      };
    }
  }

  // Assemble full markdown and save to session
  const fullMarkdown = assembleConstitutionMarkdown(draftSections, {
    sessionName,
    slug: sessionSlug,
    version: 1,
    participantCount: activeParticipants.length,
  });

  await updateSessionDraft(sessionId, fullMarkdown);
}
