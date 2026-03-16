'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

/* ── icons (inline SVG keeps bundle small) ── */
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
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M7 4H17l-1 7a5 5 0 0 1-8 0L7 4z"/><path d="M7 4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2"/><path d="M17 4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2"/>
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

const badgeColor = {
  platinum: 'bg-slate-200/10 text-slate-200 border-slate-200/30',
  gold:     'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
  member:   'bg-blue-500/10 text-blue-300 border-blue-400/30',
};

export default function Navbar() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';
  const waNumber  = process.env.NEXT_PUBLIC_WHATSAPP || '6289521925299';

  // Close sidebar on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setSidebarOpen(false); setSearchOpen(false); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);
  const tier = session?.user?.tier || 'member';
  const avatarUrl = session?.user?.avatar
    ? `https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png?size=64`
    : null;

  const navLinks = [
    { href: '/',             icon: <IconHome/>,    label: 'HOME' },
    { href: '/orders',       icon: <IconReceipt/>, label: 'TRANSACTION' },
    { href: '/leaderboard',  icon: <IconTrophy/>,  label: 'LEADERBOARD' },
    { href: '/products',     icon: <IconBox/>,     label: 'PRODUCT' },
  ];

  return (
    <>
      {/* ─── SIDEBAR OVERLAY ─── */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      {/* ─── SIDEBAR DRAWER ─── */}
      <aside className={`sidebar-drawer ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:'var(--border)'}}>
          <span className="font-bold text-lg tracking-widest text-gradient">{storeName}</span>
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

        {/* After login: Profile section */}
        {session ? (
          <div className="px-4 py-4 flex flex-col gap-3">
            {/* Profile card */}
            <div className="profile-card">
              <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0" style={{borderColor:'#1d4ed8'}}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent-light font-bold text-lg">
                        {(session.user.name || 'U')[0].toUpperCase()}
                      </div>
                  }
                </div>
                {/* Info */}
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{session.user.name || session.user.discordName}</p>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-bold border uppercase ${badgeColor[tier] || badgeColor.member}`}>
                    {tier}
                  </span>
                  <p className="text-xs text-dim mt-1">
                    SALDO: <span className="text-accent-light font-semibold">
                      Rp {(session.user.balance || 0).toLocaleString('id-ID')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t mb-3" style={{borderColor:'#1d4ed8'}} />

              {/* Transaksi hari ini */}
              <p className="font-bold text-xs text-white mb-2 tracking-wider">TOTAL TRANSAKSI INI</p>
              <div className="stat-box mb-2">
                <p className="text-2xl font-bold text-white">{session.user.totalOrders || 0}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Pending',  val: session.user.pendingOrders || 0,  color: '#f59e0b' },
                  { label: 'Proses',   val: session.user.processOrders || 0,  color: '#60a5fa' },
                  { label: 'Sukses',   val: session.user.successOrders || 0,  color: '#10b981' },
                  { label: 'Gagal',    val: session.user.failedOrders  || 0,  color: '#ef4444' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="stat-box">
                    <p className="text-xl font-bold" style={{color}}>{val}</p>
                    <p className="text-xs text-dim mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Riwayat Transaksi */}
            <p className="font-bold text-sm text-white tracking-wider mt-1">RIWAYAT TRANSAKSI</p>
            <div className="text-xs text-dim text-center py-3">Tidak ada transaksi</div>

            {/* Separator */}
            <div className="border-t" style={{borderColor:'var(--border)'}} />

            {/* Profile link */}
            <Link href="/profile" onClick={closeSidebar}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-dim hover:text-white hover:bg-white/5 transition-all font-semibold text-sm tracking-wider">
              <span className="text-accent-light"><IconUser/></span>
              PROFILE
            </Link>

            {/* Logout */}
            <button onClick={() => { signOut(); closeSidebar(); }}
              className="mx-1 px-4 py-2.5 rounded-xl border text-sm font-semibold text-red-400 border-red-400/30 hover:bg-red-400/10 transition-colors text-left">
              Keluar
            </button>
          </div>
        ) : (
          /* Login with Discord */
          <div className="px-4 py-4 mt-auto">
            <button onClick={() => signIn('discord')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#5865F2] hover:bg-[#4752c4] transition-colors">
              <IconDiscord />
              LOGIN WITH DISCORD
            </button>
          </div>
        )}
      </aside>

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 border-b" style={{background:'var(--header-bg)', borderColor:'var(--border)'}}>
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          {/* Left: Hamburger */}
          <button onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border text-dim hover:text-white hover:border-accent/40 transition-colors flex-shrink-0"
            style={{borderColor:'var(--border)'}}>
            <IconMenu />
          </button>

          {/* Center: Brand Logo / GIF */}
          <Link href="/" className="flex-1 flex justify-center">
            <span className="font-black text-lg tracking-[0.2em] text-gradient" style={{fontFamily:'Rajdhani, sans-serif', letterSpacing:'0.25em'}}>
              {storeName}
            </span>
          </Link>

          {/* Right: Search + optional avatar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setSearchOpen(o => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border text-dim hover:text-white hover:border-accent/40 transition-colors"
              style={{borderColor:'var(--border)'}}>
              {searchOpen ? <IconX /> : <IconSearch />}
            </button>
          </div>
        </div>

        {/* Search bar dropdown */}
        <div className={`search-bar ${searchOpen ? 'open' : ''}`}>
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 bg-surface border rounded-xl px-3 py-2.5" style={{borderColor:'var(--border)'}}>
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

      {/* ─── SEPARATOR ─── */}
      <div className="h-px w-full" style={{background:'linear-gradient(90deg, transparent, #1d4ed8 30%, #1d4ed8 70%, transparent)'}} />

      {/* ─── FLOATING CS BUTTON ─── */}
      <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="cs-float" aria-label="Hubungi CS">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
}
