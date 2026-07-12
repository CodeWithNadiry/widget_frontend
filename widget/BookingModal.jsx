"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DateRangeCalendar from "@/components/Daterangecalendar";

async function fetchProperties(chatbotId) {
  const res = await fetch(`/api/properties?chatbotId=${encodeURIComponent(chatbotId)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load hotels.");
  return data.properties; // [{ propertyId, name, address }]
}

function formatDisplay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}/${y}`;
}

export default function BookingModal({ open, onClose, chatbotId, onSearch, theme }) {
  const [propertyId, setPropertyId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["chatbot-properties", chatbotId],
    queryFn: () => fetchProperties(chatbotId),
    enabled: open && !!chatbotId,
    staleTime: 5 * 60 * 1000,
  });

  // Only one hotel → auto-select it, skip showing the destination field.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (properties.length === 1) setPropertyId(properties[0].propertyId);
  }, [properties]);

  // Reset the form each time the modal is closed, so reopening starts fresh.
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckIn("");
      setCheckOut("");
      setAdults("");
      setShowCalendar(false);
      if (properties.length !== 1) setPropertyId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const needsDestination = properties.length > 1;
  const isComplete =
    (!needsDestination || propertyId) &&
    checkIn &&
    checkOut &&
    checkOut > checkIn && // belt-and-suspenders; the calendar already enforces this
    adults &&
    Number(adults) > 0;

  async function handleSearch() {
    if (!isComplete || isSearching) return;
    setIsSearching(true);
    const ok = await onSearch({
      propertyId: needsDestination ? propertyId : properties[0]?.propertyId,
      arrival: checkIn,
      departure: checkOut,
      adults: Number(adults),
    });
    setIsSearching(false);
    if (!ok) {
      // onSearch already surfaces the error via useChat's error state; keep
      // the modal open so the guest can adjust and retry.
    }
  }

  return (
    <>
      {/* click-outside catcher — no dimming, just closes on outside click */}
      <div
        className="absolute inset-0 z-10"
        onClick={() => {
          if (showCalendar) {
            setShowCalendar(false);
          } else {
            onClose();
          }
        }}
      />

      <div
        className="absolute z-20 bg-white shadow-xl p-4
          inset-x-0 bottom-0 rounded-t-2xl border-t border-slate-200
          sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:w-[320px] sm:rounded-2xl sm:border sm:border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-semibold text-slate-900">
            {showCalendar ? "Select Dates" : "Book a Stay"}
          </p>
          <button
            onClick={() => (showCalendar ? setShowCalendar(false) : onClose())}
            aria-label="Close"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
            style={{ background: "none", border: "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showCalendar ? (
          <>
            <DateRangeCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={({ checkIn: ci, checkOut: co }) => {
                setCheckIn(ci);
                setCheckOut(co);
              }}
              primaryColor={theme?.primaryColor || "#2563eb"}
            />
            <button
              onClick={() => setShowCalendar(false)}
              disabled={!checkIn || !checkOut}
              className="mt-3 w-full text-white text-[13px] font-medium py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
              style={{ backgroundColor: theme?.primaryColor || "#2563eb" }}
            >
              Done
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2.5">
            {needsDestination && (
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">Destination</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  disabled={propertiesLoading}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13px] text-slate-800 outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {propertiesLoading ? "Loading hotels..." : "Select a hotel"}
                  </option>
                  {properties.map((p) => (
                    <option key={p.propertyId} value={p.propertyId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Dates</label>
              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13px] text-left text-slate-800 outline-none hover:border-blue-500 transition-colors cursor-pointer"
                style={{ background: "none" }}
              >
                {checkIn && checkOut
                  ? `${formatDisplay(checkIn)}  →  ${formatDisplay(checkOut)}`
                  : "Select check-in / check-out"}
              </button>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Guests</label>
              <input
                type="number"
                min={1}
                max={10}
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                placeholder="Number of adults"
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13px] text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={!isComplete || isSearching}
              className="mt-1 w-full text-white text-[13px] font-medium py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
              style={{ backgroundColor: theme?.primaryColor || "#2563eb" }}
            >
              {isSearching ? "Searching..." : "Search Offers"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}