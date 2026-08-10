import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
    <div className="dasaiko-prose text-[14px] leading-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="my-2 ml-5 list-disc space-y-1">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="my-2 ml-5 list-decimal space-y-1">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="pl-1">
              {children}
            </li>
          ),

          h1: ({ children }) => (
            <h1 className="mb-2 mt-3 text-base font-semibold first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-2 mt-3 text-[15px] font-semibold first:mt-0">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-2.5 text-sm font-semibold first:mt-0">
              {children}
            </h3>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-primary/30 pl-3 text-zinc-400">
              {children}
            </blockquote>
          ),

          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-lg bg-white/[0.04] p-3">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
