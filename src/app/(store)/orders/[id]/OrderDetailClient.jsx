'use client';
import { useState } from 'react';
import { formatIDR } from '@/lib/utils';
import Link from 'next/link';

const statusLabel = {
  pending: 'Menunggu', paid: 'Dibayar', processing: 'Diproses',
  completed: 'Selesai', failed: 'Gagal', cancelled: 'Dibatalkan',
};
const statusColor = {
  pending: '#fbbf24', paid: '#60a5fa', processing: '#a78bfa',
  completed: '#10b981', failed: '#ef4444', cancelled: '#6b7280',
};

export default function OrderDetailClient({ order, canSeeKeys }) {
  const [copied, setCopied] = useState(null);

  const thumbnail   = order.products?.thumbnail || null;
  const keys        = order.order_keys || [];
  const isCompleted = order.status === 'completed';
  const isAuto      = order.delivery_type === 'auto';
  const qty         = order.quantity || 1;
  const formEntries = Object.entries(order.form_data || {});

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{maxWidth:'448px', margin:'0 auto', paddingBottom:'40px'}}>

      {/* ── Banner: hijau jika selesai, biru jika belum */}
      <div style={{
        position:'relative', overflow:'hidden',
        background: isCompleted
          ? 'linear-gradient(135deg,#0a2e1a 0%,#0f3d22 50%,#0a2e1a 100%)'
          : 'linear-gradient(135deg,#0a1a4a 0%,#0f2d6e 40%,#1a3fa3 70%,#0a1a4a 100%)',
        backgroundSize:'300% 300%', animation:'bannerShift 6s ease infinite',
        padding:'32px 20px 44px', textAlign:'center',
      }}>
        <div style={{position:'absolute',inset:0,background: isCompleted
          ? 'linear-gradient(135deg,rgba(34,197,94,0.2) 0%,transparent 50%,rgba(34,197,94,0.15) 100%)'
          : 'linear-gradient(135deg,rgba(29,111,255,0.25) 0%,transparent 50%,rgba(29,111,255,0.15) 100%)'
        }}/>
        {[{w:90,h:90,t:-20,l:-20},{w:60,h:60,b:-10,r:-10},{w:40,h:40,t:20,r:'25%'}].map((o,i)=>(
          <div key={i} style={{position:'absolute',width:o.w,height:o.h,borderRadius:'50%',
            background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(29,111,255,0.15)',
            top:o.t,left:o.l,right:o.r,bottom:o.b,filter:'blur(2px)',animation:`orb${i} ${4+i}s ease-in-out infinite`}}/>
        ))}
        <div style={{position:'absolute',bottom:-2,left:0,right:0,height:'32px',background:'#0a1628',clipPath:'ellipse(60% 100% at 50% 100%)'}}/>
        <div style={{
          width:'60px',height:'60px',borderRadius:'50%',margin:'0 auto 14px',
          background: isCompleted ? 'rgba(34,197,94,0.2)' : 'rgba(29,111,255,0.2)',
          border: isCompleted ? '1.5px solid rgba(34,197,94,0.5)' : '1.5px solid rgba(96,165,250,0.4)',
          display:'flex',alignItems:'center',justifyContent:'center',
          position:'relative',zIndex:1,
          animation: isCompleted ? 'successPulse 2s ease-in-out infinite' : 'iconPulse 2.5s ease-in-out infinite',
        }}>
          {isCompleted
            ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          }
        </div>
        <h1 style={{position:'relative',zIndex:1,margin:0,fontWeight:900,fontSize:'1.25rem',color:'#fff'}}>
          {isCompleted ? 'Pembayaran Berhasil!' : (statusLabel[order.status] || order.status)}
        </h1>
        <p style={{position:'relative',zIndex:1,margin:'6px 0 0',fontSize:'0.8rem',color:'rgba(255,255,255,0.55)'}}>
          {isCompleted ? 'Pesananmu telah selesai diproses.' : 'Detail pesanan kamu ada di bawah.'}
        </p>
        <style>{`
          @keyframes bannerShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
          @keyframes successPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}50%{box-shadow:0 0 0 14px rgba(34,197,94,0)}}
          @keyframes iconPulse{0%,100%{box-shadow:0 0 0 0 rgba(29,111,255,0.5)}50%{box-shadow:0 0 0 14px rgba(29,111,255,0)}}
          @keyframes orb0{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,8px)}}
          @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-6px)}}
          @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,10px)}}
        `}</style>
      </div>

      <div style={{padding:'20px 16px 0', display:'flex', flexDirection:'column', gap:'12px'}}>

        {/* ── Back link */}
        <Link href="/profile" style={{color:'rgba(255,255,255,0.45)',fontSize:'0.8rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'6px'}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Pesanan Saya
        </Link>

        {/* ── Produk card + form data (seperti foto ref) */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom: formEntries.length > 0 ? '14px' : 0}}>
            <div style={{width:'56px',height:'56px',borderRadius:'12px',flexShrink:0,overflow:'hidden',
              background: isCompleted ? 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(10,22,64,0.8))' : 'linear-gradient(135deg,rgba(29,111,255,0.15),rgba(10,22,64,0.8))',
              border: isCompleted ? '1.5px solid rgba(34,197,94,0.3)' : '1.5px solid rgba(29,111,255,0.3)',
              display:'flex',alignItems:'center',justifyContent:'center'}}>
              {thumbnail ? <img src={thumbnail} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:'1.6rem'}}>🎮</span>}
            </div>
            <div style={{flex:1}}>
              <p style={{margin:0,fontWeight:800,color:'#fff',fontSize:'1rem'}}>{order.product_name}</p>
              <p style={{margin:'3px 0 0',fontSize:'0.82rem',fontWeight:600,color: isCompleted ? '#4ade80' : '#60a5fa'}}>
                {order.variant_name}{qty > 1 ? ` ×${qty}` : ''}
              </p>
            </div>
          </div>
          {/* Form fields (ID, Server, Username, dll) */}
          {formEntries.length > 0 && (
            <div style={{borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:'12px',display:'flex',flexDirection:'column',gap:'8px'}}>
              {formEntries.map(([k, v]) => (
                <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.45)',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600}}>{k}</span>
                  <span style={{fontSize:'0.85rem',fontWeight:700,color:'#e8f4ff'}}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Pricing card (seperti foto ref) */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
            <span style={{color:'rgba(255,255,255,0.5)',fontSize:'0.85rem',fontWeight:600}}>Harga</span>
            <span style={{color:'#e8f4ff',fontSize:'0.85rem',fontWeight:600}}>
              {qty > 1
                ? `${formatIDR(Math.round(order.base_amount / qty))} × ${qty}`
                : formatIDR(order.base_amount)}
            </span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
            <span style={{color:'rgba(255,255,255,0.5)',fontSize:'0.85rem',fontWeight:600}}>Payment Fee</span>
            <span style={{color:'rgba(255,255,255,0.4)',fontSize:'0.85rem'}}>{formatIDR(order.fee_amount || 0)}</span>
          </div>
          <div style={{height:'1px',background:'rgba(255,255,255,0.08)',margin:'10px 0'}}/>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'#fff',fontWeight:800,fontSize:'0.95rem'}}>Total Pembayaran</span>
            <span style={{color: isCompleted ? '#4ade80' : '#60a5fa',fontWeight:900,fontSize:'1.05rem'}}>{formatIDR(order.total_amount)}</span>
          </div>
        </div>

        {/* ── Invoice card (seperti foto ref) */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px'}}>
          {/* Metode */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'14px'}}>
            <span style={{color:'rgba(255,255,255,0.45)',fontSize:'0.82rem'}}>Metode Pembayaran</span>
            <span style={{color:'#fff',fontWeight:700,fontSize:'0.85rem'}}>
              {order.payment_method_id ? (order.payment_methods?.provider || 'Transfer') : 'QRIS'}
            </span>
          </div>
          {/* Nomor Invoice */}
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.82rem',margin:'0 0 8px'}}>Nomor Invoice</p>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
            <div style={{flex:1,background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'9px 12px',fontFamily:'monospace',fontSize:'0.78rem',color:'#e8f4ff',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{order.id}</div>
            <button onClick={() => copy(order.id, 'id')} style={{flexShrink:0,width:'36px',height:'36px',borderRadius:'10px',cursor:'pointer',background:copied==='id'?'rgba(16,185,129,0.15)':'rgba(255,255,255,0.07)',border:copied==='id'?'1px solid rgba(16,185,129,0.4)':'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}>
              {copied==='id' ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
            </button>
          </div>
          {/* Status badges */}
          <div style={{display:'flex',gap:'24px'}}>
            <div>
              <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.78rem',margin:'0 0 6px'}}>Status Pembayaran</p>
              <span style={{display:'inline-block',padding:'4px 14px',borderRadius:'7px',fontSize:'0.72rem',fontWeight:800,letterSpacing:'0.06em',
                background: isCompleted ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.1)',
                color: isCompleted ? '#4ade80' : '#fbbf24',
                border: isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(251,191,36,0.25)',
              }}>{isCompleted ? 'PAID' : 'UNPAID'}</span>
            </div>
            <div>
              <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.78rem',margin:'0 0 6px'}}>Status Transaksi</p>
              <span style={{display:'inline-block',padding:'4px 14px',borderRadius:'7px',fontSize:'0.72rem',fontWeight:800,letterSpacing:'0.06em',
                background: isCompleted ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.1)',
                color: isCompleted ? '#4ade80' : '#fbbf24',
                border: isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(251,191,36,0.25)',
              }}>{isCompleted ? 'SUKSES' : (statusLabel[order.status] || order.status).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* ── Delivery section: key atau tunggu admin */}
        {isCompleted && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px'}}>
            {isAuto && keys.length > 0 && canSeeKeys ? (
              <>
                <p style={{margin:'0 0 12px',fontWeight:700,color:'#fff',fontSize:'0.88rem'}}>
                  Here is your {order.variant_name}
                </p>
                {keys.map((k, i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom: i < keys.length - 1 ? '8px' : 0}}>
                    <div style={{flex:1,background:'rgba(0,0,0,0.4)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'10px',padding:'10px 14px',fontFamily:'monospace',fontSize:'0.85rem',color:'#4ade80',fontWeight:700,wordBreak:'break-all'}}>{k.key_content}</div>
                    <button onClick={() => copy(k.key_content, `key-${i}`)} style={{flexShrink:0,width:'36px',height:'36px',borderRadius:'10px',cursor:'pointer',background:copied===`key-${i}`?'rgba(34,197,94,0.15)':'rgba(255,255,255,0.07)',border:copied===`key-${i}`?'1px solid rgba(34,197,94,0.4)':'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}>
                      {copied===`key-${i}` ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(96,165,250,0.15)',border:'1px solid rgba(96,165,250,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <p style={{margin:0,fontWeight:700,color:'#fff',fontSize:'0.88rem'}}>Pesanan Sedang Diproses</p>
                  <p style={{margin:'3px 0 0',color:'rgba(255,255,255,0.5)',fontSize:'0.78rem'}}>Admin akan memproses pesanan, mohon ditunggu.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}