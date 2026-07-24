"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChatbots } from "@/hooks/useChatbots";
import { useAuthStore } from "@/store/authStore";
import { X } from "lucide-react";
import Image from "next/image";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/chatbots",
    label: "Chatbots",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/properties",
    label: "Properties",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    ),
  },
  {
    href: "/accounts",
    label: "Accounts",
    adminOnly: true,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { data } = useChatbots();
  const firstChatbotId = data?.chatbots?.[0]?.chatbotId;
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const resolvedLinks = links
    .filter((link) => !link.adminOnly || isAdmin)
    .map((link) => {
      if (link.href === "/documents" && firstChatbotId) {
        return { ...link, href: `/documents?chatbotId=${firstChatbotId}` };
      }
      return link;
    });

  const isActive = (href) => {
    const base = href.split("?")[0];
    return pathname === base || pathname.startsWith(base + "/");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">
            <Image width={100} height={100} src={'/logo-mark.svg'} alt='logo' />
          </div>
          <span className="text-[15px] font-semibold text-slate-900 tracking-tight">
            Hostmind
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {resolvedLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-all ${
                active
                  ? "bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 pl-2.25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-[3px] border-transparent pl-2.25"
              }`}
            >
              <span className={active ? "text-blue-600" : "text-slate-400"}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400">© 2026 Hostmind</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-white border-r border-slate-200 flex-col h-full">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="relative w-64 bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
