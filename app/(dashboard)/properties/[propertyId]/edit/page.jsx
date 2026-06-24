"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProperty, useUpdateProperty } from "@/hooks/useProperties";
import Link from "next/link";

export default function EditPropertyPage({ params }) {
  const { propertyId } = use(params);
  const router = useRouter();

  const { data, isLoading } = useProperty(propertyId);
  const { mutate: updateProperty, isPending, error } = useUpdateProperty(propertyId);

  const [form, setForm] = useState({ name: "", apaleoCode: "", address: "" });

  useEffect(() => {
    if (data?.property) {
      const { name, apaleoCode, address } = data.property;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({ name: name ?? "", apaleoCode: apaleoCode ?? "", address: address ?? "" });
    }
  }, [data]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    updateProperty(form, { onSuccess: () => router.push("/properties") });
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

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5">
              <span>⚠</span> {error.message}
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
              disabled={isPending}
              className="h-10 px-5 bg-blue-600 text-white text-[15px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            >
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
