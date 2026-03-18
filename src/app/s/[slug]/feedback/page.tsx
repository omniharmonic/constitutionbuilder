"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { MessageList } from "@/components/chat/message-list";
import { InputBar } from "@/components/chat/input-bar";
import { DraftSidebar } from "@/components/chat/draft-sidebar";
import { LogoWithText } from "@/components/shared/logo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDraft, setShowDraft] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Get session info (for draft)
        const sessionRes = await fetch(`/api/sessions/by-slug/${slug}`);
        if (!sessionRes.ok) {
          setError("Session not found.");
          setLoading(false);
          return;
        }
        const sessionData = await sessionRes.json();

        // Get the full session with draft
        // We need the participant's feedback conversation
        const chatSessionRes = await fetch("/api/chat/session");
        if (!chatSessionRes.ok) {
          setError("Please join the session first.");
          setLoading(false);
          return;
        }
        const chatSession = await chatSessionRes.json();

        // Find the feedback conversation for this participant
        const feedbackConvRes = await fetch(
          `/api/feedback/conversation?sessionId=${chatSession.sessionId}&participantId=${chatSession.participantId}`
        );

        if (feedbackConvRes.ok) {
          const feedbackConvData = await feedbackConvRes.json();
          setConversationId(feedbackConvData.conversationId);
          setDraft(feedbackConvData.draft);

          // Load existing messages
          if (feedbackConvData.conversationId) {
            const msgRes = await fetch(
              `/api/chat/messages?conversationId=${feedbackConvData.conversationId}`
            );
            if (msgRes.ok) {
              const msgData = await msgRes.json();
              setMessages(msgData.messages || []);
            }
          }
        } else {
          setError("No feedback conversation found. The draft may not have been distributed yet.");
        }
      } catch {
        setError("Failed to load feedback session.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !conversationId) return;

      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingText("");

      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, message: content }),
        });

        if (!res.ok) throw new Error("Failed to send");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No stream");

        const decoder = new TextDecoder();
        let accumulated = "";
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
              if (event.type === "text") {
                accumulated += event.content;
                setStreamingText(accumulated);
              } else if (event.type === "done") {
                setMessages((prev) => [
                  ...prev,
                  { id: `assistant-${Date.now()}`, role: "assistant", content: accumulated },
                ]);
                setStreamingText("");
              }
            } catch {}
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: `error-${Date.now()}`, role: "assistant", content: "Something went wrong. Please try again." },
        ]);
        setStreamingText("");
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, isStreaming]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-stone-400 animate-pulse">Loading feedback session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-stone-600 text-lg">{error}</p>
          <a href={`/s/${slug}`} className="text-blueprint hover:underline mt-2 inline-block">
            Return to session
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm px-4 py-3 shrink-0 flex items-center justify-between">
        <LogoWithText size="sm" />
        <button
          onClick={() => setShowDraft(!showDraft)}
          className="text-sm text-blueprint hover:underline md:hidden"
        >
          {showDraft ? "Show Chat" : "Show Draft"}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div className={`flex flex-col ${draft ? "md:w-3/5" : "w-full"} ${showDraft ? "hidden md:flex" : "flex"} w-full`}>
          <MessageList
            messages={messages}
            streamingText={streamingText}
            isStreaming={isStreaming}
          />
          <InputBar onSend={sendMessage} disabled={isStreaming} />
        </div>

        {/* Draft sidebar */}
        {draft && (
          <div className={`md:w-2/5 ${showDraft ? "flex" : "hidden md:flex"} w-full flex-col`}>
            <DraftSidebar draft={draft} />
          </div>
        )}
      </div>
    </div>
  );
}
