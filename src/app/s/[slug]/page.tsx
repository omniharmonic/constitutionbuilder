"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

interface SessionInfo {
  id: string;
  name: string;
  description: string | null;
  phase: string;
  config: {
    requireEmail?: boolean;
  };
}

export default function SessionEntryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/sessions/by-slug/${slug}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.session) setSession(data.session);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setError("");
    setJoining(true);

    try {
      const res = await fetch(`/api/sessions/${session.id}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email: email || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join session");
        return;
      }

      router.push(`/s/${slug}/chat`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <Logo size="lg" className="mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-stone-950">Session Not Found</h1>
            <p className="text-stone-600 mt-2">
              This session link may be invalid or expired.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (session && session.phase === "feedback") {
    // Feedback phase: show re-authentication form so participants can get
    // a fresh cookie and access the feedback chat
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <Logo size="lg" />
            <CardTitle className="text-2xl mt-4">{session.name}</CardTitle>
            <CardDescription>
              The draft constitution is ready for your review. Enter your details to continue.
            </CardDescription>
          </CardHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setJoining(true);
            try {
              const res = await fetch(`/api/sessions/${session.id}/participants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayName, email: email || undefined }),
              });
              const data = await res.json();
              if (!res.ok) {
                setError(data.error || "Could not find your participant record");
                return;
              }
              router.push(`/s/${slug}/feedback`);
            } catch {
              setError("Something went wrong. Please try again.");
            } finally {
              setJoining(false);
            }
          }}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-tension/10 text-tension text-sm">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="displayName">Your Name *</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we address you?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email you used before"
                />
                <p className="text-xs text-stone-400">
                  Enter the same email you used during the survey to access your feedback session
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={joining}>
                {joining ? "Loading..." : "Review the Draft"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    );
  }

  if (session && session.phase !== "survey") {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <Logo size="lg" className="mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-stone-950">{session.name}</h1>
            {session.phase === "finalized" ? (
              <p className="text-stone-600 mt-2">
                This constitution has been finalized. Thank you for your contribution.
              </p>
            ) : (
              <p className="text-stone-600 mt-2">
                This session is currently in the <strong>{session.phase}</strong> phase
                and is not accepting new participants at this time.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Logo size="lg" />
          <CardTitle className="text-2xl mt-4">{session?.name}</CardTitle>
          {session?.description && (
            <CardDescription>{session.description}</CardDescription>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-tension/10 text-tension text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="displayName">Your Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we address you?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email {session?.config?.requireEmail ? "*" : "(optional)"}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required={session?.config?.requireEmail}
              />
              <p className="text-xs text-stone-400">
                Used to save your progress and receive the draft constitution
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={joining}>
              {joining ? "Joining..." : "Begin Conversation"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
