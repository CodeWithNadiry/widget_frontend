import { useState, useCallback, useEffect } from "react";

function generateSessionId() {
  return crypto.randomUUID();
}

export function useChat(chatbotId) {
  // Each message is now: { role: "user", text: string }
  //                    or { role: "assistant", reply: { type, text, data } }
  const [messages, setMessages] = useState([]);
  const [sessionId] = useState(() => generateSessionId());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function postChat(message) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, chatbotId, message }),
    });
    const data = await res.json();
    console.log("🚀 ~ postChat ~ data:", data)
    
    if (!res.ok) throw new Error(data.message || "Something went wrong.");
    return data.reply; // { type, text, data }
  }

  // ── fire greeting when chat session starts ────────────────────────────────
  useEffect(() => {
    if (!chatbotId) return;

    async function fetchGreeting() {
      setIsLoading(true);
      try {
        const reply = await postChat("");
        setMessages([{ role: "assistant", reply }]);
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : JSON.stringify(err.message),
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchGreeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbotId, sessionId]);

  // ── send a normal typed message (visible bubble) ────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim()) return;

      console.log('text', text)
      setMessages((prev) => [...prev, { role: "user", text }]);
      setIsLoading(true);
      setError(null);

      try {
        const reply = await postChat(text);
        console.log('reply', reply)
        setMessages((prev) => [...prev, { role: "assistant", reply }]);
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : JSON.stringify(err.message),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, chatbotId],
  );

  // ── send a silent action (button taps) — no user bubble added ───────────────
  const sendAction = useCallback(
    async (actionMessage) => {
      setIsLoading(true);
      setError(null);

      try {
        const reply = await postChat(actionMessage);
        console.log("🚀 ~ useChat ~ reply:", reply)
        
        setMessages((prev) => [...prev, { role: "assistant", reply }]);
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : JSON.stringify(err.message),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, chatbotId],
  );

  // ── modal search — hits the non-LLM endpoint, result appended like any reply ──
  const searchOffers = useCallback(
    async ({ propertyId, arrival, departure, adults }) => {
      setIsLoading(true);
      setError(null);
      console.log("propertyId", propertyId);
      try {
        const res = await fetch("/api/search-offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            chatbotId,
            propertyId,
            arrival,
            departure,
            adults,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Something went wrong.");

        console.log(data.reply)
        setMessages((prev) => [
          ...prev,
          { role: "assistant", reply: data.reply },
        ]);
        
        return true;
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : JSON.stringify(err.message),
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, chatbotId],
  );

  return { messages, sendMessage, sendAction, searchOffers, isLoading, error };
}
