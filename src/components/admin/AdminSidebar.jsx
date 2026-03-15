'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const nav = [
  { label: 'Dashboard',  href: '/admin',              icon: '📊' },
  { label: 'Kategori',   href: '/admin/categories',   icon: '🏷️' },
  { label: 'Produk',     href: '/admin/products',     icon: '📦' },
  { label: 'Pesanan',    href: '/admin/orders',        icon: '🧾' },
];

export default function AdminSidebar() {
  const path = usePathname();
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';
  return (
    <aside className="w-56 min-h-screen bg-surface border-r border-border flex flex-col py-5 px-3 shrink-0">
      <div className="px-3 mb-6">
        <p className="font-extrabold text-lg text-gradient">{storeName}</p>
        <p className="text-xs text-muted">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map(n => {
          const active = n.href === '/admin' ? path === '/admin' : path.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-accent/15 text-text border-l-2 border-accent' : 'text-muted hover:text-text hover:bg-white/5 border-l-2 border-transparent'}`}>
              <span>{n.icon}</span>{n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border pt-4 px-3">
        <Link href="/" className="text-xs text-muted hover:text-text block mb-2">← Ke Toko</Link>
        <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="text-xs text-danger hover:text-red-400">Keluar</button>
      </div>
    </aside>
  );
}
