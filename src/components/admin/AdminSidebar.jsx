'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const menu = [
  { icon: '▪', label: 'Dashboard',  href: '/admin' },
  { icon: '▪', label: 'Kategori',   href: '/admin/categories' },
  { icon: '▪', label: 'Produk',     href: '/admin/products' },
  { icon: '▪', label: 'Pesanan',    href: '/admin/orders' },
];

export default function AdminSidebar() {
  const path = usePathname();
  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#16161e',
      borderRight: '1px solid #2a2a3a', display: 'flex',
      flexDirection: 'column', padding: '0 0 24px 0', flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #2a2a3a' }}>
        <div style={{ fontWeight: 900, fontSize: 18, color: '#a78bfa', letterSpacing: '-0.5px' }}>VECHNOST</div>
        <div style={{ fontSize: 11, color: '#52526e', marginTop: 2 }}>Admin Panel</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {menu.map(m => {
          const active = m.href === '/admin' ? path === '/admin' : path.startsWith(m.href);
          return (
            <Link key={m.href} href={m.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, marginBottom: 2,
              background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: active ? '#a78bfa' : '#6b7280',
              fontWeight: active ? 600 : 400, fontSize: 14,
              textDecoration: 'none',
              borderLeft: active ? '2px solid #7c3aed' : '2px solid transparent',
              transition: 'all 0.15s'
            }}>
              {m.icon} {m.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0 10px' }}>
        <Link href="/" style={{ display: 'block', padding: '8px 12px', fontSize: 12, color: '#52526e', textDecoration: 'none', marginBottom: 4 }}>
          ← Lihat Toko
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/admin/login' })} style={{
          width: '100%', textAlign: 'left', padding: '8px 12px',
          background: 'none', border: 'none', fontSize: 12,
          color: '#ef4444', cursor: 'pointer'
        }}>Keluar</button>
      </div>
    </aside>
  );
}
