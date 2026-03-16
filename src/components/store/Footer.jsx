import Link from 'next/link';

export default function Footer() {
  const name = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';
  return (
    <footer style={{background:'var(--footer-bg)', borderTop:'1px solid var(--border)'}}>
      <div className="max-w-2xl mx-auto px-5 pt-10 pb-6">

        {/* Brand */}
        <p className="font-black text-xl tracking-[0.2em] text-white mb-2" style={{fontFamily:'Rajdhani, sans-serif'}}>
          {name}
        </p>
        <p className="text-xs text-dim leading-relaxed mb-8" style={{maxWidth:'320px'}}>
          {name} adalah platform independen untuk trading product digital. Kami tidak berafiliasi dengan, didukung oleh, atau disponsori. Semua trademark adalah milik pemiliknya masing-masing dan digunakan hanya untuk tujuan identifikasi. Tidak ada konten yang kami buat yang mengklaim kepemilikan atas trademark pihak ketiga.
        </p>

        {/* Menu */}
        <p className="font-bold text-sm text-white mb-3 tracking-wider">MENU</p>
        <div className="flex flex-col gap-2 mb-8">
          {[
            { href: '/',            label: 'HOME' },
            { href: '/orders',      label: 'TRANSACTION' },
            { href: '/leaderboard', label: 'LEADERBOARD' },
            { href: '/products',    label: 'PRODUCT' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm text-dim hover:text-accent-light transition-colors w-fit">
              {label}
            </Link>
          ))}
        </div>

        {/* Social media */}
        <p className="font-bold text-sm text-white mb-3 tracking-wider">SOCIAL MEDIA</p>
        <div className="flex gap-4 mb-8">
          {/* Instagram */}
          <a href="https://instagram.com/vechnost.id" target="_blank" rel="noreferrer"
            className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all hover:border-pink-400/50 hover:bg-pink-400/10"
            style={{borderColor:'var(--border)', background:'var(--card-bg)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="#f472b6"/>
            </svg>
          </a>
          {/* Discord */}
          <a href="https://discord.gg/pFhdW9ZwwY" target="_blank" rel="noreferrer"
            className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10"
            style={{borderColor:'var(--border)', background:'var(--card-bg)'}}>
            <svg width="18" height="18" viewBox="0 0 71 55" fill="#7289da">
              <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.7 37.7 0 0 0 25.4.5a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.6 4.9a.2.2 0 0 0-.1.1C1.5 18.1-1 31 .3 43.7a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.2 36.2 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.8-9 .2.2 0 0 0 .1-.2c1.5-15.3-2.5-28.6-10.5-40.4a.2.2 0 0 0-.1-.1ZM23.7 36c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
            </svg>
          </a>
          {/* WhatsApp */}
          <a href="https://wa.me/6289521925299" target="_blank" rel="noreferrer"
            className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all hover:border-green-400/50 hover:bg-green-400/10"
            style={{borderColor:'var(--border)', background:'var(--card-bg)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>

        {/* Separator */}
        <div className="border-t mb-4" style={{borderColor:'var(--border)'}} />

        {/* Copyright */}
        <p className="text-xs text-dim text-center">
          Copyright © 2026 <span className="text-white font-semibold">{name}</span>. All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
