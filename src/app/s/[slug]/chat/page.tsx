"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import { LogoWithText } from "@/components/shared/logo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [conversationStatus, setConversationStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversation() {
      try {
        // Get participant cookie data — the conversationId is in the JWT
        const res = await fetch("/api/chat/session");
        if (!res.ok) {
          setError("Please join the session first.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        const convId = data.conversationId;
        setConversationId(convId);

        // Load existing messages if any
        const messagesRes = await fetch(
          `/api/chat/messages?conversationId=${convId}`
        );
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setInitialMessages(messagesData.messages || []);
          setConversationStatus(messagesData.status || "active");
        }
      } catch {
        setError("Failed to load conversation.");
      } finally {
        setLoading(false);
      }
    }

    loadConversation();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-stone-400 animate-pulse">
          Loading your conversation...
        </p>
      </div>
    );
  }

  if (error || !conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-stone-600 text-lg">{error || "No active conversation found."}</p>
          <a
            href={`/s/${slug}`}
            className="text-blueprint hover:underline mt-2 inline-block"
          >
            Return to session entry
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto">
          <LogoWithText size="sm" />
        </div>
      </header>
      <ChatContainer
        conversationId={conversationId}
        initialMessages={initialMessages}
        conversationStatus={conversationStatus}
      />
    </div>
  );
}
