"use client";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useEffect } from "react";

export default function AdminLayoutClient({ children }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Apply light bg for admin pages
  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => document.body.classList.remove('admin-body');
  }, []);

  const mainMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar />
      <Backdrop />
      <div className={`transition-all duration-300 ease-in-out ${mainMargin}`}>
        <AppHeader />
        <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
