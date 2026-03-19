"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FeedbackSummary {
  component: string;
  feedbackType: string;
  count: number;
}

interface FeedbackItem {
  id: string;
  component: string;
  feedbackType: string;
  content: string;
  createdAt: string;
}

const typeVariant: Record<string, "success" | "tension" | "brass" | "blueprint" | "caution"> = {
  agreement: "success",
  disagreement: "tension",
  suggestion: "brass",
  question: "blueprint",
  concern: "caution",
};

export default function FeedbackDashboardPage() {
  const params = useParams();
  const [summary, setSummary] = useState<FeedbackSummary[]>([]);
  const [details, setDetails] = useState<FeedbackItem[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions/${params.id}/feedback`)
      .then((r) => r.json())
      .then((data) => setSummary(data.summary || []))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function loadDetails(component: string) {
    setSelectedComponent(component);
    const res = await fetch(
      `/api/sessions/${params.id}/feedback?detail=true&component=${component}`
    );
    const data = await res.json();
    setDetails(data.feedback || []);
  }

  // Group summary by component
  const componentGroups = summary.reduce<Record<string, FeedbackSummary[]>>(
    (acc, item) => {
      const comp = item.component || "general";
      if (!acc[comp]) acc[comp] = [];
      acc[comp].push(item);
      return acc;
    },
    {}
  );

  const hasDisagreements = (items: FeedbackSummary[]) =>
    items.some((i) => i.feedbackType === "disagreement" || i.feedbackType === "concern");

  if (loading) return <div className="text-center py-12 text-stone-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-950">Feedback</h1>
          <p className="text-stone-600 mt-1 text-sm sm:text-base">Review participant feedback on the draft</p>
        </div>
        <a href={`/admin/sessions/${params.id}`}>
          <Button variant="ghost">Back to Session</Button>
        </a>
      </div>

      {Object.keys(componentGroups).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-stone-400">No feedback received yet. Distribute the draft to begin collecting feedback.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Object.entries(componentGroups).map(([component, items]) => (
            <Card
              key={component}
              className={`cursor-pointer hover:border-blueprint/30 transition-colors ${
                hasDisagreements(items) ? "border-tension/30" : ""
              }`}
              onClick={() => loadDetails(component)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-display font-semibold text-stone-800 text-sm sm:text-base">
                    {component}
                    {hasDisagreements(items) && (
                      <span className="ml-2 text-xs text-tension">needs attention</span>
                    )}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {items.map((item) => (
                      <Badge key={item.feedbackType} variant={typeVariant[item.feedbackType] || "default"}>
                        {item.count} {item.feedbackType}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail view */}
      {selectedComponent && details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedComponent} — Detail
              <button
                onClick={() => { setSelectedComponent(null); setDetails([]); }}
                className="text-sm text-stone-400 hover:text-stone-600 float-right font-normal"
              >
                Close
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {details.map((item) => (
              <div key={item.id} className="border-b border-stone-100 pb-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={typeVariant[item.feedbackType] || "default"}>
                    {item.feedbackType}
                  </Badge>
                  <span className="text-xs text-stone-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-stone-800">{item.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
