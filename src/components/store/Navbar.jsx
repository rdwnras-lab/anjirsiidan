'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen]   = useState(false);
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';

  return (
    <nav className="sticky top-0 z-40 bg-bg/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-lg tracking-tight text-gradient">{storeName}</Link>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5 text-sm hover:border-accent/40 transition-colors">
                {session.user.avatar
                  ? <img src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png?size=32`} className="w-6 h-6 rounded-full" alt="" />
                  : <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">{session.user.name?.[0]}</div>
                }
                <span className="text-dim max-w-[120px] truncate">{session.user.name || session.user.discordName}</span>
              </button>
              {open && (
                <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-2xl py-1 w-44">
                  <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-white/5 text-dim" onClick={() => setOpen(false)}>📋 Pesanan Saya</Link>
                  <button onClick={() => { signOut(); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 text-danger">Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => signIn('discord')}
              className="bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <svg width="16" height="12" viewBox="0 0 71 55" fill="white"><path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.7 37.7 0 0 0 25.4.5a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.6 4.9a.2.2 0 0 0-.1.1C1.5 18.1-1 31 .3 43.7a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.2 36.2 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.8-9 .2.2 0 0 0 .1-.2c1.5-15.3-2.5-28.6-10.5-40.4a.2.2 0 0 0-.1-.1ZM23.7 36c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/></svg>
              Login Discord
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
