"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: Message[];
  streamingText: string;
  isStreaming: boolean;
}

export function MessageList({ messages, streamingText, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  // Track user scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      userScrolledUp.current = distanceFromBottom > 100;
    }

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll on new content (unless user scrolled up)
  useEffect(() => {
    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, streamingText]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 space-y-3 sm:space-y-4"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 39px, var(--color-stone-200) 39px, var(--color-stone-200) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, var(--color-stone-200) 39px, var(--color-stone-200) 40px)",
        backgroundSize: "40px 40px",
        backgroundPosition: "center center",
        opacity: 1,
      }}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isStreaming && streamingText && (
          <MessageBubble
            role="assistant"
            content={streamingText}
            isStreaming
          />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
