"use client";

import { use, useEffect, useState } from "react";
import ChatWidget from "@/widget/ChatWidget";

export default function ChatPage({ params }) {
  const { slug } = use(params);
  const [chatbotId, setChatbotId] = useState(null);
  const [name, setName] = useState("Hotel Assistant");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chatbot) {
          setChatbotId(data.chatbot.chatbotId);
          setName(data.chatbot.name);
        } else {
          setError("Chatbot not found.");
        }
      })
      .catch(() => setError("Failed to load chatbot."));
  }, [slug]);

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );

  if (!chatbotId) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <ChatWidget chatbotId={chatbotId} title={name} />
    </div>
  );
}
