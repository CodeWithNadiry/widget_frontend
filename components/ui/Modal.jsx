"use client";

import { useEffect, useRef } from "react";

export default function Modal({ open, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-0 shadow-lg backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-none max-sm:w-sm"
    >
      <div className="p-6">{children}</div>
    </dialog>
  );
}