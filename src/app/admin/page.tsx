"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phase: string;
  createdAt: string;
  participantCount: number;
}

const phaseBadgeVariant: Record<string, "default" | "blueprint" | "brass" | "success" | "caution"> = {
  survey: "blueprint",
  drafting: "brass",
  feedback: "caution",
  synthesis: "brass",
  finalized: "success",
};

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950">Sessions</h1>
          <p className="text-stone-600 mt-1">Manage your constitution-building sessions</p>
        </div>
        <Button size="lg" onClick={() => window.location.href = "/admin/sessions/new"}>
          New Session
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-stone-400 text-lg">No sessions yet</p>
            <p className="text-stone-400 mt-1">Create your first constitution-building session to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <a key={session.id} href={`/admin/sessions/${session.id}`}>
              <Card className="hover:border-blueprint/30 transition-colors cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-display font-semibold text-stone-950">
                        {session.name}
                      </h2>
                      <Badge variant={phaseBadgeVariant[session.phase] || "default"}>
                        {session.phase}
                      </Badge>
                    </div>
                    {session.description && (
                      <p className="text-sm text-stone-600 line-clamp-1">{session.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-stone-400">
                    <div>{session.participantCount} participants</div>
                    <div>{new Date(session.createdAt).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
