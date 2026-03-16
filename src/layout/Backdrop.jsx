"use client";
import { useSidebar } from "@/context/SidebarContext";

export default function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  if (!isMobileOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
}
