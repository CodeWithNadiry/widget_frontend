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

// Keep these in sync with widget.js's iframe transition timing so the
// panel's own fade/scale animation and the parent iframe's resize
// animation land together instead of looking like two separate motions.
const OPEN_DURATION = 240; // ms
const CLOSE_DURATION = 240; // ms
const EASE = "cubic-bezier(.22,.61,.36,1)";

function useIsMobile(embedded) {
  // Inside an embedded iframe, our own box is deliberately narrower than
  // a phone screen even on desktop (380-520px) — so checking our own
  // window.innerWidth here would call itself "mobile" all the time,
  // regardless of the visitor's actual device. The host page (widget.js)
  // knows the real viewport width, so when embedded we trust that instead:
  // a query param for first paint, and postMessage for live updates.
  const getInitial = () => {
    if (typeof window === "undefined") return false;
    if (embedded) {
      return new URLSearchParams(window.location.search).get("mobile") === "1";
    }
    return window.innerWidth < 640;
  };

  const [isMobile, setIsMobile] = useState(getInitial);

  useEffect(() => {
    if (embedded) {
      function handleMessage(event) {
        if (
          event.data?.source === "hotelbot-host" &&
          event.data?.type === "viewport"
        ) {
          setIsMobile(!!event.data.mobile);
        }
      }
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [embedded]);

  return isMobile;
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
  // Drives the fade+translate+scale effect on the panel content whenever
  // it opens or closes — separate from the iframe's own box-resize
  // transition (handled in widget.js), so opening/closing feels like a
  // deliberate reveal/dismissal rather than a container just resizing.
  const [entered, setEntered] = useState(false);
  // True for the brief window between "user clicked close" and "panel
  // actually unmounts" — lets the content play its closing animation
  // before we tear the panel down and shrink the iframe back to a bubble.
  const [isClosing, setIsClosing] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const wasLoadingRef = useRef(false);
  const isMobile = useIsMobile(embedded);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isMobile && isExpanded) setIsExpanded(false);
  }, [isMobile, isExpanded]);

  useEffect(() => {
    if (!embedded) return;
    // While closing, tell the parent right away so the iframe shrink
    // animation and the panel's fade-out animation run in sync instead
    // of the iframe snapping shut only after the panel has vanished.
    if (isClosing) {
      window.parent.postMessage({ source: "hotelbot", type: "close" }, "*");
      return;
    }
    let type = "close";
    if (isOpen) type = isExpanded ? "expand" : "open";
    window.parent.postMessage({ source: "hotelbot", type }, "*");
  }, [isOpen, isExpanded, embedded, isClosing]);

  useEffect(() => {
    if (!embedded) return;
    if (isOpen && !isClosing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntered(false);
      const t = setTimeout(() => setEntered(true), 20);
      return () => clearTimeout(t);
    }
  }, [isOpen, embedded, isClosing]);

  const { messages, sendMessage, sendAction, searchOffers, isLoading, error } =
    useChat(chatbotId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    // Only focus on the true->false transition (a reply just finished),
    // not on every render where isLoading happens to be false — that
    // would also fire on mount and steal focus before the user's asked
    // for anything.
    if (wasLoadingRef.current && !isLoading) {
      inputRef.current?.focus();
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

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

  function handleClose() {
    if (!embedded) {
      setIsOpen(false);
      return;
    }
    // Play the fade/scale/translate-down closing animation first, then
    // unmount once it's finished so the panel never just disappears.
    setIsClosing(true);
    setEntered(false);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, CLOSE_DURATION);
  }

  const lastMessage = messages[messages.length - 1];
  const showWelcomeButtons =
    !interactionStarted &&
    lastMessage?.role === "assistant" &&
    lastMessage.reply?.type === "welcome";

  const panelShadow = isExpanded
    ? "0 26px 64px -14px rgba(15,23,42,.38), 0 10px 28px -10px rgba(15,23,42,.24)"
    : "0 18px 48px -14px rgba(15,23,42,.26), 0 6px 18px -8px rgba(15,23,42,.16)";

  const chatBody = (
    <>
      {/* ── Header ── */}
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
              onClick={handleClose}
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

      {/* ── Messages ── */}
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
                    msg.role === "user" ? theme.primaryColor : theme.aiBubbleBg,
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

      {/* ── Input ── */}
      <div className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
        <input
          ref={inputRef}
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
    </>
  );

  if (embedded) {
    if (!isOpen) {
      return (
        <>
          <style>{`
            @keyframes hotelbot-idle-pulse {
              0%, 90%, 100% { transform: scale(1); }
              95% { transform: scale(1.04); }
            }
            .hotelbot-bubble {
              animation: hotelbot-idle-pulse 5.5s ease-in-out infinite;
              transition: transform 200ms ${EASE};
            }
            .hotelbot-bubble:hover {
              animation-play-state: paused;
              transform: scale(1.08);
            }
            .hotelbot-bubble:active {
              transform: scale(0.95);
            }
          `}</style>
          <button
            onClick={() => setIsOpen(true)}
            className="hotelbot-bubble w-full h-full rounded-full flex items-center justify-center shadow-lg cursor-pointer overflow-hidden"
            style={{ backgroundColor: theme.primaryColor }}
            aria-label="Open chat"
          >
            {theme.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={theme.logoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                width="45%"
                height="45%"
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
        </>
      );
    }

    return (
      <div
        className={`flex flex-col bg-white w-full h-full overflow-hidden rounded-[18px] border border-slate-200 transition-all ease-[cubic-bezier(.22,.61,.36,1)] ${
          entered
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-[0.96] translate-y-3"
        }`}
        style={{
          transitionDuration: `${entered ? OPEN_DURATION : CLOSE_DURATION}ms`,
          boxShadow: panelShadow,
        }}
      >
        {chatBody}
      </div>
    );
  }

  // ── Standalone (non-embedded) rendering — unchanged. ──
  return (
    <div
      className="overflow-hidden"
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        background: theme.chatbg,
      }}
    >
      <div
        className="flex flex-col bg-white sm:bg-slate-50 sm:border
sm:border-slate-200 sm:rounded-xl overflow-hidden shadow-xl relative"
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "900px",
          height: "100dvh",
          maxHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          boxShadow: "none",
        }}
      >
        {chatBody}
      </div>
    </div>
  );
}