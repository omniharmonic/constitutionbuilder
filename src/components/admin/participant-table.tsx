"use client";

import { Badge } from "@/components/ui/badge";

interface Participant {
  id: string;
  displayName: string;
  email: string | null;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  messageCount: number;
  insightCount: number;
}

interface ParticipantTableProps {
  participants: Participant[];
}

const statusVariant: Record<string, "default" | "blueprint" | "success" | "caution"> = {
  invited: "default",
  in_progress: "blueprint",
  completed: "success",
};

export function ParticipantTable({ participants }: ParticipantTableProps) {
  if (participants.length === 0) {
    return (
      <p className="text-stone-400 text-sm py-4">
        No participants yet. Share the link or send email invitations.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: card layout */}
      <div className="sm:hidden space-y-3">
        {participants.map((p) => (
          <div key={p.id} className="border border-stone-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-stone-800">{p.displayName}</div>
                {p.email && <div className="text-xs text-stone-400">{p.email}</div>}
              </div>
              <Badge variant={statusVariant[p.status] || "default"}>
                {p.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-stone-500">
              <span>{p.messageCount} msgs</span>
              <span>{p.insightCount} insights</span>
              {p.startedAt && (
                <span>{new Date(p.startedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-400">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Started</th>
              <th className="pb-2 font-medium text-right">Messages</th>
              <th className="pb-2 font-medium text-right">Insights</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-b border-stone-100">
                <td className="py-2.5">
                  <div className="text-stone-800">{p.displayName}</div>
                  {p.email && (
                    <div className="text-xs text-stone-400">{p.email}</div>
                  )}
                </td>
                <td className="py-2.5">
                  <Badge variant={statusVariant[p.status] || "default"}>
                    {p.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="py-2.5 text-stone-600">
                  {p.startedAt ? new Date(p.startedAt).toLocaleDateString() : "—"}
                </td>
                <td className="py-2.5 text-right text-stone-600">{p.messageCount}</td>
                <td className="py-2.5 text-right text-stone-600">{p.insightCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
