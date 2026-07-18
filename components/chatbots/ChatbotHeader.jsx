"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ChatbotHeader({ chatbot }) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Settings",
      href: `/chatbots/${chatbot.chatbotId}`,
    },
    {
      name: "Installation",
      href: `/chatbots/${chatbot.chatbotId}/installation`,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-blue-50 border border-slate-200 flex items-center justify-center shrink-0">
            {chatbot.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={chatbot.logoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🤖</span>
            )}
          </div>

          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {chatbot.name}
            </h1>

            <p className="text-sm text-slate-400 font-mono mt-1">
              {chatbot.slug}
            </p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-100">
        {tabs.map((tab) => {
          const active = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`px-6 h-12 flex items-center text-sm font-medium transition-all border-b-2
                ${
                  active
                    ? "border-blue-600 text-blue-600 bg-blue-50/40"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}