"use client";

import { useState, useEffect, useRef } from "react";

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export default function ColorField({ label, hint, value, onChange }) {
  const [text, setText] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const isFocused = useRef(false);

  // Keep the text input in sync when the value changes from elsewhere
  // (e.g. the swatch itself), but never fight the user while they're
  // actively typing in this field.
  useEffect(() => {
    if (!isFocused.current) setText(value);
  }, [value]);

  function handleSwatchChange(e) {
    onChange(e.target.value);
    setText(e.target.value);
    setInvalid(false);
  }

  function handleTextChange(e) {
    const next = e.target.value;
    setText(next);

    if (HEX_RE.test(next)) {
      setInvalid(false);
      onChange(next);
    } else {
      setInvalid(next.length > 0);
    }
  }

  function handleBlur() {
    isFocused.current = false;
    // Snap back to the last valid color if they left it half-typed or malformed.
    if (!HEX_RE.test(text)) {
      setText(value);
      setInvalid(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={handleSwatchChange}
        className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
      <input
        type="text"
        value={text}
        onFocus={() => (isFocused.current = true)}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder="#2563eb"
        spellCheck={false}
        className={`w-24 h-8 text-xs font-mono text-slate-700 border rounded-lg px-2 outline-none transition ${
          invalid
            ? "border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        }`}
      />
    </div>
  );
}