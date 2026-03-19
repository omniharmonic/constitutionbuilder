"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CoverageMap } from "@/components/admin/coverage-map";
import { ParticipantTable } from "@/components/admin/participant-table";

interface SessionDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phase: string;
  config: {
    activeComponents?: string[];
    requireEmail?: boolean;
  };
  constitutionDraft: string | null;
  constitutionVersion: number;
  createdAt: string;
  updatedAt: string;
}

const phaseBadgeVariant: Record<string, "default" | "blueprint" | "brass" | "success" | "caution"> = {
  survey: "blueprint",
  drafting: "brass",
  feedback: "caution",
  synthesis: "brass",
  finalized: "success",
};

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviting, setInviting] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [distributeResult, setDistributeResult] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<unknown[]>([]);
  const [participants, setParticipants] = useState<unknown[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/sessions/${params.id}`).then(r => r.json()),
      fetch(`/api/sessions/${params.id}/coverage`).then(r => r.json()).catch(() => ({ coverage: [] })),
      fetch(`/api/sessions/${params.id}/participants`).then(r => r.json()).catch(() => ({ participants: [] })),
    ]).then(([sessionData, coverageData, participantData]) => {
      setSession(sessionData.session || null);
      setCoverage(coverageData.coverage || []);
      setParticipants(participantData.participants || []);
    }).finally(() => setLoading(false));
  }, [params.id]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this session? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/sessions/${params.id}`, { method: "DELETE" });
      router.push("/admin");
    } catch {
      setDeleting(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-stone-400">Loading session...</div>;
  if (!session) return <div className="text-center py-12 text-stone-400">Session not found</div>;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const participantUrl = `${origin}/s/${session.slug}`;
  const feedbackUrl = `${origin}/s/${session.slug}/feedback`;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-950">{session.name}</h1>
            <Badge variant={phaseBadgeVariant[session.phase] || "default"}>
              {session.phase}
            </Badge>
          </div>
          {session.description && (
            <p className="text-stone-600 mt-2 text-sm sm:text-base">{session.description}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href={`/admin/sessions/${params.id}/responses`}>
            <Button variant="secondary" size="sm">Responses</Button>
          </a>
          <a href={`/admin/sessions/${params.id}/draft`}>
            <Button variant="secondary" size="sm">Draft</Button>
          </a>
          <a href={`/admin/sessions/${params.id}/feedback`}>
            <Button variant="secondary" size="sm">Feedback</Button>
          </a>
          {(session.phase === "drafting" || session.phase === "feedback" || session.phase === "synthesis") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!confirm("Re-open survey? Participants will be able to join and contribute again. All existing data (draft, feedback, responses) will be preserved.")) return;
                try {
                  const res = await fetch(`/api/sessions/${params.id}/reopen-survey`, { method: "POST" });
                  if (res.ok) {
                    const updated = await fetch(`/api/sessions/${params.id}`).then(r => r.json());
                    setSession(updated.session);
                  }
                } catch {}
              }}
            >
              Re-open Survey
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Process Controls — always visible, state-aware */}
      {session.phase !== "finalized" ? (
        <Card className="border-brass/30 bg-parchment/30">
          <CardHeader>
            <CardTitle>Process Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current phase indicator */}
            <p className="text-sm text-stone-600">
              {session.phase === "survey" && "Survey is open. Participants can join and contribute."}
              {session.phase === "drafting" && "Draft has been generated. Ready to distribute for feedback."}
              {session.phase === "feedback" && "Feedback phase is active. Participants are reviewing the draft."}
              {session.phase === "synthesis" && "Synthesis is in progress."}
            </p>

            {/* Feedback link — show whenever a draft exists */}
            {session.constitutionDraft && (
              <div>
                <p className="text-xs text-stone-400 mb-1.5">Feedback link (share with participants)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-stone-100 px-3 py-2 rounded-lg font-mono text-stone-800 overflow-x-auto">
                    {feedbackUrl}
                  </code>
                  <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(feedbackUrl)}>
                    Copy
                  </Button>
                </div>
              </div>
            )}

            {/* Action result message */}
            {distributeResult && (
              <div className="p-3 rounded-lg bg-success/10 text-success text-sm">{distributeResult}</div>
            )}

            {/* Action buttons — all available actions for current state */}
            <div className="flex gap-2 flex-wrap">
              {/* Generate / Regenerate Draft — available whenever there are responses */}
              <a href={`/admin/sessions/${params.id}/draft`}>
                <Button variant="secondary" size="sm">
                  {session.constitutionDraft ? "View / Regenerate Draft" : "Generate Draft"}
                </Button>
              </a>

              {/* Distribute for Feedback — available when draft exists */}
              {session.constitutionDraft && (
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!confirm("Distribute the draft for feedback? This will create feedback conversations for all active participants and transition to the feedback phase.")) return;
                    setDistributing(true);
                    setDistributeResult(null);
                    try {
                      const res = await fetch(`/api/feedback/distribute`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId: session.id }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setDistributeResult(
                          `Distributed! ${data.feedbackConversationsCreated} feedback conversation(s) created.${data.emailResults?.length > 0 ? ` ${data.emailResults.filter((r: {status:string}) => r.status === "sent").length} email(s) sent.` : " Share the feedback link with participants."}`
                        );
                        const updated = await fetch(`/api/sessions/${params.id}`).then(r => r.json());
                        setSession(updated.session);
                      } else {
                        setDistributeResult(data.error || "Distribution failed");
                      }
                    } catch {
                      setDistributeResult("Something went wrong");
                    } finally {
                      setDistributing(false);
                    }
                  }}
                  disabled={distributing}
                >
                  {distributing ? "Distributing..." : "Distribute for Feedback"}
                </Button>
              )}

              {/* Finalize — available when draft exists */}
              {session.constitutionDraft && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (!confirm("Finalize this constitution? This is irreversible — the document will be locked and distributed to all participants.")) return;
                    setFinalizing(true);
                    try {
                      const res = await fetch(`/api/sessions/${params.id}/finalize`, { method: "POST" });
                      if (res.ok) {
                        const updated = await fetch(`/api/sessions/${params.id}`).then(r => r.json());
                        setSession(updated.session);
                      }
                    } catch {} finally {
                      setFinalizing(false);
                    }
                  }}
                  disabled={finalizing}
                >
                  {finalizing ? "Finalizing..." : "Finalize Constitution"}
                </Button>
              )}

              {/* Download — available when draft exists */}
              {session.constitutionDraft && (
                <a href={`/api/export?sessionId=${session.id}`}>
                  <Button variant="ghost" size="sm">Download</Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-success/30 bg-success/5">
          <CardHeader>
            <CardTitle>Constitution Finalized</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-stone-600">
              This constitution has been finalized and is read-only.
            </p>
            <a href={`/api/export?sessionId=${session.id}`}>
              <Button variant="secondary" size="sm">Download Constitution</Button>
            </a>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{session.phase === "survey" ? "Participant Link" : "Survey Link"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-stone-100 px-3 py-2 rounded-lg font-mono text-stone-800 overflow-x-auto">
                {participantUrl}
              </code>
              <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(participantUrl)}>
                Copy
              </Button>
            </div>
            {session.phase !== "survey" && (
              <p className="text-xs text-stone-400 mt-2">Survey is closed. This link is for reference only.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-400">Created</span>
              <span className="text-stone-800">{new Date(session.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Phase</span>
              <span className="text-stone-800 capitalize">{session.phase}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Slug</span>
              <span className="text-stone-800 font-mono">{session.slug}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coverage Map</CardTitle>
        </CardHeader>
        <CardContent>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <CoverageMap coverage={coverage as any} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invite Participants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteEmails">Email Addresses (one per line)</Label>
            <Textarea
              id="inviteEmails"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              placeholder={"alice@example.com\nbob@example.com"}
              rows={3}
            />
          </div>
          {inviteResult && (
            <div className="p-3 rounded-lg bg-success/10 text-success text-sm">{inviteResult}</div>
          )}
          <Button
            onClick={async () => {
              const emails = inviteEmails.split("\n").map(e => e.trim()).filter(Boolean);
              if (emails.length === 0) return;
              setInviting(true);
              setInviteResult(null);
              try {
                const res = await fetch(`/api/sessions/${params.id}/invite`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ emails }),
                });
                const data = await res.json();
                if (res.ok) {
                  const sent = data.results.filter((r: { status: string }) => r.status === "sent").length;
                  const already = data.results.filter((r: { status: string }) => r.status === "already_invited").length;
                  setInviteResult(`${sent} sent${already > 0 ? `, ${already} already invited` : ""}`);
                  setInviteEmails("");
                }
              } catch {
                setInviteResult("Failed to send invitations");
              } finally {
                setInviting(false);
              }
            }}
            disabled={inviting || !inviteEmails.trim()}
          >
            {inviting ? "Sending..." : "Send Invitations"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ParticipantTable participants={participants as any} />
        </CardContent>
      </Card>
    </div>
  );
}
