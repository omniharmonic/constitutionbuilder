import { db } from '@/lib/db/client';
import { taggedResponses, sessionParticipants } from '@/lib/db/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { CONSTITUTION_COMPONENTS } from '@/lib/constitution/components';

export interface ComponentCoverage {
  componentId: string;
  title: string;
  section: string;
  responseCount: number;
  participantCount: number;
  totalActiveParticipants: number;
  coveragePercent: number;
  averageConfidence: number;
}

export async function getSessionCoverage(sessionId: string): Promise<ComponentCoverage[]> {
  // Count active participants (in_progress or completed)
  const [activeCount] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(sessionParticipants)
    .where(
      and(
        eq(sessionParticipants.sessionId, sessionId),
        or(
          eq(sessionParticipants.status, 'in_progress'),
          eq(sessionParticipants.status, 'completed')
        )
      )
    );

  const totalActive = activeCount?.count ?? 0;

  // Get per-component stats
  const componentStats = await db
    .select({
      component: taggedResponses.component,
      responseCount: sql<number>`COUNT(*)::int`,
      participantCount: sql<number>`COUNT(DISTINCT ${taggedResponses.participantId})::int`,
      averageConfidence: sql<number>`ROUND(AVG(${taggedResponses.confidence})::numeric, 2)`,
    })
    .from(taggedResponses)
    .where(eq(taggedResponses.sessionId, sessionId))
    .groupBy(taggedResponses.component);

  const statsMap = new Map(componentStats.map((s) => [s.component, s]));

  return CONSTITUTION_COMPONENTS.map((comp) => {
    const stats = statsMap.get(comp.id);
    const participantCount = stats?.participantCount ?? 0;
    const coveragePercent =
      totalActive > 0 ? Math.round((participantCount / totalActive) * 100) : 0;

    return {
      componentId: comp.id,
      title: comp.title,
      section: comp.section,
      responseCount: stats?.responseCount ?? 0,
      participantCount,
      totalActiveParticipants: totalActive,
      coveragePercent,
      averageConfidence: stats?.averageConfidence ?? 0,
    };
  });
}
