import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function AssistantMessage({ content }) {
  // Strip any ━━━ divider lines the model leaks into replies
  const cleaned = (content || "")
    .replace(/^━+.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return (
    <div className="assistant-message">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => (
            <p className="text-[13.5px] text-slate-700 leading-[1.6] mb-2.5 last:mb-0">
              {children}
            </p>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),

          em: ({ children }) => (
            <em className="italic text-slate-600">{children}</em>
          ),

          // Real heading hierarchy instead of flattening everything to the same size
          h1: ({ children }) => (
            <h1 className="text-[16px] font-bold text-slate-900 mt-3 mb-2 pb-1.5 border-b border-slate-100 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[14.5px] font-bold text-slate-900 mt-3 mb-1.5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[13.5px] font-semibold text-slate-900 mt-2.5 mb-1 first:mt-0">
              {children}
            </h3>
          ),

          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1.5 pl-4 list-decimal marker:text-slate-400 marker:font-medium">
              {children}
            </ol>
          ),
          li: ({ children, ordered }) =>
            ordered ? (
              <li className="text-[13.5px] text-slate-700 leading-relaxed pl-0.5 [&>p]:mb-0 [&>p]:inline">
                {children}
              </li>
            ) : (
              <li className="text-[13.5px] text-slate-700 leading-relaxed flex gap-2.5">
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 bg-slate-800" />
                <span className="[&>p]:mb-0 [&>p]:inline">{children}</span>
              </li>
            ),

          hr: () => <div className="border-t border-slate-100 my-3" />,

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500 transition-colors"
              style={{ color: "var(--assistant-accent, #2563eb)" }}
            >
              {children}
            </a>
          ),

          code: ({ inline, children }) =>
            inline ? (
              <code className="text-[12px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md font-mono border border-slate-200/70">
                {children}
              </code>
            ) : (
              <code className="text-[12px] font-mono">{children}</code>
            ),
          pre: ({ children }) => (
            <pre className="text-[12px] bg-slate-900 text-slate-100 p-3 rounded-xl my-2 overflow-x-auto font-mono leading-relaxed shadow-sm">
              {children}
            </pre>
          ),

          blockquote: ({ children }) => (
            <div
              className="border-l-[3px] pl-3 my-2 text-slate-600 italic bg-slate-50/60 py-1.5 rounded-r-md"
              style={{ borderColor: "var(--assistant-accent, #2563eb)" }}
            >
              {children}
            </div>
          ),

          // Tables (enabled via remarkGfm) — render as clean, compact cards
          table: ({ children }) => (
            <div className="my-2.5 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-[12.5px] border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="text-left font-semibold text-slate-700 px-2.5 py-1.5 border-b border-slate-200 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 text-slate-600 border-b border-slate-100 align-top">
              {children}
            </td>
          ),
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}
