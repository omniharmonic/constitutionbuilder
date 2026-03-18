"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const MAX_LENGTH = 4000;

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value.slice(0, MAX_LENGTH);
    setValue(newValue);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  const isNearLimit = value.length > MAX_LENGTH * 0.9;

  return (
    <div className="border-t border-stone-200 bg-white px-4 py-3">
      <div className="max-w-2xl mx-auto flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Share your thoughts..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-950 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blueprint focus:border-transparent disabled:opacity-50"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="md"
          className="shrink-0"
        >
          Send
        </Button>
      </div>
      {isNearLimit && (
        <p className="max-w-2xl mx-auto text-xs text-caution mt-1">
          {value.length}/{MAX_LENGTH} characters
        </p>
      )}
    </div>
  );
}
