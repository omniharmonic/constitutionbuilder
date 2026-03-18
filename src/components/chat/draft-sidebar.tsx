"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DraftSidebarProps {
  draft: string;
}

export function DraftSidebar({ draft }: DraftSidebarProps) {
  // Strip YAML frontmatter
  const content = draft.replace(/^---[\s\S]*?---\n/, "");

  return (
    <div className="h-full overflow-y-auto bg-parchment border-l border-stone-200 p-6">
      <div className="prose prose-sm prose-stone max-w-none font-body prose-headings:font-display prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-blockquote:border-brass prose-blockquote:text-stone-600 prose-blockquote:bg-white/50 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg prose-blockquote:text-xs">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
