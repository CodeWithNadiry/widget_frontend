"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "./useChat";
import AssistantMessage from "./AssistantMessage";

function useChatSize() {
  const getSize = () => {
    const w = window.innerWidth;
    if (w < 640)
      return {
        width: "calc(100vw - 24px)",
        height: "70vh",
        bottom: "12px",
        right: "12px",
      };
    if (w < 1024)
      return { width: "340px", height: "480px", bottom: "20px", right: "20px" };
    return { width: "380px", height: "560px", bottom: "24px", right: "24px" };
  };
  const [size, setSize] = useState(getSize);
  useEffect(() => {
    const handler = () => setSize(getSize());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

export default function ChatWidget({ chatbotId, title = "Hotel Assistant" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [hasOpened, setHasOpened] = useState(false);
  const bottomRef = useRef(null);

  const { messages, sendMessage, isLoading, error } = useChat(chatbotId);
  const size = useChatSize();

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleOpen() {
    setIsOpen(true);
    if (!hasOpened) setHasOpened(true);
  }

  function handleSend() {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const panelWidth = isExpanded && !isMobile ? "min(680px, 90vw)" : size.width;
  const panelHeight =
    isExpanded && !isMobile ? "min(720px, 85vh)" : size.height;

  return (
    <div
      className="fixed z-50"
      style={{ bottom: size.bottom, right: size.right }}
    >
      {isOpen && (
        <div
          className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl"
          style={{
            width: panelWidth,
            height: panelHeight,
            position: "fixed",
            bottom: `calc(${size.bottom} + 64px)`,
            right: size.right,
          }}
        >
          {/* ── Header ── */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-semibold">AI</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  {title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-xs text-green-400">Online</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Expand toggle — desktop only */}
              {!isMobile && (
                <button
                  onClick={() => setIsExpanded((v) => !v)}
                  aria-label={isExpanded ? "Shrink" : "Expand"}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  style={{ background: "none", border: "none" }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    {isExpanded ? (
                      <>
                        <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                        <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                        <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                        <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                      </>
                    ) : (
                      <>
                        <path d="M15 3h6v6" />
                        <path d="M9 21H3v-6" />
                        <path d="M21 3l-7 7" />
                        <path d="M3 21l7-7" />
                      </>
                    )}
                  </svg>
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                style={{ background: "none", border: "none" }}
                aria-label="Close"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1 min-h-0 bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* AI avatar — only on assistant messages */}
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mr-2 mt-1">
                    <span className="text-white text-[9px] font-bold">AI</span>
                  </div>
                )}

                <div
                  className={`
                    max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[14px]
                    ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none leading-snug"
                        : "bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm"
                    }
                  `}
                  dir="auto"
                >
                  {msg.role === "user" ? (
                    <span>{msg.content}</span>
                  ) : (
                    <AssistantMessage content={msg.content} />
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-white text-[9px] font-bold">AI</span>
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 text-center py-1">{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input ── */}
          <div className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ── Floating bubble ── */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className="bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 shadow-lg cursor-pointer transition-all hover:scale-105"
        style={{ width: 52, height: 52 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
