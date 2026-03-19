"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const CONSTITUTION_COMPONENTS = [
  { id: "identity.vision", label: "Vision" },
  { id: "identity.purpose", label: "Purpose" },
  { id: "identity.mission", label: "Mission" },
  { id: "identity.worldview", label: "Worldview" },
  { id: "identity.mandates", label: "Mandates" },
  { id: "identity.values", label: "Values" },
  { id: "identity.pledge", label: "Pledge" },
  { id: "structure.roles", label: "Roles" },
  { id: "structure.membranes", label: "Membranes" },
  { id: "structure.assets", label: "Assets" },
  { id: "protocols.role", label: "Role Protocols" },
  { id: "protocols.membrane", label: "Membrane Protocols" },
  { id: "protocols.asset", label: "Asset Protocols" },
];

export default function NewSessionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requireEmail, setRequireEmail] = useState(false);
  const [activeComponents, setActiveComponents] = useState<string[]>(
    CONSTITUTION_COMPONENTS.map((c) => c.id)
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleComponent(id: string) {
    setActiveComponents((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          config: { activeComponents, requireEmail },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create session");
        return;
      }

      router.push(`/admin/sessions/${data.session.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Session</CardTitle>
          <CardDescription>
            Set up a constitution-building session for your group
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-tension/10 text-tension text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Session Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Community Land Trust Constitution"
                required
              />
              <p className="text-xs text-stone-400">
                This becomes the group name in the constitution
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Context about your group — this helps the AI facilitator understand your organization..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Active Constitution Components</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONSTITUTION_COMPONENTS.map((component) => (
                  <label
                    key={component.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={activeComponents.includes(component.id)}
                      onChange={() => toggleComponent(component.id)}
                      className="rounded border-stone-300 text-blueprint focus:ring-blueprint"
                    />
                    {component.label}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={requireEmail}
                onChange={(e) => setRequireEmail(e.target.checked)}
                className="rounded border-stone-300 text-blueprint focus:ring-blueprint"
              />
              Require email from participants
            </label>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Session"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
