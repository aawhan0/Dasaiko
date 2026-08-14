import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
    <div className="dasaiko-prose text-[14px] leading-[1.55] text-zinc-300">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
        ]}
        rehypePlugins={[
          rehypeKatex,
        ]}
        components={{
          /* ---------------------------------
             Paragraphs
          --------------------------------- */

          p: ({ children }) => (
            <p className="mb-3 last:mb-0">
              {children}
            </p>
          ),

          /* ---------------------------------
             Emphasis
          --------------------------------- */

          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-100">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="text-zinc-200">
              {children}
            </em>
          ),

          /* ---------------------------------
             Lists
          --------------------------------- */

          ul: ({ children }) => (
            <ul
              className="
                my-3
                ml-5
                list-disc
                space-y-1
                marker:text-zinc-500
              "
            >
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol
              className="
                my-3
                ml-5
                list-decimal
                space-y-1
                marker:text-zinc-500
              "
            >
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="pl-1">
              {children}
            </li>
          ),

          /* ---------------------------------
             Main Title
          --------------------------------- */

          h1: ({ children }) => (
            <h1
              className="
                mb-5
                mt-2
                w-fit
                border-b
                border-white/[0.14]
                pb-1
                text-xl
                font-semibold
                leading-7
                tracking-[-0.01em]
                text-white
                first:mt-0
              "
            >
              {children}
            </h1>
          ),

          /* ---------------------------------
             Major Sections
          --------------------------------- */

          h2: ({ children }) => (
            <h2
              className="
                mb-2
                mt-7
                w-fit
                border-b-2
                border-primary/35
                pb-0.5
                text-[16px]
                font-semibold
                leading-6
                text-white
                first:mt-0
              "
            >
              {children}
            </h2>
          ),

          /* ---------------------------------
             Subsections
          --------------------------------- */

          h3: ({ children }) => (
            <h3
              className="
                mb-1.5
                mt-5
                w-fit
                border-b
                border-white/[0.10]
                pb-0
                text-sm
                font-semibold
                leading-5
                text-zinc-100
                first:mt-0
              "
            >
              {children}
            </h3>
          ),

          /* ---------------------------------
             Blockquotes
          --------------------------------- */

          blockquote: ({ children }) => (
            <blockquote
              className="
                my-4
                rounded-lg
                border
                border-primary/15
                border-l-2
                border-l-primary/55
                bg-primary/[0.035]
                px-4
                py-3
                text-zinc-300
              "
            >
              {children}
            </blockquote>
          ),

          /* ---------------------------------
             Inline Code / Code Blocks
          --------------------------------- */

          code: ({
            className,
            children,
            ...props
          }) => {
            const isBlock =
              Boolean(className);

            return isBlock ? (
              <code
                className="
                  font-mono
                  text-xs
                  leading-5
                  text-zinc-300
                "
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className="
                  rounded-md
                  border
                  border-white/[0.07]
                  bg-white/[0.045]
                  px-1.5
                  py-0.5
                  font-mono
                  text-[12px]
                  text-zinc-200
                "
                {...props}
              >
                {children}
              </code>
            );
          },

          pre: ({ children }) => (
            <pre
              className="
                my-4
                overflow-x-auto
                rounded-lg
                border
                border-white/[0.07]
                bg-white/[0.025]
                px-4
                py-3
                font-mono
              "
            >
              {children}
            </pre>
          ),

          /* ---------------------------------
             Tables
          --------------------------------- */

          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table
                className="
                  w-full
                  border-collapse
                  text-left
                  text-[13px]
                "
              >
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="border-b border-white/[0.12]">
              {children}
            </thead>
          ),

          th: ({ children }) => (
            <th
              className="
                px-3
                py-2
                font-semibold
                text-zinc-100
              "
            >
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td
              className="
                border-b
                border-white/[0.06]
                px-3
                py-2
                text-zinc-300
              "
            >
              {children}
            </td>
          ),

          /* ---------------------------------
             Links
          --------------------------------- */

          a: ({
            children,
            href,
          }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-primary
                underline
                decoration-primary/30
                underline-offset-2
                transition-colors
                hover:text-primary/80
              "
            >
              {children}
            </a>
          ),

          /* ---------------------------------
             Divider
          --------------------------------- */

          hr: () => (
            <hr
              className="
                my-6
                border-white/[0.06]
              "
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}