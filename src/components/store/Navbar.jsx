'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen]   = useState(false);
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';

  return (
    <nav style={{position:'sticky',top:0,zIndex:40,background:'rgba(10,10,18,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(30,30,46,0.8)'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 20px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/" style={{fontWeight:900,fontSize:18,color:'#a78bfa',textDecoration:'none',letterSpacing:'-0.5px'}}>{storeName}</Link>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {session ? (
            <div style={{position:'relative'}}>
              <button onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.05)',border:'1px solid #1e1e2e',borderRadius:999,padding:'6px 14px 6px 8px',cursor:'pointer'}}>
                {session.user.avatar
                  ? <img src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png?size=32`} style={{width:26,height:26,borderRadius:'50%'}} alt=""/>
                  : <div style={{width:26,height:26,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>{(session.user.name||'?')[0]}</div>
                }
                <span style={{fontSize:13,color:'#d1d5db',maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{session.user.name||session.user.discordName}</span>
              </button>
              {open && (
                <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',background:'#16161e',border:'1px solid #2a2a3a',borderRadius:12,width:180,boxShadow:'0 8px 32px rgba(0,0,0,0.4)',overflow:'hidden'}}>
                  <Link href="/orders" style={{display:'block',padding:'12px 16px',fontSize:13,color:'#d1d5db',textDecoration:'none'}} onClick={()=>setOpen(false)}>📋 Pesanan Saya</Link>
                  <button onClick={()=>{signOut();setOpen(false);}} style={{width:'100%',textAlign:'left',padding:'12px 16px',background:'none',border:'none',fontSize:13,color:'#ef4444',cursor:'pointer',borderTop:'1px solid #2a2a3a'}}>Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={()=>signIn('discord')} style={{background:'#5865F2',color:'#fff',border:'none',borderRadius:10,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              <svg width="16" height="12" viewBox="0 0 71 55" fill="white"><path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.9 40.9 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.7 37.7 0 0 0 25.4.5a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.6 4.9a.2.2 0 0 0-.1.1C1.5 18.1-1 31 .3 43.7a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.2 36.2 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.8-9 .2.2 0 0 0 .1-.2c1.5-15.3-2.5-28.6-10.5-40.4a.2.2 0 0 0-.1-.1ZM23.7 36c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/></svg>
              Login Discord
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
