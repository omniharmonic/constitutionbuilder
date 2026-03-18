"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TaggedResponse {
  id: string;
  tag: string;
  component: string;
  content: string;
  confidence: number;
  participantId: string;
  createdAt: string;
}

const SECTIONS = [
  { id: "identity", label: "Identity" },
  { id: "structure", label: "Structure" },
  { id: "protocols", label: "Protocols" },
];

export default function ResponseExplorerPage() {
  const params = useParams();
  const [responses, setResponses] = useState<TaggedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterComponent, setFilterComponent] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(`/api/sessions/${params.id}/responses`, window.location.origin);
    if (filterComponent) url.searchParams.set("component", filterComponent);

    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => setResponses(data.responses || []))
      .finally(() => setLoading(false));
  }, [params.id, filterComponent]);

  function confidenceBadge(confidence: number) {
    if (confidence >= 0.8) return <Badge variant="success">{confidence}</Badge>;
    if (confidence >= 0.5) return <Badge variant="brass">{confidence}</Badge>;
    return <Badge variant="default">{confidence}</Badge>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950">
            Tagged Responses
          </h1>
          <p className="text-stone-600 mt-1">
            Browse extracted constitutional insights
          </p>
        </div>
        <a href={`/admin/sessions/${params.id}`}>
          <Button variant="ghost">Back to Session</Button>
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterComponent === null ? "primary" : "ghost"}
          size="sm"
          onClick={() => { setFilterComponent(null); setLoading(true); }}
        >
          All ({responses.length})
        </Button>
        {SECTIONS.map((s) => (
          <Button
            key={s.id}
            variant={filterComponent?.startsWith(s.id) ? "primary" : "secondary"}
            size="sm"
            onClick={() => { setFilterComponent(s.id); setLoading(true); }}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading responses...</div>
      ) : responses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-stone-400">
              No tagged responses yet. Responses are extracted automatically as
              participants chat with the constitutional architect.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {responses.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="blueprint">{r.component}</Badge>
                      <span className="text-xs text-stone-400 font-mono">
                        {r.tag}
                      </span>
                      {confidenceBadge(r.confidence)}
                    </div>
                    <p className="text-sm text-stone-800 leading-relaxed">
                      {r.content}
                    </p>
                  </div>
                  <div className="text-xs text-stone-400 text-right shrink-0">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
