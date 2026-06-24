"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useDocuments,
  useUploadDocuments,
  useDeleteDocument,
} from "@/hooks/useDocuments";
import { useChatbots } from "@/hooks/useChatbots";
import { useProperties } from "@/hooks/useProperties";
import Modal from "@/components/ui/Modal";

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-700",
  processing: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-blue-100 text-blue-700",
};

// ── Inner component — uses useSearchParams so must be inside Suspense ──
function DocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatbotId = searchParams.get("chatbotId");

  const filesRef = useRef(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [settings, setSettings] = useState({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const { data: chatbotsData } = useChatbots();
  const { data: propertiesData } = useProperties();
  const { data: docsData, isLoading } = useDocuments(chatbotId);
  const uploadMutation = useUploadDocuments(chatbotId);
  const deleteMutation = useDeleteDocument(chatbotId);

  const chatbots = chatbotsData?.chatbots ?? [];
  const properties = propertiesData?.properties ?? [];
  const documents = docsData?.documents ?? [];

  function handleChatbotChange(e) {
    const id = e.target.value;
    if (id) {
      router.push(`/documents?chatbotId=${id}`);
    } else {
      router.push("/documents");
    }
  }

  function handleSettingChange(e) {
    const { name, value } = e.target;
    setSettings((p) => ({ ...p, [name]: Number(value) }));
  }

  function handleFileDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  }

  function handleFileInput(e) {
    setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
  }

  function handleUpload() {
    if (!files.length || !chatbotId) return;

    const formData = new FormData();
    formData.append("chatbotId", chatbotId);
    if (selectedPropertyId) formData.append("propertyId", selectedPropertyId);
    formData.append("chunkSize", settings.chunkSize);
    formData.append("chunkOverlap", settings.chunkOverlap);
    files.forEach((file) => formData.append("files", file));

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        setUploadOpen(false);
        setFiles([]);
        setSelectedPropertyId("");
      },
    });
  }

  function handleDeleteConfirm() {
    if (!selectedDocId) return;
    deleteMutation.mutate(selectedDocId, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelectedDocId(null);
      },
    });
  }

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Documents</h1>
          <p className="text-[15px] text-slate-500 mt-0.5">
            {isLoading
              ? "Loading…"
              : chatbotId
              ? `${documents.length} document${documents.length !== 1 ? "s" : ""}`
              : "Select a chatbot to view its documents"}
          </p>
        </div>
        <button
          onClick={() => {
            setFiles([]);
            setUploadOpen(true);
          }}
          disabled={!chatbotId}
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Upload
        </button>
      </div>

      {/* Chatbot selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Chatbot</label>
        <select
          value={chatbotId ?? ""}
          onChange={handleChatbotChange}
          className="border border-slate-300 rounded-lg px-3.5 h-10 text-[15px] text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition max-w-xs cursor-pointer"
        >
          <option value="">Choose a chatbot…</option>
          {chatbots.map((bot) => (
            <option key={bot.chatbotId} value={bot.chatbotId}>
              {bot.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <div className="flex flex-col gap-5 w-full max-w-lg">
          <div>
            <h2 className="text-base font-medium text-slate-900">Upload documents</h2>
            <p className="text-sm text-slate-500 mt-1">Add files to this chatbot&apos;s knowledge base.</p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleFileDrop}
            onClick={() => filesRef.current?.click()}
            className={`border border-dashed rounded-xl p-8 flex flex-col items-center gap-3 text-center cursor-pointer transition-colors
              ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-medium text-slate-700">Drag & drop files here</p>
              <p className="text-sm text-slate-400 mt-0.5">or click to browse</p>
            </div>
            <input ref={filesRef} type="file" multiple hidden onChange={handleFileInput} />
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[15px] text-slate-700 truncate max-w-xs">{file.name}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                    <button
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="cursor-pointer text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Optional property */}
          {properties.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Property <span className="text-slate-400 font-normal">(optional)</span></label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="border border-slate-300 rounded-lg px-3.5 h-10 text-[15px] text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
              >
                <option value="">No specific property</option>
                {properties.map((p) => (
                  <option key={p.propertyId} value={p.propertyId}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Chunk settings */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "chunkSize", label: "Chunk size", min: 100, max: 5000, hint: "Tokens per chunk" },
              { name: "chunkOverlap", label: "Chunk overlap", min: 0, max: 1000, hint: "Overlap between chunks" },
            ].map((item) => (
              <div key={item.name} className="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="text-sm text-blue-600 font-semibold">{settings[item.name]}</span>
                </div>
                <input
                  type="range"
                  name={item.name}
                  min={item.min}
                  max={item.max}
                  value={settings[item.name]}
                  onChange={handleSettingChange}
                  className="w-full cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-slate-400">{item.hint}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setUploadOpen(false)}
              className="cursor-pointer text-[15px] font-medium text-slate-600 border border-slate-300 px-4 h-10 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!files.length || uploadMutation.isPending}
              className="bg-blue-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            >
              {uploadMutation.isPending ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="flex flex-col gap-5 w-80">
          <div>
            <h2 className="text-base font-medium text-slate-900">Delete document</h2>
            <p className="text-sm text-slate-500 mt-1">
              This will permanently remove the document and all its chunks.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              className="cursor-pointer text-[15px] font-medium text-slate-600 border border-slate-300 px-4 h-10 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Document list */}
      {!chatbotId ? (
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">📄</div>
          <p className="text-[15px] font-medium text-slate-900 mb-1">No chatbot selected</p>
          <p className="text-sm text-slate-500">Choose a chatbot from the dropdown above to see its documents.</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-48" />
                <div className="h-3 bg-slate-100 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">📄</div>
          <p className="text-[15px] font-medium text-slate-900 mb-1">No documents yet</p>
          <p className="text-sm text-slate-500 mb-5">Upload files to build this chatbot&apos;s knowledge base.</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Upload document
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {documents.map((doc) => {
            const cleanName = doc.fileName.replace(/^\d+-/, "");
            const statusStyle = STATUS_STYLES[doc.status] ?? "bg-slate-100 text-slate-500";
            return (
              <div
                key={doc.documentId}
                className="bg-white border border-slate-200 rounded-xl px-4 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                    {doc.fileType?.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">{cleanName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-slate-400">{doc.fileType}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-slate-400 hidden sm:block">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDocId(doc.documentId);
                      setDeleteOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-red-600 border border-red-200 px-3 h-9 rounded-lg hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page export — wraps inner component in Suspense ──
export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-3 max-w-3xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-48" />
              <div className="h-3 bg-slate-100 rounded w-28" />
            </div>
          </div>
        ))}
      </div>
    }>
      <DocumentsContent />
    </Suspense>
  );
}