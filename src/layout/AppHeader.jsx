"use client";
import { useSidebar } from "@/context/SidebarContext";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  const avatarUrl = session?.user?.image || null;
  const name = session?.user?.name || "Admin";

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between w-full px-4 py-3 lg:px-6">
        {/* Left: hamburger */}
        <button onClick={handleToggle}
          className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800">
          {isMobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="0" y1="1" x2="18" y2="1"/><line x1="0" y1="7" x2="18" y2="7"/><line x1="0" y1="13" x2="10" y2="13"/></svg>
          )}
        </button>

        {/* Center: page title */}
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
          VECHNOST Admin Panel
        </span>

        {/* Right: user */}
        <div className="relative">
          <button onClick={() => setUserMenuOpen(o => !o)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
              {avatarUrl
                ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                : <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{name[0]}</span>
              }
            </div>
            <span className="text-sm font-medium hidden sm:block">{name}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1 z-50">
              <Link href="/" onClick={() => setUserMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                ← Ke Toko
              </Link>
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              <button onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
