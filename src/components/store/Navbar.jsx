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
  const [csOpen, setCsOpen] = useState(false);
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

      {/* FLOATING CS BUTTON */}
      {csOpen && (
        <>
          <div
            style={{position:'fixed',inset:0,zIndex:98}}
            onClick={() => setCsOpen(false)}
          />
          <div style={{
            position:'fixed', bottom:'88px', right:'20px', zIndex:99,
            display:'flex', flexDirection:'column', gap:'10px',
            alignItems:'flex-end',
          }}>
            {/* Discord */}
            <a
              href="https://discord.com/users/1073527513671798845"
              target="_blank" rel="noreferrer"
              onClick={() => setCsOpen(false)}
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                background:'rgba(88,101,242,0.95)', backdropFilter:'blur(12px)',
                color:'#fff', textDecoration:'none', fontWeight:700, fontSize:'0.82rem',
                padding:'10px 16px', borderRadius:'24px',
                boxShadow:'0 4px 20px rgba(88,101,242,0.4)',
                whiteSpace:'nowrap',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Chat via Discord
            </a>
            {/* WhatsApp */}
            <a
              href="https://wa.me/6288289171435"
              target="_blank" rel="noreferrer"
              onClick={() => setCsOpen(false)}
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                background:'rgba(37,211,102,0.95)', backdropFilter:'blur(12px)',
                color:'#fff', textDecoration:'none', fontWeight:700, fontSize:'0.82rem',
                padding:'10px 16px', borderRadius:'24px',
                boxShadow:'0 4px 20px rgba(37,211,102,0.4)',
                whiteSpace:'nowrap',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              Chat via WhatsApp
            </a>
          </div>
        </>
      )}
      <button
        onClick={() => setCsOpen(o => !o)}
        className="cs-float"
        aria-label="Hubungi CS"
        style={{
          background: csOpen ? 'rgba(29,111,255,0.15)' : 'transparent',
          border: csOpen ? '1.5px solid rgba(29,111,255,0.4)' : '1.5px solid transparent',
          cursor:'pointer',
          borderRadius:'50%',
          transition:'all 0.2s',
        }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
        </svg>
      </button>
    </>
  );
}