"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { Menu, LogOut } from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/chatbots": "Chatbots",
  "/chatbots/new": "New Chatbot",
  "/properties": "Properties",
  "/properties/new": "New Property",
  "/documents": "Documents",
};

function getPageTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/chatbots/") && pathname.endsWith("/edit")) return "Edit Chatbot";
  if (pathname.startsWith("/chatbots/")) return "Chatbot Settings";
  if (pathname.startsWith("/properties/") && pathname.endsWith("/edit")) return "Edit Property";
  return "HotelBot";
}

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Mobile brand mark */}
        <span className="lg:hidden text-[15px] font-semibold text-slate-900">HotelBot</span>

        {/* Desktop page title */}
        <h1 className="hidden lg:block text-lg font-semibold text-slate-900">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {user?.name && (
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[15px] text-slate-700 font-medium">{user.name}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-[14px] font-medium text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
