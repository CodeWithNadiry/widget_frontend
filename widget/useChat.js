import { useState, useCallback, useEffect } from "react";

function generateSessionId() {
  return crypto.randomUUID();
}

export function useChat(chatbotId) {
  const [messages, setMessages] = useState([]);
  const [sessionId] = useState(() => generateSessionId());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── fire greeting when chat session starts ────────────────────────────────
  useEffect(() => {
    console.log("Greeting effect fired");
    if (!chatbotId) return; // ← guard: don't fire if chatbotId is null

    async function fetchGreeting() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, chatbotId, message: "" }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Something went wrong.");

        setMessages([{ role: "assistant", content: data.reply }]);
      } catch (err) {
        setError(typeof err.message === "string" ? err.message : JSON.stringify(err.message));
      } finally {
        setIsLoading(false);
      }
    }

    fetchGreeting();
  }, [chatbotId, sessionId]); // chatbotId goes null → real ID → guard handles null

  // ── send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim()) return;

      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, chatbotId, message: text }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Something went wrong.");

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch (err) {
        setError(typeof err.message === "string" ? err.message : JSON.stringify(err.message));
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, chatbotId],
  );

  return { messages, sendMessage, isLoading, error };
}