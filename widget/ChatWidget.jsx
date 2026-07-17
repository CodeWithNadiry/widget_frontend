"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "./useChat";
import AssistantReply from "./AssistantReply";
import BookingModal from "./BookingModal";

const DEFAULT_THEME = {
  primaryColor: "#2563eb",
  headerBg: "#0f172a",
  aiBubbleBg: "#ffffff",
  chatbg: "#f8fafc",
  headerTextColor: "#ffffff",
};

function useChatSize() {
  const getSize = () => {
    if (typeof window === "undefined")
      return { width: "380px", height: "560px", bottom: "24px", right: "24px" };
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

function Avatar({ theme, size = 24 }) {
  const [imgError, setImgError] = useState(false);

  if (theme.logoUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={theme.logoUrl}
        alt=""
        onError={() => setImgError(true)}
        className="rounded-full shrink-0 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: theme.headerBg }}
    >
      <span
        className="font-bold"
        style={{ fontSize: size * 0.375, color: theme.headerTextColor }}
      >
        AI
      </span>
    </div>
  );
}

export default function ChatWidget({
  chatbotId,
  title = "Hotel Assistant",
  theme = DEFAULT_THEME,
  embedded = false,
}) {
  const [isOpen, setIsOpen] = useState(!embedded);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [interactionStarted, setInteractionStarted] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const bottomRef = useRef(null);

  console.log('showing')
  useEffect(() => {
    if (!embedded) return;

    window.parent.postMessage(
      {
        source: "hotelbot",
        type: isOpen ? "open" : "close",
      },
      "*",
    );
  }, [isOpen, embedded]);

  const { messages, sendMessage, sendAction, searchOffers, isLoading, error } =
    useChat(chatbotId);
  const size = useChatSize();

  const isMobile = size.mobile;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const hasUserMessage = messages.some((m) => m.role === "user");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hasUserMessage) setInteractionStarted(true);
  }, [messages]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && last.reply?.type === "reopen_modal") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBookingModalOpen(true);
    }
  }, [messages]);

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

  function handleAskQuestion() {
    setInteractionStarted(true);
    sendAction("__ask_question__");
  }

  function handleBookAStay() {
    setBookingModalOpen(true);
  }

  async function handleModalSearch(formValues) {
    const ok = await searchOffers(formValues);
    if (ok) {
      setInteractionStarted(true);
      setBookingModalOpen(false);
    }
    return ok;
  }

  function handleOfferPick(number) {
    sendMessage(String(number));
  }

  function handleHotelPick(name) {
    sendMessage(name);
  }

  const lastMessage = messages[messages.length - 1];
  const showWelcomeButtons =
    !interactionStarted &&
    lastMessage?.role === "assistant" &&
    lastMessage.reply?.type === "welcome";

  const panelWidth = isExpanded && !isMobile ? "min(680px, 90vw)" : size.width;
  const panelHeight =
    isExpanded && !isMobile ? "min(720px, 85vh)" : size.height;

  return (
    <div
      className={embedded ? "fixed z-50" : "overflow-hidden"}
      style={
        embedded
          ? {
              bottom: size.bottom,
              right: size.right,
            }
          : {
              width: "100%",
              height: "100dvh",
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              background: theme.chatbg,
            }
      }
    >
      {(!embedded || isOpen) && (
        <div
          className="flex flex-col bg-white sm:bg-slate-50 sm:border
sm:border-slate-200 sm:rounded-xl overflow-hidden shadow-xl relative"
          style={
            embedded
              ? {
                  width: panelWidth,
                  height: panelHeight,
                  position: "fixed",
                  bottom: `calc(${size.bottom} + 64px)`,
                  right: size.right,
                }
              : {
                  flex: 1,
                  width: "100%",
                  maxWidth: "900px",
                  height: "100dvh",
                  maxHeight: "100dvh",
                  display: "flex",
                  flexDirection: "column",
                  background: "#fff",
                  boxShadow: "none",
                }
          }
        >
          {/* ── Header — shrink-0 keeps it pinned, never pushed off by content ── */}
          <div
            className="px-4 py-3 flex items-center justify-between shrink-0"
            style={{ backgroundColor: theme.headerBg }}
          >
            <div className="flex items-center gap-3">
              <Avatar theme={theme} size={32} />
              <div>
                <p
                  className="text-sm  lg:text-md font-semibold leading-tight"
                  style={{ color: theme.headerTextColor }}
                >
                  {title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {embedded && !isMobile && (
                <button
                  onClick={() => setIsExpanded((v) => !v)}
                  aria-label={isExpanded ? "Shrink" : "Expand"}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.headerTextColor,
                    opacity: 0.7,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
                >
                  <svg
                    width="16"
                    height="16"
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
              {embedded && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.headerTextColor,
                    opacity: 0.7,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
                  aria-label="Close"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* ── Messages — the ONLY part that scrolls. flex-1 + min-h-0 lets it
               shrink inside the flex column, overflow-y-auto makes it scroll
               internally instead of pushing header/footer out of view. ── */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
            <div className="mx-4 my-3 flex flex-col gap-3 ">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="mr-2 mt-1">
                      <Avatar theme={theme} size={24} />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[14px] ${
                      msg.role === "user"
                        ? "text-white rounded-br-none leading-snug"
                        : "border border-slate-200 text-slate-700 rounded-bl-none shadow-sm"
                    }`}
                    style={{
                      backgroundColor:
                        msg.role === "user"
                          ? theme.primaryColor
                          : theme.aiBubbleBg,
                    }}
                    dir="auto"
                  >
                    {msg.role === "user" ? (
                      <span>{msg.text}</span>
                    ) : (
                      <AssistantReply
                        reply={msg.reply}
                        onOfferPick={handleOfferPick}
                        onHotelPick={handleHotelPick}
                        theme={theme}
                      />
                    )}
                  </div>
                </div>
              ))}

              {showWelcomeButtons && (
                <div className="px-4 flex gap-2">
                  <button
                    onClick={handleBookAStay}
                    className="flex-1 text-[13px] font-medium px-3 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Book a Room
                  </button>
                  <button
                    onClick={handleAskQuestion}
                    className="flex-1 text-[13px] font-medium px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Ask a Question
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start items-center gap-2">
                  <Avatar theme={theme} size={24} />
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
          </div>

          {/* ── Input — shrink-0 keeps it pinned to the bottom of the panel,
               always visible, never scrolled away. ── */}
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
              className="text-white text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Send
            </button>
          </div>

          <BookingModal
            open={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            chatbotId={chatbotId}
            onSearch={handleModalSearch}
            theme={theme}
          />
        </div>
      )}

      {/* ── Floating bubble ── */}
      {embedded && (
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all hover:opacity-90 hover:scale-105 overflow-hidden"
          style={{
            width: 52,
            height: 52,
            backgroundColor: theme.primaryColor,
          }}
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
          ) : theme.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={theme.logoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
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
      )}
    </div>
  );
}