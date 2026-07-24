"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProperty, useUploadPropertyImage } from "@/hooks/useProperties";
import { useChatbots, useAssignProperty } from "@/hooks/useChatbots";
import Link from "next/link";

export default function NewPropertyPage() {
  const router = useRouter();
  const { mutate: createProperty, isPending: isCreating, error: createError } = useCreateProperty();
  const { mutate: uploadImage, isPending: isUploadingImage } = useUploadPropertyImage();
  const { data: chatbotsData, isLoading: chatbotsLoading } = useChatbots();
  const chatbots = chatbotsData?.chatbots ?? chatbotsData ?? [];

  const [form, setForm] = useState({ name: "", apaleoCode: "", address: "", apiKey: "", chatbotId: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [assignError, setAssignError] = useState(null);

  const { mutate: assignProperty, isPending: isAssigning } = useAssignProperty(form.chatbotId);

  const isPending = isCreating || isUploadingImage || isAssigning;
  const error = createError || assignError;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function finishAssign(propertyId) {
    assignProperty(propertyId, {
      onSuccess: () => router.push("/properties"),
      onError: (err) => {
        setAssignError({
          message:
            err.message ||
            "Property was created, but couldn't be assigned to the chatbot. Open it from the edit page to assign it.",
        });
      },
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setAssignError(null);

    const { chatbotId, ...propertyFields } = form;

    createProperty(propertyFields, {
      onSuccess: (data) => {
        const propertyId = data.property.propertyId;

        if (!imageFile) {
          finishAssign(propertyId);
          return;
        }

        // Image picked — upload it, then assign regardless of the image
        // upload's outcome (a failed image upload shouldn't block the
        // property from being usable; the admin can retry from edit).
        uploadImage(
          { propertyId, file: imageFile },
          { onSettled: () => finishAssign(propertyId) },
        );
      },
    });
  }

  const inputClass =
    "w-full h-10 rounded-lg border border-slate-300 px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <div className="max-w-lg flex flex-col gap-6">
      {/* Back */}
      <Link href="/properties" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors w-fit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to properties
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">New property</h1>
        <p className="text-[15px] text-slate-500 mt-0.5">Add a hotel property to your account</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Property image */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Property photo <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-300 text-xl">🏨</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-slate-400">
                  {imageFile ? "Uploaded once you create the property." : "Shown on the property card in the list."}
                </p>
              </div>
            </div>
          </div>

          {/* Assign to chatbot */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Assign to chatbot</label>
            <div className="relative">
              <select
                name="chatbotId"
                value={form.chatbotId}
                onChange={handleChange}
                required
                disabled={chatbotsLoading}
                className={`${inputClass} appearance-none pr-9 bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
              >
                <option value="" disabled>
                  {chatbotsLoading ? "Loading chatbots…" : "Select a chatbot…"}
                </option>
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
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            {!chatbotsLoading && chatbots.length === 0 && (
              <p className="text-xs text-red-500">
                No chatbots exist yet.{" "}
                <Link href="/chatbots/new" className="text-blue-600 hover:underline">
                  Create one first.
                </Link>
              </p>
            )}
            <p className="text-xs text-slate-400">This property will only appear under the chatbot you pick here.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Property name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Grand Crito Hotel"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Apaleo code</label>
            <input
              name="apaleoCode"
              value={form.apaleoCode}
              onChange={handleChange}
              required
              placeholder="CRITO-001"
              className={`${inputClass} font-mono`}
            />
            <p className="text-xs text-slate-400">The property identifier from your Apaleo dashboard.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="123 Main Street, Peshawar, KPK"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              API key{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              name="apiKey"
              value={form.apiKey}
              onChange={handleChange}
              type="password"
              placeholder="sk-••••••••••••••••"
              className={inputClass}
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
              disabled={isPending || chatbots.length === 0}
              className="h-10 px-5 bg-blue-600 text-white text-[15px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            >
              {isCreating
                ? "Creating…"
                : isUploadingImage
                ? "Uploading photo…"
                : isAssigning
                ? "Assigning…"
                : "Create property"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/properties")}
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