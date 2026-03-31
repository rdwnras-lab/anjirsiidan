"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const DotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
  </svg>
);

const navItems = [
  {
    name: "Dashboard",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    path: "/admin",
  },
  {
    name: "Produk",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    subItems: [
      { name: "Semua Produk", path: "/admin/products" },
      { name: "Tambah Produk", path: "/admin/products/new" },
    ],
  },
  {
    name: "Kategori",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    path: "/admin/categories",
  },
  {
    name: "Pesanan",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    path: "/admin/orders",
  },
  {
    name: "Banner",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01"/></svg>,
    path: "/admin/banners",
  },
  {
    name: "Pembayaran",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    path: "/admin/payment-methods",
  },
  {
    name: "Tier Member",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    path: "/admin/tier-settings",
  },
  {
    name: "Topup",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    path: "/admin/topup",
  },
  {
    name: "Pengaturan",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    path: "/admin/settings",
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback((path) => path === pathname, [pathname]);

  const isSubmenuActive = useCallback((item) => {
    if (item.subItems) return item.subItems.some(s => pathname.startsWith(s.path));
    return isActive(item.path);
  }, [pathname, isActive]);

  useEffect(() => {
    navItems.forEach((nav, index) => {
      if (nav.subItems?.some(s => pathname.startsWith(s.path))) {
        setOpenSubmenu(index);
      }
    });
  }, [pathname]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight(prev => ({ ...prev, [key]: subMenuRefs.current[key]?.scrollHeight || 0 }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu(prev => prev === index ? null : index);
  };

  const showText = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-6 flex ${!showText ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {showText ? (
            <span className="font-black text-xl tracking-widest text-blue-600 dark:text-blue-400">VECHNOST</span>
          ) : (
            <span className="font-black text-xl text-blue-600 dark:text-blue-400">V</span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav>
          <h2 className={`mb-3 text-xs uppercase text-gray-400 flex ${!showText ? "lg:justify-center" : "justify-start"}`}>
            {showText ? "Menu" : <svg width="16" height="4" viewBox="0 0 24 4" fill="currentColor"><circle cx="4" cy="2" r="2"/><circle cx="12" cy="2" r="2"/><circle cx="20" cy="2" r="2"/></svg>}
          </h2>
          <ul className="flex flex-col gap-1">
            {navItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.subItems ? (
                  <>
                    <button
                      onClick={() => handleSubmenuToggle(index)}
                      className={`menu-item group w-full ${isSubmenuActive(nav) ? "menu-item-active" : "menu-item-inactive"} ${!showText ? "lg:justify-center" : ""}`}
                    >
                      <span className={isSubmenuActive(nav) ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                        {nav.icon}
                      </span>
                      {showText && (
                        <>
                          <span className="flex-1 text-left">{nav.name}</span>
                          <span className={`transition-transform duration-200 ${openSubmenu === index ? "rotate-180" : ""} ${isSubmenuActive(nav) ? "menu-item-arrow-active" : "menu-item-arrow-inactive"}`}>
                            <ChevronDown />
                          </span>
                        </>
                      )}
                    </button>
                    {showText && (
                      <div
                        ref={el => { subMenuRefs.current[`main-${index}`] = el; }}
                        style={{ height: openSubmenu === index ? `${subMenuHeight[`main-${index}`]}px` : "0px" }}
                        className="overflow-hidden transition-all duration-300"
                      >
                        <ul className="mt-1 ml-9 flex flex-col gap-1">
                          {nav.subItems.map(sub => (
                            <li key={sub.name}>
                              <Link href={sub.path}
                                className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={nav.path}
                    className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"} ${!showText ? "lg:justify-center" : ""}`}>
                    <span className={isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                      {nav.icon}
                    </span>
                    {showText && <span>{nav.name}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider + Store link */}
        {showText && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Link href="/" className="menu-item group menu-item-inactive">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>← Ke Toko</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;