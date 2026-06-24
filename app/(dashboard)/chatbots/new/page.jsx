"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateChatbot } from "@/hooks/useChatbots";
import Link from "next/link";

export default function NewChatbotPage() {
  const router = useRouter();
  const { mutate: createChatbot, isPending, error } = useCreateChatbot();

  const [form, setForm] = useState({ name: "", slug: "", systemPrompt: "" });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    createChatbot(form, { onSuccess: () => router.push("/chatbots") });
  }

  return (
    <div className="max-w-lg flex flex-col gap-6">
      {/* Back */}
      <Link href="/chatbots" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors w-fit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to chatbots
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">New chatbot</h1>
        <p className="text-[15px] text-slate-500 mt-0.5">Set up a new AI chatbot for your property</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Chatbot name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Grand Crito Assistant"
              className="w-full h-10 rounded-lg border border-slate-300 px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              placeholder="grand-crito"
              className="w-full h-10 rounded-lg border border-slate-300 px-3.5 text-[15px] text-slate-900 font-mono placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
            <p className="text-xs text-slate-400">Lowercase letters, numbers, and hyphens only. Used in the embed URL.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">System prompt</label>
            <textarea
              name="systemPrompt"
              value={form.systemPrompt}
              onChange={handleChange}
              required
              rows={5}
              placeholder="You are a helpful hotel concierge for Grand Crito Hotel. Answer guest questions about amenities, check-in times, and local recommendations…"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5">
              <span>⚠</span> {error.message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="h-10 px-5 bg-blue-600 text-white text-[15px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            >
              {isPending ? "Creating…" : "Create chatbot"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/chatbots")}
              className="h-10 px-4 text-[15px] font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
