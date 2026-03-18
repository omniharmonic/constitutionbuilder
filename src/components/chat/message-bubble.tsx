import { cn } from "@/lib/utils/cn";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-stone-100 text-stone-950 rounded-br-md"
            : "bg-parchment text-stone-800 rounded-bl-md"
        )}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-blueprint/60 ml-0.5 animate-pulse align-text-bottom" />
        )}
      </div>
    </div>
  );
}
