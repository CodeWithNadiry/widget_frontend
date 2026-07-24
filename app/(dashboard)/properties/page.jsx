"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDeleteProperty } from "@/hooks/useProperties";
import { useChatbots, useChatbotProperties } from "@/hooks/useChatbots";
import Modal from "@/components/ui/Modal";

export default function PropertiesPage() {
  const { data: chatbotsData, isLoading: chatbotsLoading } = useChatbots();
  const chatbots = chatbotsData?.chatbots ?? chatbotsData ?? [];

  const [selectedChatbotId, setSelectedChatbotId] = useState(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list"); // "list" | "grid"

  // Default to the first chatbot once the list loads
  useEffect(() => {
    if (!selectedChatbotId && chatbots.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedChatbotId(chatbots[0].chatbotId ?? chatbots[0].id);
    }
  }, [chatbots, selectedChatbotId]);

  const { data: propertiesData, isLoading: propertiesLoading } =
    useChatbotProperties(selectedChatbotId);
  const { mutate: deleteProperty, isPending } = useDeleteProperty();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const allProperties = propertiesData?.properties ?? propertiesData ?? [];

  const properties = useMemo(() => {
    if (!search.trim()) return allProperties;
    const q = search.trim().toLowerCase();
    return allProperties.filter((p) => {
      const name = (p.name ?? "").toLowerCase();
      const address = (p.address ?? "").toLowerCase();
      return name.includes(q) || address.includes(q);
    });
  }, [allProperties, search]);

  const selectedChatbot = chatbots.find(
    (c) => (c.chatbotId ?? c.id) === selectedChatbotId
  );

  const isLoading = chatbotsLoading || (!!selectedChatbotId && propertiesLoading);

  function handleDeleteClick(propertyId) {
    setSelectedPropertyId(propertyId);
    setDeleteOpen(true);
  }

  function handleDeleteConfirm() {
    // Guard against a double click firing two DELETE requests before the
    // button's disabled state re-renders — the second would 404 against an
    // id that's already gone.
    if (selectedPropertyId && !isPending) {
      deleteProperty(selectedPropertyId, {
        onSettled: () => {
          setDeleteOpen(false);
          setSelectedPropertyId(null);
        },
      });
    }
  }

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Properties</h1>
          <p className="text-[15px] text-slate-500 mt-0.5">
            {isLoading
              ? "Loading…"
              : `${properties.length} propert${properties.length !== 1 ? "ies" : "y"}${
                  selectedChatbot ? ` · ${selectedChatbot.name}` : ""
                }`}
          </p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New property
        </Link>
      </div>

      {/* Controls: chatbot filter + search + view toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Chatbot filter */}
        <div className="relative w-full sm:w-56 shrink-0">
          <select
            value={selectedChatbotId ?? ""}
            onChange={(e) => setSelectedChatbotId(e.target.value)}
            disabled={chatbotsLoading || chatbots.length === 0}
            className="w-full appearance-none bg-white border border-slate-200 text-[14px] font-medium text-slate-700 pl-3.5 pr-9 h-10 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {chatbots.length === 0 && (
              <option value="">No chatbots yet</option>
            )}
            {chatbots.map((c) => (
              <option key={c.chatbotId ?? c.id} value={c.chatbotId ?? c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              selectedChatbot
                ? `Search properties in ${selectedChatbot.name}…`
                : "Search properties…"
            }
            className="w-full bg-white border border-slate-200 text-[14px] text-slate-700 placeholder:text-slate-400 pl-9 pr-3.5 h-10 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer ${
              view === "list"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer ${
              view === "grid"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* List / Grid */}
      {isLoading ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-slate-100 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-40" />
                  <div className="h-3 bg-slate-100 rounded w-56" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : chatbots.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">🤖</div>
          <p className="text-[15px] font-medium text-slate-900 mb-1">No chatbots yet</p>
          <p className="text-[14px] text-slate-500">Create a chatbot first, then assign properties to it.</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">🏨</div>
          <p className="text-[15px] font-medium text-slate-900 mb-1">
            {search ? "No properties match your search" : "No properties yet"}
          </p>
          <p className="text-[14px] text-slate-500 mb-5">
            {search
              ? "Try a different name or clear the search."
              : `${selectedChatbot ? selectedChatbot.name : "This chatbot"} has no properties assigned.`}
          </p>
          {!search && (
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add property
            </Link>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p) => (
            <div
              key={p.propertyId}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="w-full aspect-[16/10] bg-indigo-50 flex items-center justify-center overflow-hidden">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🏨</span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-3">
                <p className="text-[15px] font-semibold text-slate-900 truncate">{p.name}</p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/properties/${p.propertyId}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-[14px] font-medium text-slate-600 border border-slate-300 px-3 h-9 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(p.propertyId)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-[14px] font-medium text-red-600 border border-red-200 px-3 h-9 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {properties.map((p) => (
            <div
              key={p.propertyId}
              className="bg-white border border-slate-200 rounded-xl px-4 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    "🏨"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-slate-900 truncate">{p.name}</p>
                  <p className="text-sm text-slate-400">
                    {p.address && <> · {p.address}</>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/properties/${p.propertyId}/edit`}
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-600 border border-slate-300 px-3 h-9 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteClick(p.propertyId)}
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-red-600 border border-red-200 px-3 h-9 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="flex flex-col gap-5 w-80">
          <div>
            <h2 className="text-base font-medium text-slate-900">
              Delete property
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              This will permanently remove the property from every chatbot it&apos;s assigned to. This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              className="cursor-pointer text-sm text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}