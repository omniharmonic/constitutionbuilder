"use client";

import { cn } from "@/lib/utils/cn";

interface CoverageItem {
  componentId: string;
  title: string;
  section: string;
  responseCount: number;
  participantCount: number;
  totalActiveParticipants: number;
  coveragePercent: number;
  averageConfidence: number;
}

interface CoverageMapProps {
  coverage: CoverageItem[];
}

const sectionLabels: Record<string, string> = {
  identity: "Identity",
  structure: "Structure",
  protocols: "Protocols",
};

function coverageColor(percent: number): string {
  if (percent >= 70) return "bg-success";
  if (percent >= 30) return "bg-brass";
  return "bg-tension";
}

function coverageTextColor(percent: number): string {
  if (percent >= 70) return "text-success";
  if (percent >= 30) return "text-brass";
  return "text-tension";
}

export function CoverageMap({ coverage }: CoverageMapProps) {
  const sections = ["identity", "structure", "protocols"];

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const items = coverage.filter((c) => c.section === section);
        if (items.length === 0) return null;

        return (
          <div key={section}>
            <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wider mb-3">
              {sectionLabels[section]}
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.componentId}
                  className="bg-white rounded-lg border border-stone-200 p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-stone-800">
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        coverageTextColor(item.coveragePercent)
                      )}
                    >
                      {item.coveragePercent}%
                    </span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        coverageColor(item.coveragePercent)
                      )}
                      style={{ width: `${item.coveragePercent}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-1.5 text-xs text-stone-400">
                    <span>{item.responseCount} responses</span>
                    <span>
                      {item.participantCount}/{item.totalActiveParticipants}{" "}
                      participants
                    </span>
                    {item.averageConfidence > 0 && (
                      <span>
                        {item.averageConfidence} avg confidence
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
