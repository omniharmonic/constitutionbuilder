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
    <div className="h-full overflow-y-auto bg-parchment border-l border-stone-200 p-4 sm:p-6">
      <article className="prose prose-sm prose-stone max-w-none prose-headings:font-display prose-h1:text-xl prose-h1:border-b prose-h1:border-stone-200/60 prose-h1:pb-3 prose-h1:mb-5 prose-h2:text-lg prose-h2:mt-7 prose-h2:mb-3 prose-h2:text-stone-800 prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2 prose-h4:text-sm prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-1.5 prose-p:leading-relaxed prose-p:text-stone-600 prose-p:text-sm prose-li:text-stone-600 prose-li:text-sm prose-strong:text-stone-800 prose-blockquote:border-l-brass prose-blockquote:bg-white/50 prose-blockquote:text-stone-500 prose-blockquote:py-2 prose-blockquote:px-3 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-xs prose-hr:border-stone-200/60 prose-hr:my-5">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
