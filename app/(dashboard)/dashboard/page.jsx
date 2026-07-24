"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const { data: chatbots, isLoading: loadingChatbots } = useQuery({
    queryKey: ["chatbots"],
    queryFn: () => apiFetch("/admin/chatbots"),
  });

  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: ["properties"],
    queryFn: () => apiFetch("/property"),
  });

  const loading = loadingChatbots || loadingProperties;

  const metrics = [
    {
      label: "Chatbots",
      value: chatbots?.chatbots?.length ?? 0,
      icon: "🤖",
      href: "/chatbots",
      gradient: "from-blue-500 to-blue-600",
      ring: "group-hover:ring-blue-100",
    },
    {
      label: "Properties",
      value: properties?.properties?.length ?? 0,
      icon: "🏨",
      href: "/properties",
      gradient: "from-indigo-500 to-indigo-600",
      ring: "group-hover:ring-indigo-100",
    },
  ];

  const recentChatbots = chatbots?.chatbots?.slice(0, 3) ?? [];
  const recentProperties = properties?.properties?.slice(0, 3) ?? [];

  return (
    <div className="max-w-4xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-[15px] text-slate-500 mt-1">
            Overview of your chatbots and properties.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/chatbots/new"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-600 border border-slate-300 px-3.5 h-9 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chatbot
          </Link>
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[14px] font-medium px-3.5 h-9 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New property
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 overflow-hidden"
          >
            {/* Subtle corner glow on hover */}
            <div className={`pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${m.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />

            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-xl shadow-sm ring-4 ring-transparent ${m.ring} transition-all duration-200`}
              >
                {m.icon}
              </div>
              <svg
                className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? (
                <span className="inline-block w-10 h-8 bg-slate-100 rounded animate-pulse" />
              ) : (
                m.value
              )}
            </p>
            <p className="text-[15px] text-slate-500 mt-1 font-medium">{m.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Recent chatbots */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Recent chatbots</h2>
            <Link href="/chatbots" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-100 rounded animate-pulse w-32" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-20" />
                  </div>
                </div>
              ))
            ) : recentChatbots.length === 0 ? (
              <div className="px-5 py-8 flex flex-col items-center text-center gap-2">
                <span className="text-2xl">🤖</span>
                <p className="text-[15px] text-slate-400">No chatbots yet.</p>
                <Link href="/chatbots/new" className="text-sm text-blue-600 hover:underline font-medium">
                  Create your first chatbot
                </Link>
              </div>
            ) : (
              recentChatbots.map((bot) => (
                <Link
                  key={bot.chatbotId}
                  href={`/chatbots/${bot.chatbotId}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-sm shrink-0 overflow-hidden">
                    {bot.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bot.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "🤖"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-slate-900 truncate">{bot.name}</p>
                    <p className="text-xs text-slate-400 font-mono truncate">{bot.slug}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent properties */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Recent properties</h2>
            <Link href="/properties" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-100 rounded animate-pulse w-32" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-20" />
                  </div>
                </div>
              ))
            ) : recentProperties.length === 0 ? (
              <div className="px-5 py-8 flex flex-col items-center text-center gap-2">
                <span className="text-2xl">🏨</span>
                <p className="text-[15px] text-slate-400">No properties yet.</p>
                <Link href="/properties/new" className="text-sm text-blue-600 hover:underline font-medium">
                  Add your first property
                </Link>
              </div>
            ) : (
              recentProperties.map((p) => (
                <div key={p.propertyId} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm shrink-0 overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "🏨"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.address}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}