'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const nav = [
  { label: 'Dashboard', href: '/admin',             icon: '📊' },
  { label: 'Kategori',  href: '/admin/categories',  icon: '🏷️' },
  { label: 'Produk',    href: '/admin/products',    icon: '📦' },
  { label: 'Banner',    href: '/admin/banners',     icon: '🖼️' },
  { label: 'Pesanan',   href: '/admin/orders',      icon: '🧾' },
];

export default function AdminSidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-12"
        style={{background:'#050f1e', borderBottom:'1px solid #0e2445'}}>
        <span className="font-black text-sm tracking-widest" style={{color:'#60a5fa'}}>{storeName} ADMIN</span>
        <button onClick={() => setOpen(o => !o)} className="p-2 rounded-lg" style={{background:'#091828', border:'1px solid #0e2445', color:'#7bafd4'}}>
          {open
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40" style={{background:'rgba(0,0,0,0.6)'}} onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer / Desktop sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50
        w-52 flex flex-col py-4 px-3
        transition-transform duration-300
        md:translate-x-0 md:min-h-screen
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `} style={{background:'#050f1e', borderRight:'1px solid #0e2445'}}>

        {/* Logo - desktop only */}
        <div className="hidden md:block px-3 mb-5">
          <p className="font-extrabold text-base" style={{color:'#60a5fa'}}>{storeName}</p>
          <p className="text-xs" style={{color:'#3d5a7a'}}>Admin Panel</p>
        </div>

        {/* Close button mobile */}
        <div className="md:hidden flex justify-between items-center px-3 mb-4 pt-1">
          <p className="font-extrabold text-sm" style={{color:'#60a5fa'}}>{storeName}</p>
          <button onClick={() => setOpen(false)} style={{color:'#3d5a7a'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5">
          {nav.map(n => {
            const active = n.href === '/admin' ? path === '/admin' : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={active
                  ? {background:'rgba(29,111,255,0.15)', color:'#e8f4ff', borderLeft:'2px solid #1d6fff', paddingLeft:'10px'}
                  : {color:'#3d5a7a', borderLeft:'2px solid transparent', paddingLeft:'10px'}
                }>
                <span style={{fontSize:'15px'}}>{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-3 space-y-2" style={{borderTop:'1px solid #0e2445'}}>
          <Link href="/" onClick={() => setOpen(false)} className="block text-xs py-1.5" style={{color:'#3d5a7a'}}>← Ke Toko</Link>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-xs py-1.5" style={{color:'#ef4444'}}>Keluar</button>
        </div>
      </aside>

      {/* Mobile content padding */}
      <style>{`@media (max-width: 767px) { .admin-main { padding-top: 48px; } }`}</style>
    </>
  );
}
