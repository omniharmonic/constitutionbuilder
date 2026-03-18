"use client";

import { Button } from "@/components/ui/button";

interface PhaseControlsProps {
  phase: string;
  sessionId: string;
  onAction: (action: string) => void;
  disabled?: boolean;
}

const phaseActions: Record<string, { label: string; action: string; variant: "primary" | "secondary" }> = {
  survey: { label: "Raise the Frame", action: "generate_draft", variant: "primary" },
  drafting: { label: "Review the Plans", action: "start_feedback", variant: "primary" },
  feedback: { label: "Refine the Draft", action: "trigger_synthesis", variant: "primary" },
  synthesis: { label: "Set the Keystone", action: "finalize", variant: "primary" },
};

export function PhaseControls({ phase, onAction, disabled }: PhaseControlsProps) {
  const action = phaseActions[phase];
  if (!action) return null;

  return (
    <Button
      variant={action.variant}
      size="lg"
      onClick={() => onAction(action.action)}
      disabled={disabled}
    >
      {action.label}
    </Button>
  );
}
