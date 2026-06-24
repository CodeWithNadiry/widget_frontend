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
      color: "blue",
    },
    {
      label: "Properties",
      value: properties?.properties?.length ?? 0,
      icon: "🏨",
      href: "/properties",
      color: "indigo",
    },
  ];

  const recentChatbots = chatbots?.chatbots?.slice(0, 3) ?? [];
  const recentProperties = properties?.properties?.slice(0, 3) ?? [];

  return (
    <div className="max-w-4xl flex flex-col gap-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm hover:border-slate-300 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl">
                {m.icon}
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse" />
              ) : (
                m.value
              )}
            </p>
            <p className="text-[15px] text-slate-500 mt-1">{m.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Recent chatbots */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Recent chatbots</h2>
            <Link href="/chatbots" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-100 rounded animate-pulse w-32" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-20" />
                  </div>
                </div>
              ))
            ) : recentChatbots.length === 0 ? (
              <p className="px-5 py-6 text-[15px] text-slate-400">No chatbots yet.</p>
            ) : (
              recentChatbots.map((bot) => (
                <Link
                  key={bot.chatbotId}
                  href={`/chatbots/${bot.chatbotId}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-slate-900">{bot.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{bot.slug}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent properties */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Recent properties</h2>
            <Link href="/properties" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-100 rounded animate-pulse w-32" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-20" />
                  </div>
                </div>
              ))
            ) : recentProperties.length === 0 ? (
              <p className="px-5 py-6 text-[15px] text-slate-400">No properties yet.</p>
            ) : (
              recentProperties.map((p) => (
                <div
                  key={p.propertyId}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm">
                    🏨
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.apaleoCode}</p>
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
