"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageList } from "./message-list";
import { InputBar } from "./input-bar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatContainerProps {
  conversationId: string;
  initialMessages?: Message[];
  conversationStatus?: string;
  onComplete?: () => void;
}

export function ChatContainer({
  conversationId,
  initialMessages = [],
  conversationStatus = "active",
  onComplete,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(conversationStatus === "completed");

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || isCompleted) return;

      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingText("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, message: content }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to send message");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            try {
              const event = JSON.parse(jsonStr);
              if (event.type === "text") {
                accumulated += event.content;
                setStreamingText(accumulated);
              } else if (event.type === "done") {
                // Finalize: add assistant message, clear streaming
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: accumulated,
                  },
                ]);
                setStreamingText("");
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Something went wrong";
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: `I'm sorry, I encountered an issue: ${errorMsg}. Please try again.`,
          },
        ]);
        setStreamingText("");
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, isStreaming, isCompleted]
  );

  async function handleComplete() {
    try {
      const res = await fetch("/api/chat/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      if (res.ok) {
        setIsCompleted(true);
        onComplete?.();
      }
    } catch {
      // Silently fail — user can retry
    }
  }

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        streamingText={streamingText}
        isStreaming={isStreaming}
      />

      {isCompleted ? (
        <div className="border-t border-stone-200 bg-parchment px-4 py-6 text-center">
          <p className="text-stone-600 font-display text-lg">
            Conversation complete
          </p>
          <p className="text-stone-400 text-sm mt-1">
            Your contributions have been recorded. You&apos;ll receive the draft
            constitution when it&apos;s ready.
          </p>
        </div>
      ) : (
        <>
          {messages.length > 6 && !isStreaming && (
            <div className="flex justify-center py-2 bg-white border-t border-stone-100">
              <button
                onClick={handleComplete}
                className="text-sm text-blueprint hover:underline"
              >
                I&apos;m done — complete my conversation
              </button>
            </div>
          )}
          <InputBar onSend={sendMessage} disabled={isStreaming} />
        </>
      )}
    </div>
  );
}
