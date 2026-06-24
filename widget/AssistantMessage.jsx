import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function AssistantMessage({ content }) {
  // Strip any ━━━ divider lines the model leaks into replies
  const cleaned = content
    .replace(/^━+.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return (
    <div className="assistant-message">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => (
            <p className="text-[13.5px] text-slate-700 leading-relaxed mb-2 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-600">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="my-1.5 space-y-1 pl-3">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 space-y-1 pl-3 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-[13.5px] text-slate-700 leading-snug flex gap-2">
              <span className="mt-1.75 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
              <span className="[&>p]:mb-0 [&>p]:inline">{children}</span>
            </li>
          ),
          // Treat all headings as bold inline text — model shouldn't use these but just in case
          h1: ({ children }) => (
            <p className="font-semibold text-[13.5px] text-slate-900 mb-1.5">
              {children}
            </p>
          ),
          h2: ({ children }) => (
            <p className="font-semibold text-[13.5px] text-slate-900 mb-1">
              {children}
            </p>
          ),
          h3: ({ children }) => (
            <p className="font-semibold text-[13.5px] text-slate-900 mb-0.5">
              {children}
            </p>
          ),
          hr: () => <div className="border-t border-slate-100 my-2.5" />,
          // Prevent code blocks from looking weird in chat
          code: ({ children }) => (
            <code className="text-[12px] bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="text-[12px] bg-slate-100 text-slate-800 p-2 rounded my-1.5 overflow-x-auto font-mono">
              {children}
            </pre>
          ),
          // Suppress blockquotes
          blockquote: ({ children }) => (
            <div className="border-l-2 border-slate-200 pl-3 my-1.5 text-slate-600 italic">
              {children}
            </div>
          ),
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}
