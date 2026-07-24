"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProperty, useUpdateProperty, useUploadPropertyImage } from "@/hooks/useProperties";
import { useChatbots, useAssignProperty } from "@/hooks/useChatbots";
import Link from "next/link";

export default function EditPropertyPage({ params }) {
  const { propertyId } = use(params);
  const router = useRouter();

  const { data, isLoading } = useProperty(propertyId);
  const { mutate: updateProperty, isPending, error } = useUpdateProperty(propertyId);
  const {
    mutate: uploadImage,
    isPending: isUploadingImage,
    error: imageError,
  } = useUploadPropertyImage();
  const { data: chatbotsData, isLoading: chatbotsLoading } = useChatbots();
  const chatbots = chatbotsData?.chatbots ?? chatbotsData ?? [];

  const [form, setForm] = useState({ name: "", apaleoCode: "", address: "", apiKey: "" });
  const [chatbotId, setChatbotId] = useState("");
  const [initialChatbotId, setInitialChatbotId] = useState("");
  const [assignError, setAssignError] = useState(null);
  const [isReassigning, setIsReassigning] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Assigning enforces one-chatbot-per-property server-side (removes any
  // prior assignment automatically), so moving a property is just a single
  // assign call against the newly picked chatbotId.
  const { mutate: assignProperty } = useAssignProperty(chatbotId);

  useEffect(() => {
    if (data?.property) {
      const { name, apaleoCode, address, apiKey, chatbotId: currentChatbotId } = data.property;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({ name: name ?? "", apaleoCode: apaleoCode ?? "", address: address ?? "", apiKey: apiKey ?? "" });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChatbotId(currentChatbotId ?? "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialChatbotId(currentChatbotId ?? "");
    }
  }, [data]);

  // Revoke the local object URL once we no longer need the preview.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleImageUpload() {
    if (!imageFile) return;
    uploadImage(
      { propertyId, file: imageFile },
      {
        onSuccess: () => {
          setImageFile(null);
          setImagePreview(null);
        },
      },
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setAssignError(null);

    updateProperty(form, {
      onSuccess: () => {
        // Chatbot assignment didn't change — done.
        if (chatbotId === initialChatbotId) {
          router.push("/properties");
          return;
        }

        // Reassign: the backend clears the old assignment for us.
        setIsReassigning(true);
        assignProperty(propertyId, {
          onSuccess: () => {
            setIsReassigning(false);
            router.push("/properties");
          },
          onError: (err) => {
            setIsReassigning(false);
            setAssignError({
              message: err.message || "Details saved, but reassigning the chatbot failed.",
            });
          },
        });
      },
    });
  }

  const inputClass =
    "w-full h-10 rounded-lg border border-slate-300 px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

  if (isLoading) {
    return (
      <div className="max-w-lg flex flex-col gap-5 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-28" />
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-4 bg-slate-100 rounded w-28 mt-2" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

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
        <h1 className="text-xl font-semibold text-slate-900">Edit property</h1>
        <p className="text-[15px] text-slate-500 mt-0.5">Update the details for this property</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Property image */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Property photo</label>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                {imagePreview || data?.property?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview || data.property.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-300 text-xl">🏨</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100 cursor-pointer"
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={isUploadingImage}
                    className="self-start h-8 px-3 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {isUploadingImage ? "Uploading…" : "Upload photo"}
                  </button>
                )}
                {imageError && (
                  <p className="text-xs text-red-500">{imageError.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Assigned chatbot */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Assigned to chatbot</label>
            <div className="relative">
              <select
                value={chatbotId}
                onChange={(e) => setChatbotId(e.target.value)}
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
            {chatbotId !== initialChatbotId && chatbotId && (
              <p className="text-xs text-amber-600">
                Moving this property to a different chatbot will unassign it from its current one.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Property name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Grand Hotel"
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
              placeholder="GH-001"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main St, Berlin"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              API key <span className="text-slate-400 font-normal">(optional)</span>
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

          {(error || assignError) && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5">
              <span>⚠</span> {(error || assignError).message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.push("/properties")}
              className="h-10 px-4 text-[15px] font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isReassigning}
              className="h-10 px-5 bg-blue-600 text-white text-[15px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            >
              {isPending ? "Saving…" : isReassigning ? "Reassigning…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}