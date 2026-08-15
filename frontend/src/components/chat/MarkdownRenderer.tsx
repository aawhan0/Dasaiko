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
    <div
      className="
        dasaiko-prose
        text-[14px]
        font-medium
        leading-[1.7]
        text-zinc-300
      "
    >
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
        ]}
        rehypePlugins={[
          rehypeKatex,
        ]}
        components={{
          /* =================================================
             PARAGRAPHS
          ================================================== */

          p: ({ children }) => (
            <p
              className="
                mb-4
                last:mb-0
              "
            >
              {children}
            </p>
          ),

          /* =================================================
             EMPHASIS
          ================================================== */

          strong: ({ children }) => (
            <strong
              className="
                font-bold
                text-zinc-100
              "
            >
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em
              className="
                font-medium
                text-zinc-200
              "
            >
              {children}
            </em>
          ),

          /* =================================================
             LISTS
          ================================================== */

          ul: ({ children }) => (
            <ul
              className="
                my-4
                ml-5
                list-disc
                space-y-1.5
                marker:text-primary/60
              "
            >
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol
              className="
                my-4
                ml-5
                list-decimal
                space-y-1.5
                marker:font-semibold
                marker:text-primary/60
              "
            >
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li
              className="
                pl-1.5
                text-zinc-300
              "
            >
              {children}
            </li>
          ),

          /* =================================================
             H1
          ================================================== */

          h1: ({ children }) => (
            <h1
              className="
                mb-5
                mt-3
                text-xl
                font-bold
                leading-7
                tracking-[-0.025em]
                text-white
                first:mt-0
              "
            >
              {children}
            </h1>
          ),

          /* =================================================
             H2
          ================================================== */

          h2: ({ children }) => (
            <h2
              className="
                mb-2.5
                mt-8
                border-l-2
                border-primary/60
                pl-3
                text-[16px]
                font-bold
                leading-6
                tracking-[-0.01em]
                text-white
                first:mt-0
              "
            >
              {children}
            </h2>
          ),

          /* =================================================
             H3
          ================================================== */

          h3: ({ children }) => (
            <h3
              className="
                mb-2
                mt-6
                text-sm
                font-bold
                leading-5
                text-zinc-100
                first:mt-0
              "
            >
              {children}
            </h3>
          ),

          /* =================================================
             BLOCKQUOTES
          ================================================== */

          blockquote: ({ children }) => (
            <blockquote
              className="
                my-5
                border-l-2
                border-primary/50
                rounded-r-xl
                bg-primary/[0.035]
                px-4
                py-3
                font-medium
                text-zinc-400
              "
            >
              {children}
            </blockquote>
          ),

          /* =================================================
             INLINE CODE / CODE BLOCKS
          ================================================== */

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
                  text-[12px]
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
                  border-white/[0.10]
                  bg-white/[0.055]
                  px-1.5
                  py-0.5
                  font-mono
                  text-[12px]
                  font-medium
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
                my-5
                overflow-x-auto
                rounded-xl
                border-[1.5px]
                border-white/[0.09]
                bg-[#090909]
                px-4
                py-4
                font-mono
                shadow-[0_8px_25px_rgba(0,0,0,0.16)]
              "
            >
              {children}
            </pre>
          ),

          /* =================================================
             TABLES
          ================================================== */

          table: ({ children }) => (
            <div
              className="
                my-5
                overflow-x-auto
                rounded-xl
                border-[1.5px]
                border-white/[0.08]
              "
            >
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
            <thead
              className="
                border-b-[1.5px]
                border-white/[0.10]
                bg-white/[0.025]
              "
            >
              {children}
            </thead>
          ),

          th: ({ children }) => (
            <th
              className="
                px-3.5
                py-2.5
                text-[11px]
                font-bold
                uppercase
                tracking-[0.06em]
                text-zinc-200
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
                px-3.5
                py-2.5
                font-medium
                text-zinc-300
              "
            >
              {children}
            </td>
          ),

          /* =================================================
             LINKS
          ================================================== */

          a: ({
            children,
            href,
          }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                font-semibold
                text-primary-300
                underline
                decoration-primary/30
                underline-offset-[3px]
                transition-colors
                duration-200
                hover:text-primary-200
                hover:decoration-primary/70
              "
            >
              {children}
            </a>
          ),

          /* =================================================
             DIVIDER
          ================================================== */

          hr: () => (
            <hr
              className="
                my-7
                border-0
                border-t
                border-white/[0.08]
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