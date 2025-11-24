"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { normalizeAiResponse } from '@/lib/ai/format-ai-response';

type AiMarkdownProps = {
  content: string;
  className?: string;
};

/**
 * Renders AI responses using Markdown so lists, headings, and emphasis
 * look polished inside chat bubbles.
 */
export function AiMarkdown({ content, className }: AiMarkdownProps) {
  const normalized = normalizeAiResponse(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn('space-y-2 text-sm leading-relaxed', className)}
      components={{
        strong: (props) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
        p: (props) => <p className="mb-2 last:mb-0 text-slate-700 dark:text-slate-200" {...props} />,
        ul: (props) => <ul className="list-disc pl-5 space-y-1 mb-2" {...props} />,
        ol: (props) => <ol className="list-decimal pl-5 space-y-1 mb-2" {...props} />,
        li: (props) => <li className="text-slate-700 dark:text-slate-200" {...props} />,
        h3: (props) => <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-4 mb-2" {...props} />,
        h4: (props) => <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-3 mb-1" {...props} />,
        br: () => <br className="leading-4" />,
        a: (props) => (
          <a className="text-purple-600 dark:text-purple-300 underline" target="_blank" rel="noreferrer" {...props} />
        ),
      }}
    >
      {normalized || content}
    </ReactMarkdown>
  );
}

export default AiMarkdown;

