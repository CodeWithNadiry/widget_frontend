"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateChatbot, useUploadChatbotLogo } from "@/hooks/useChatbots";
import Link from "next/link";
import ColorField from "@/components/ColorField";

const COLOR_FIELDS = [
  { key: "primaryColor", label: "Primary color", hint: "Buttons, user bubble, float button" },
  { key: "headerBg", label: "Header background", hint: "Top bar of the chat widget" },
  { key: "aiBubbleBg", label: "AI message bubble", hint: "Background of assistant replies" },
  { key: "chatbg", label: "Chat background", hint: "Background of the whole conversation area" },
  { key: "headerTextColor", label: "Header Text Color", hint: "Color of the header text." },
];

export default function NewChatbotPage() {
  const router = useRouter();
  const { mutate: createChatbot, isPending: isCreating, error: createError } = useCreateChatbot();
  const { mutate: uploadLogo, isPending: isUploadingLogo, error: logoError } = useUploadChatbotLogo();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    systemPrompt: "",
    theme: {
      primaryColor: "#2563eb",
      headerBg: "#0f172a",
      aiBubbleBg: "#ffffff",
      chatbg: "#f8fafc",
      headerTextColor: '#ffffff'
    },
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const isPending = isCreating || isUploadingLogo;
  const error = createError || logoError;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleThemeChange(key, value) {
    setForm((prev) => ({ ...prev, theme: { ...prev.theme, [key]: value } }));
  }

  function handleLogoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e) {
    e.preventDefault();

    createChatbot(form, {
      onSuccess: (data) => {
        const chatbotId = data.chatbot.chatbotId;

        // No logo picked — done, go straight to the list.
        if (!logoFile) {
          router.push("/chatbots");
          return;
        }

        // Logo picked — upload it against the newly created chatbot's id,
        // then navigate regardless of outcome (a failed logo upload
        // shouldn't strand the admin on this page; the chatbot itself
        // was created successfully).
        uploadLogo(
          { chatbotId, file: logoFile },
          { onSettled: () => router.push("/chatbots") },
        );
      },
    });
  }

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <Link href="/chatbots" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors w-fit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to chatbots
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">New chatbot</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Logo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Chatbot logo</label>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-300 text-[11px]">No logo</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-slate-400">
                  {logoFile ? "Uploaded once you create the chatbot." : "Optional — you can add this later too."}
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
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

          {/* Slug */}
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

          {/* System prompt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">System prompt</label>
            <textarea
              name="systemPrompt"
              value={form.systemPrompt}
              onChange={handleChange}
              required
              rows={5}
              placeholder="You are a helpful hotel concierge for Grand Crito Hotel…"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>

          {/* Theme colors */}
          <div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-slate-700">Widget theme</label>
  <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
    {COLOR_FIELDS.map(({ key, label, hint }) => (
      <ColorField
        key={key}
        label={label}
        hint={hint}
        value={form.theme[key]}
        onChange={(value) => handleThemeChange(key, value)}
      />
    ))}
  </div>
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
              {isCreating ? "Creating…" : isUploadingLogo ? "Uploading logo…" : "Create chatbot"}
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