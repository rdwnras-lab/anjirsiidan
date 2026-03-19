'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconReceipt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M7 4H17l-1 7a5 5 0 0 1-8 0L7 4z"/>
  </svg>
);
const IconBox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconDiscord = () => (
  <svg width="18" height="18" viewBox="0 0 71 55" fill="currentColor">
    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.7 37.7 0 0 0 25.4.5a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.6 4.9a.2.2 0 0 0-.1.1C1.5 18.1-1 31 .3 43.7a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.2 36.2 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.8-9 .2.2 0 0 0 .1-.2c1.5-15.3-2.5-28.6-10.5-40.4a.2.2 0 0 0-.1-.1ZM23.7 36c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
  </svg>
);

export default function Navbar() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';
  const logoUrl   = process.env.NEXT_PUBLIC_LOGO_URL || '';
  const waNumber  = process.env.NEXT_PUBLIC_WHATSAPP || '6289521925299';

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setSidebarOpen(false); setSearchOpen(false); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  const navLinks = [
    { href: '/',            icon: <IconHome/>,    label: 'HOME' },
    { href: '/orders',      icon: <IconReceipt/>, label: 'TRANSACTION' },
    { href: '/leaderboard', icon: <IconTrophy/>,  label: 'LEADERBOARD' },
    { href: '/products',    icon: <IconBox/>,     label: 'PRODUCT' },
  ];

  return (
    <>
      {/* SIDEBAR OVERLAY */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      {/* SIDEBAR DRAWER */}
      <aside className={`sidebar-drawer ${sidebarOpen ? 'open' : ''}`}>

        {/* Logo di atas sidebar — hanya image, tidak ada teks nama toko */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:'var(--border)'}}>
          <Link href="/" onClick={closeSidebar}>
            {logoUrl
              ? <img src={logoUrl} alt={storeName} style={{height:'32px', width:'auto', objectFit:'contain'}} />
              : <div style={{width:'32px', height:'32px', background:'rgba(29,111,255,0.2)', borderRadius:'8px'}} />
            }
          </Link>
          <button onClick={closeSidebar} className="text-dim hover:text-white transition-colors p-1">
            <IconX />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map(({ href, icon, label }) => (
            <Link key={href} href={href} onClick={closeSidebar}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-dim hover:text-white hover:bg-white/5 transition-all font-semibold text-sm tracking-wider">
              <span className="text-accent-light">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Separator */}
        <div className="mx-4 my-1 border-t" style={{borderColor:'var(--border)'}} />

        {/* Setelah login: hanya tampilkan link Profile & Logout, tanpa info detail */}
        {session ? (
          <div className="px-4 py-4 flex flex-col gap-2">
            <Link href="/profile" onClick={closeSidebar}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-dim hover:text-white hover:bg-white/5 transition-all font-semibold text-sm tracking-wider">
              <span className="text-accent-light"><IconUser /></span>
              PROFILE
            </Link>
            <button
              onClick={() => { signOut(); closeSidebar(); }}
              className="mx-1 mt-2 px-4 py-2.5 rounded-xl border text-sm font-semibold text-red-400 border-red-400/30 hover:bg-red-400/10 transition-colors text-left">
              Keluar
            </button>
          </div>
        ) : (
          /* Belum login: tombol Discord */
          <div className="px-4 py-4">
            <button onClick={() => { signIn('discord'); closeSidebar(); }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#5865F2] hover:bg-[#4752c4] transition-colors">
              <IconDiscord />
              LOGIN WITH DISCORD
            </button>
          </div>
        )}
      </aside>

      {/* HEADER */}
      <header className="sticky top-0 z-40" style={{background:'var(--header-bg)', borderBottom:'1px solid rgba(29,111,255,0.3)'}}>
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border text-dim hover:text-white transition-colors flex-shrink-0"
            style={{borderColor:'rgba(255,255,255,0.1)'}}>
            <IconMenu />
          </button>

          {/* Logo center */}
          <Link href="/" className="flex-1 flex justify-center">
            {logoUrl
              ? <img src={logoUrl} alt={storeName} style={{height:'38px', width:'auto', objectFit:'contain'}} />
              : <span className="font-black text-lg text-gradient" style={{fontFamily:'Rajdhani, sans-serif', letterSpacing:'0.25em'}}>{storeName}</span>
            }
          </Link>
          {/* Right: search */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(o => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border text-dim hover:text-white transition-colors flex-shrink-0"
              style={{borderColor:'rgba(255,255,255,0.1)'}}>
              {searchOpen ? <IconX /> : <IconSearch />}
            </button>
            
          </div>
        </div>

        {/* Search bar */}
        <div className={`search-bar ${searchOpen ? 'open' : ''}`}>
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)'}}>
              <IconSearch />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-dim outline-none"
                autoFocus={searchOpen}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ORANGE DIVIDER */}
      <div className="h-px w-full" style={{background:'linear-gradient(90deg, transparent, rgba(29,111,255,0.6) 30%, rgba(29,111,255,0.6) 70%, transparent)'}} />

      {/* FLOATING WA BUTTON */}
      <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="cs-float" aria-label="Hubungi CS">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
        </svg>
      </a>
    </>
  );
}