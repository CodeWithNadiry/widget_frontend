// app/chat/[slug]/page.jsx
import ChatWidget from "@/widget/ChatWidget";

const DEFAULT_THEME = {
  primaryColor: "#2563eb",
  headerBg: "#0f172a",
  aiBubbleBg: "#ffffff",
  chatbg: "#f8fafc",
  headerTextColor: "#ffffff",
};

async function getChatbot(slug) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.chatbot;
  } catch {
    return null;
  }
}

export default async function ChatPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const chatbot = await getChatbot(slug);

  const embedded = resolvedSearchParams?.embed === "1";

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500 text-sm">
        Chatbot not found.
      </div>
    );
  }

  const theme = {
    ...DEFAULT_THEME,
    ...chatbot.theme,
    logoUrl: chatbot.logoUrl,
  };

  return (
    <ChatWidget
      chatbotId={chatbot.chatbotId}
      title={chatbot.name}
      theme={theme}
      embedded={embedded}
    />
  );
}