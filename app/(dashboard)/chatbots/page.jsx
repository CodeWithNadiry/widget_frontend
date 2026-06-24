"use client";

import Link from "next/link";
import { useState } from "react";
import { useChatbots, useDeleteChatbot } from "@/hooks/useChatbots";
import Modal from "@/components/ui/Modal";

export default function ChatbotsPage() {
  const { data, isLoading } = useChatbots();
  const { mutate: deleteChatbot, isPending } = useDeleteChatbot();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedChatbotId, setSelectedChatbotId] = useState(null);

  const chatbots = data?.chatbots ?? [];

  function handleDeleteClick(chatbotId) {
    setSelectedChatbotId(chatbotId);
    setDeleteOpen(true);
  }

  function handleDeleteConfirm() {
    if (selectedChatbotId) {
      deleteChatbot(selectedChatbotId, {
        onSettled: () => {
          setDeleteOpen(false);
          setSelectedChatbotId(null);
        },
      });
    }
  }

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Chatbots</h1>
          <p className="text-[15px] text-slate-500 mt-0.5">
            {isLoading ? "Loading…" : `${chatbots.length} chatbot${chatbots.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/chatbots/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chatbot
        </Link>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-40" />
                <div className="h-3 bg-slate-100 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : chatbots.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">🤖</div>
          <p className="text-[15px] font-medium text-slate-900 mb-1">No chatbots yet</p>
          <p className="text-[14px] text-slate-500 mb-5">Create your first chatbot to get started.</p>
          <Link
            href="/chatbots/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create chatbot
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {chatbots.map((bot) => (
            <div
              key={bot.chatbotId}
              className="bg-white border border-slate-200 rounded-xl px-4 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl shrink-0">
                  🤖
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-slate-900 truncate">{bot.name}</p>
                  <p className="text-sm text-slate-400 font-mono">{bot.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/chatbots/${bot.chatbotId}`}
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-600 border border-slate-300 px-3 h-9 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Manage
                </Link>
                <button
                  onClick={() => handleDeleteClick(bot.chatbotId)}
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
        <div className="flex flex-col gap-5 w-80 ">
          <div>
            <h2 className="text-base font-medium text-slate-900">
              Delete chatbot
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              This will permanently remove the chatbot. This cannot be undone.
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