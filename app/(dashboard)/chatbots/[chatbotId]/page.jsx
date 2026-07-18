"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  useChatbot,
  useChatbotProperties,
  useAssignProperty,
  useRemoveProperty,
  useUpdateChatbot,
  useUploadChatbotLogo,
} from "@/hooks/useChatbots";
import { useProperties } from "@/hooks/useProperties";
import ColorField from "@/components/ColorField";
import ChatbotHeader from "@/components/chatbots/ChatbotHeader";

const COLOR_FIELDS = [
  {
    key: "primaryColor",
    label: "Primary color",
    hint: "Buttons, user bubble, float button",
  },
  {
    key: "headerBg",
    label: "Header background",
    hint: "Top bar of the chat widget",
  },
  {
    key: "aiBubbleBg",
    label: "AI message bubble",
    hint: "Background of assistant replies",
  },
  {
    key: "chatbg",
    label: "Chat background",
    hint: "Background of the whole conversation area",
  },
  {
    key: "headerTextColor",
    label: "Header Text Color",
    hint: "Color of the header text.",
  },
];

const DEFAULT_THEME = {
  primaryColor: "#2563eb",
  headerBg: "#0f172a",
  aiBubbleBg: "#ffffff",
  chatbg: "#f8fafc",
  headerTextColor: "#ffffff",
};

export default function ChatbotDetailPage({ params }) {
  const { chatbotId } = use(params);

  const { data: chatbotData, isLoading } = useChatbot(chatbotId);
  const { data: propsData } = useChatbotProperties(chatbotId);
  const { data: allPropsData } = useProperties();

  const { mutate: assignProperty } = useAssignProperty(chatbotId);
  const { mutate: removeProperty } = useRemoveProperty(chatbotId);
  const { mutate: updateChatbot, isPending: isSaving } =
    useUpdateChatbot(chatbotId);
  const {
    mutate: uploadLogo,
    isPending: isUploadingLogo,
    error: logoError,
  } = useUploadChatbotLogo();

  const [form, setForm] = useState({
    name: "",
    systemPrompt: "",
    theme: DEFAULT_THEME,
  });
  const [saved, setSaved] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const chatbot = chatbotData?.chatbot;
  const assignedProperties = propsData?.properties ?? [];
  const allProperties = allPropsData?.properties ?? [];

  const unassigned = allProperties.filter(
    (p) => !assignedProperties.find((a) => a.propertyId === p.propertyId),
  );

  const hasChanges =
    form.name !== (chatbot?.name ?? "") ||
    form.systemPrompt !== (chatbot?.systemPrompt ?? "") ||
    JSON.stringify(form.theme) !==
      JSON.stringify(chatbot?.theme ?? DEFAULT_THEME);

  useEffect(() => {
    if (chatbot) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: chatbot.name ?? "",
        systemPrompt: chatbot.systemPrompt ?? "",
        theme: { ...DEFAULT_THEME, ...chatbot.theme },
      });
    }
  }, [chatbot]);

  // Revoke the local object URL once we no longer need the preview, so we
  // don't leak memory across repeated file picks.
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function handleThemeChange(key, value) {
    setForm((p) => ({ ...p, theme: { ...p.theme, [key]: value } }));
  }

  function handleSave() {
    updateChatbot(form, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      },
    });
  }

  function handleLogoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleLogoUpload() {
    if (!logoFile) return;
    uploadLogo(
      { chatbotId, file: logoFile },
      {
        onSuccess: () => {
          setLogoFile(null);
          setLogoPreview(null);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-xl flex flex-col gap-5 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-28" />
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-4 bg-slate-100 rounded w-28 mt-4" />
          <div className="h-28 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <Link
              href="/chatbots"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              ← Back to chatbots
            </Link>
      <ChatbotHeader chatbot={chatbot} />
      {/* ── Chatbot settings ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Settings</h2>

            <p className="text-sm text-slate-500 mt-1">
              Configure your chatbot appearance and behaviour.
            </p>
          </div>

          {/* Logo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Chatbot logo
            </label>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                {logoPreview || chatbot?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview || chatbot.logoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-300 text-[11px]">No logo</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100 cursor-pointer"
                />
                {logoFile && (
                  <button
                    onClick={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="self-start h-8 px-3 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {isUploadingLogo ? "Uploading…" : "Upload logo"}
                  </button>
                )}
                {logoError && (
                  <p className="text-xs text-red-500">{logoError.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="My Hotel Bot"
              className={`${inputClass} h-10`}
            />
          </div>

          {/* System prompt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              System prompt
            </label>
            <textarea
              value={form.systemPrompt}
              onChange={(e) =>
                setForm((p) => ({ ...p, systemPrompt: e.target.value }))
              }
              rows={6}
              placeholder="You are a helpful hotel assistant…"
              className={`${inputClass} py-2.5 resize-none`}
            />
          </div>

          {/* Theme colors */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Widget theme
            </label>
            <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              {COLOR_FIELDS.map(({ key, label, hint }) => (
                <ColorField
                  key={key}
                  label={label}
                  hint={hint}
                  value={form.theme[key] ?? DEFAULT_THEME[key]}
                  onChange={(value) => handleThemeChange(key, value)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            {saved && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="h-10 px-5 bg-blue-600 text-white text-[15px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Assigned properties ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Assigned properties
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {assignedProperties.length === 0
              ? "No properties assigned yet"
              : `${assignedProperties.length} propert${assignedProperties.length !== 1 ? "ies" : "y"} assigned`}
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {assignedProperties.length > 0 && (
            <div className="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {assignedProperties.map((p) => (
                <div
                  key={p.propertyId}
                  className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm shrink-0">
                      🏨
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-slate-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {p.apaleoCode}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeProperty(p.propertyId)}
                    className="text-sm text-red-500 font-medium hover:text-red-700 cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="flex-1 h-10 rounded-lg border border-slate-300 px-3.5 text-[15px] text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
              >
                <option value="">Select a property to assign…</option>
                {unassigned.map((p) => (
                  <option key={p.propertyId} value={p.propertyId}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!selectedPropertyId) return;
                  assignProperty(selectedPropertyId, {
                    onSuccess: () => setSelectedPropertyId(""),
                  });
                }}
                className="h-10 px-4 bg-blue-600 text-white text-[15px] font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors shadow-sm"
              >
                Assign
              </button>
            </div>
          )}

          {unassigned.length === 0 && assignedProperties.length > 0 && (
            <p className="text-sm text-slate-400">
              All your properties are assigned to this chatbot.
            </p>
          )}

          {unassigned.length === 0 && assignedProperties.length === 0 && (
            <p className="text-sm text-slate-400">
              No properties available.{" "}
              <Link
                href="/properties/new"
                className="text-blue-600 hover:underline"
              >
                Add a property first.
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
