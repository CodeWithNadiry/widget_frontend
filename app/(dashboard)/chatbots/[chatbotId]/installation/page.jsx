"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import ChatbotHeader from "@/components/chatbots/ChatbotHeader";
import { useChatbot } from "@/hooks/useChatbots";

const WIDGET_ORIGIN = "https://widget-frontend-three.vercel.app";
const WIDGET_URL = `${WIDGET_ORIGIN}/widget.js`;

export default function InstallationPage({ params }) {
  const { chatbotId } = use(params);

  const { data, isLoading } = useChatbot(chatbotId);

  const chatbot = data?.chatbot;

  const [activeTab, setActiveTab] = useState("html");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const chatLink = useMemo(
    () => `${WIDGET_ORIGIN}/chat/${chatbot?.slug ?? ""}`,
    [chatbot]
  );

  const htmlCode = useMemo(
  () => `<script
src="${WIDGET_URL}"
data-chatbot-slug="${chatbot?.slug ?? ""}"
async>
</script>`,
  [chatbot]
);

  const reactCode = useMemo(
  () => `useEffect(() => {
  const script = document.createElement("script");

  script.src = "${WIDGET_URL}";
  script.async = true;
  script.dataset.chatbotSlug = "${chatbot?.slug ?? ""}";

  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);`,
  [chatbot]
);

  const nextCode = useMemo(
  () => `import Script from "next/script";

<Script
  src="${WIDGET_URL}"
  data-chatbot-slug="${chatbot?.slug ?? ""}"
  strategy="afterInteractive"
/>`,
  [chatbot]
);

  const code =
    activeTab === "html"
      ? htmlCode
      : activeTab === "react"
      ? reactCode
      : nextCode;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {}
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(chatLink);
      setLinkCopied(true);

      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch {}
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">

      <Link
        href="/chatbots"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Back to chatbots
      </Link>

      <ChatbotHeader chatbot={chatbot} chatbotId={chatbotId} />

      {/* Heading */}

      <div>

        <h2 className="text-2xl font-semibold text-slate-900">
          Installation
        </h2>

        <p className="text-slate-500 mt-2">
          Install{" "}
          <span className="font-semibold text-slate-700">
            {chatbot.name}
          </span>{" "}
          on any website in under a minute.
        </p>

      </div>

      {/* CHATBOT LINK */}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Chatbot Link
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mt-1">
            Share a direct link
          </h3>

          <p className="text-slate-500 mt-1 text-sm">
            No embedding required. Share this link with anyone who wants to
            try{" "}
            <span className="font-medium text-slate-700">
              {chatbot.name}
            </span>{" "}
            directly, like a client or teammate.
          </p>

        </div>

        <div className="p-6">

          <div className="flex items-center gap-3">

            <input
              readOnly
              value={chatLink}
              onFocus={(e) => e.target.select()}
              className="flex-1 h-11 rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm text-slate-700 font-mono"
            />

            <button
              onClick={handleCopyLink}
              className={`h-11 px-5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap

              ${
                linkCopied
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {linkCopied ? "Copied ✓" : "Copy link"}
            </button>

          </div>

        </div>

      </div>

      {/* STEP 1 */}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Step 1
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mt-1">
            Choose your platform
          </h3>

        </div>

        <div className="p-6 flex flex-col gap-6">

          {/* Tabs */}

          <div className="flex gap-3">

            {[
              {
                id: "html",
                label: "HTML",
              },
              {
                id: "react",
                label: "React",
              },
              {
                id: "next",
                label: "Next.js",
              },
            ].map((tab) => (

              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-10 px-5 rounded-lg border text-sm font-medium transition-all cursor-pointer

                ${
                  activeTab === tab.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>

            ))}

          </div>

          {/* Code */}

          <div className="relative">

            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-5 text-[14px] text-green-300 leading-7 font-mono border border-slate-800">
              <code>{code}</code>
            </pre>

            <button
              onClick={handleCopy}
              className={`absolute top-4 right-4 h-9 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer

              ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>

          </div>

        </div>

      </div>

      {/* STEP 2 */}

      <div className="bg-white border border-slate-200 rounded-xl">

        <div className="px-6 py-5 border-b border-slate-200">

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Step 2
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mt-1">
            Add it to your website
          </h3>

        </div>

        <div className="p-6">

          <div className="space-y-5">

  {activeTab === "html" && (
    <>
      <div>
        <p className="font-semibold text-slate-900">
          Step 1
        </p>

        <p className="text-slate-600 mt-1">
          Open your website&apos;s
          <span className="font-medium">
            {" "}index.html{" "}
          </span>
          file.
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          Step 2
        </p>

        <p className="text-slate-600 mt-1">
          Scroll to the bottom until you find
          <code className="mx-1 rounded bg-slate-100 px-2 py-1">
            {"</body>"}
          </code>
          .
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          Step 3
        </p>

        <p className="text-slate-600 mt-1">
          Paste the copied widget script immediately before the closing
          body tag.
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          Step 4
        </p>

        <p className="text-slate-600 mt-1">
          Save the file and refresh your website.
        </p>
      </div>
    </>
  )}

  {activeTab === "react" && (
    <>
      <div>
        <p className="font-semibold text-slate-900">
          Step 1
        </p>

        <p className="text-slate-600 mt-1">
          Open
          <code className="mx-1 rounded bg-slate-100 px-2 py-1">
            App.jsx
          </code>
          or your root component.
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          Step 2
        </p>

        <p className="text-slate-600 mt-1">
          Import
          <code className="mx-1 rounded bg-slate-100 px-2 py-1">
            useEffect
          </code>
          if it is not already imported.
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          Step 3
        </p>

        <p className="text-slate-600 mt-1">
          Paste the copied hook inside your component.
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          Step 4
        </p>

        <p className="text-slate-600 mt-1">
          Save the file and restart your React application if required.
        </p>
      </div>
    </>
  )}

  {activeTab === "next" && (
    <>
      <div>
        <p className="font-semibold text-slate-900">
          Step 1
        </p>

        <p className="text-slate-600 mt-1">
          Open
          <code className="mx-1 rounded bg-slate-100 px-2 py-1">
            app/layout.jsx
          </code>
          or
          <code className="mx-1 rounded bg-slate-100 px-2 py-1">
            app/layout.tsx
          </code>
          .
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          Step 2
        </p>

        <p className="text-slate-600 mt-1">
          Import
          <code className="mx-1 rounded bg-slate-100 px-2 py-1">
            Script
          </code>
          from Next.js.
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          Step 3
        </p>

        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
          Do not replace your existing RootLayout. Only add the Script
          component inside your existing
          <code className="mx-1 rounded bg-white px-2 py-1">
            {"<body>"}
          </code>
          tag.
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          Step 4
        </p>

        <p className="text-slate-600 mt-1">
          Save the file and restart your Next.js application if needed.
        </p>
      </div>
    </>
  )}

</div>

        </div>

      </div>

      {/* STEP 3 */}

      <div className="bg-white border border-slate-200 rounded-xl">

        <div className="px-6 py-5 border-b border-slate-200">

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Step 3
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mt-1">
            You are done 🎉
          </h3>

        </div>

        <div className="p-6">

          <div className="space-y-3 text-[15px]">

            <div className="flex items-center gap-3">
              <span className="text-green-600">✓</span>
              Widget loads automatically.
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-600">✓</span>
              No additional configuration required.
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-600">✓</span>
              Works on desktop and mobile.
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-600">✓</span>
              The widget loads asynchronously for better performance.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}