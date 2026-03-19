"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DraftProgress {
  componentId: string;
  title: string;
  status: "pending" | "processing" | "complete" | "insufficient_data";
}

interface SessionData {
  id: string;
  name: string;
  constitutionDraft: string | null;
  constitutionVersion: number;
  phase: string;
}

export default function DraftPage() {
  const params = useParams();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<DraftProgress[]>([]);

  useEffect(() => {
    fetch(`/api/sessions/${params.id}`)
      .then((r) => r.json())
      .then((data) => setSession(data.session || null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleGenerate() {
    if (!session) return;
    setGenerating(true);
    setProgress([]);

    try {
      const res = await fetch("/api/draft/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "progress") {
              setProgress((prev) => {
                const existing = prev.findIndex(p => p.componentId === event.componentId);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = event;
                  return updated;
                }
                return [...prev, event];
              });
            } else if (event.type === "done") {
              // Reload session to get the new draft
              fetch(`/api/sessions/${params.id}`)
                .then(r => r.json())
                .then(data => setSession(data.session));
            }
          } catch {
            // Skip unparseable
          }
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setGenerating(false);
    }
  }

  const statusIcon: Record<string, string> = {
    pending: "[ ]",
    processing: "[...]",
    complete: "[+]",
    insufficient_data: "[!]",
  };

  const statusColor: Record<string, string> = {
    pending: "text-stone-400",
    processing: "text-blueprint",
    complete: "text-success",
    insufficient_data: "text-caution",
  };

  if (loading) return <div className="text-center py-12 text-stone-400">Loading...</div>;
  if (!session) return <div className="text-center py-12 text-stone-400">Session not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-950">
            Constitution Draft
          </h1>
          <p className="text-stone-600 mt-1 text-sm sm:text-base">{session.name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {session.constitutionDraft && (
            <a href={`/api/export?sessionId=${session.id}`}>
              <Button variant="secondary">Download</Button>
            </a>
          )}
          <Button onClick={handleGenerate} disabled={generating}>
            {generating
              ? "Generating..."
              : session.constitutionDraft
                ? "Regenerate Draft"
                : "Raise the Frame"}
          </Button>
          <a href={`/admin/sessions/${params.id}`}>
            <Button variant="ghost">Back</Button>
          </a>
        </div>
      </div>

      {/* Progress indicator during generation */}
      {generating && progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {progress.map((p) => (
                <div key={p.componentId} className="flex items-center gap-3 text-sm">
                  <span className={`font-mono ${statusColor[p.status]}`}>
                    {statusIcon[p.status]}
                  </span>
                  <span className="text-stone-800">{p.title}</span>
                  {p.status === "processing" && (
                    <span className="text-xs text-blueprint animate-pulse">
                      Raising the frame...
                    </span>
                  )}
                  {p.status === "insufficient_data" && (
                    <Badge variant="caution">needs more input</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draft viewer */}
      {session.constitutionDraft ? (
        <Card>
          <CardContent className="py-8 px-8 max-w-none">
            <div className="prose prose-stone max-w-none font-body prose-headings:font-display prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-blockquote:border-brass prose-blockquote:text-stone-600 prose-blockquote:bg-parchment prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {session.constitutionDraft.replace(/^---[\s\S]*?---\n/, '')}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ) : !generating ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-stone-400 text-lg">No draft generated yet</p>
            <p className="text-stone-400 mt-1">
              Click &quot;Raise the Frame&quot; to generate a constitution draft from
              participant responses.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
