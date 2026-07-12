"use client";

import { useState } from "react";

// --- date helpers -----------------------------------------------------

function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}/${y}`;
}

function isSameDay(a, b) {
  return a && b && a.getTime() === b.getTime();
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// --- component ----------------------------------------------------------

/**
 * A single-calendar check-in/check-out range picker, Apaleo-style.
 *
 * Selection flow:
 *  - No check-in yet, or a full range already picked  -> click starts a new check-in
 *  - Check-in picked, no check-out yet                -> click sets check-out (if after
 *                                                         check-in) or restarts check-in
 *                                                         (if same/earlier)
 * Past dates are disabled outright, so an invalid check-in can never be selected,
 * and check-out is only ever offered relative to whatever check-in is currently set.
 */
export default function DateRangeCalendar({
  checkIn,       // ISO string "yyyy-mm-dd" or ""
  checkOut,      // ISO string "yyyy-mm-dd" or ""
  onChange,      // ({ checkIn, checkOut }) => void
  primaryColor = "#2563eb",
}) {
  const today = toDateOnly(new Date());
  const initialMonth = checkIn ? new Date(checkIn) : today;
  const [viewMonth, setViewMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );

  const checkInDate = checkIn ? toDateOnly(new Date(checkIn)) : null;
  const checkOutDate = checkOut ? toDateOnly(new Date(checkOut)) : null;

  function handleDayClick(date) {
    if (date < today) return; // guard, even though disabled days shouldn't fire this

    const startingFresh = !checkInDate || (checkInDate && checkOutDate);

    if (startingFresh) {
      onChange({ checkIn: formatISO(date), checkOut: "" });
      return;
    }

    // We have a check-in, waiting on check-out
    if (date <= checkInDate) {
      // Picking an earlier/same date just moves check-in instead
      onChange({ checkIn: formatISO(date), checkOut: "" });
    } else {
      onChange({ checkIn: formatISO(checkInDate), checkOut: formatISO(date) });
    }
  }

  function isInRange(date) {
    if (!checkInDate || !checkOutDate) return false;
    return date > checkInDate && date < checkOutDate;
  }

  function buildDays(month) {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, m + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));
    return cells;
  }

  const days = buildDays(viewMonth);
  const monthLabel = viewMonth
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();

  function goPrevMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  }
  function goNextMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  }

  // Don't let the user navigate to months entirely before "today"
  const canGoPrev =
    new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1) >
    new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="w-full select-none">
      {/* Selected range header, mirrors the Apaleo widget's top bar */}
      <div
        className="border rounded-lg px-3 py-2 mb-3 flex items-center justify-between text-[13px]"
        style={{ borderColor: primaryColor }}
      >
        <div>
          <p className="text-[11px] font-medium mb-0.5" style={{ color: primaryColor }}>
            Check-in — Check-out
          </p>
          <p className="text-slate-800 font-medium">
            {checkIn ? formatDisplay(checkIn) : "Select date"}
            {" — "}
            {checkOut ? formatDisplay(checkOut) : ""}
          </p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[13px] font-semibold text-slate-800">{monthLabel}</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={goPrevMonth}
            disabled={!canGoPrev}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: "none", border: "none" }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNextMonth}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100"
            style={{ background: "none", border: "none" }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] font-medium text-slate-400 py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;

          const disabled = date < today;
          const isCheckIn = isSameDay(date, checkInDate);
          const isCheckOut = isSameDay(date, checkOutDate);
          const inRange = isInRange(date);

          let extraStyle = {};
          let textClass = "text-slate-800";

          if (isCheckIn || isCheckOut) {
            extraStyle = { backgroundColor: primaryColor };
            textClass = "text-white font-semibold";
          } else if (inRange) {
            extraStyle = { backgroundColor: `${primaryColor}22` };
          }

          return (
            <button
              type="button"
              key={date.toISOString()}
              onClick={() => handleDayClick(date)}
              disabled={disabled}
              className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-[13px] transition-colors
                ${disabled ? "text-slate-300 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100"}
                ${textClass}`}
              style={{ background: "none", border: "none", ...extraStyle }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}