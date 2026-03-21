'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const WINDOW_MS = 30 * 60 * 1000; // 30 menit

// Ambil atau buat expiry timestamp di localStorage
// - First load → buat expiresAt = now + 30min, simpan
// - Refresh    → baca nilai lama, pakai (countdown lanjut dari posisi sebelumnya)
// - Expired    → nilai lama tetap dikembalikan, timer akan tampil 00:00 / expired
function getExpiresAt(orderId) {
  const key = `vech_exp_${orderId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const val = Number(raw);
      // Valid: angka positif dan tidak lebih dari 31 menit di masa depan (anti tamper)
      if (val > 0 && val <= Date.now() + 31 * 60 * 1000) {
        return val;
      }
    }
  } catch {}
  // Belum ada / tidak valid → buat baru
  const exp = Date.now() + WINDOW_MS;
  try { localStorage.setItem(key, String(exp)); } catch {}
  return exp;
}

export default function CheckoutClient({ order }) {
  const router = useRouter();

  const [status,   setStatus]   = useState(order.status === 'completed' ? 'completed' : 'pending');
  const [timeLeft, setTimeLeft] = useState('30:00');
  const [expired,  setExpired]  = useState(false);
  const [qrImage,  setQrImage]  = useState('');
  const [copied,   setCopied]   = useState(null);

  const isManual    = !order.payment_qr;
  const manualQrUrl = process.env.NEXT_PUBLIC_MANUAL_QR_URL || 'https://i.ibb.co.com/JR78g396/vechqr.png';
  const thumbnail   = order.products?.thumbnail || null;
  // Langsung pakai dari server join — tidak perlu fetch, tidak ada flash
  const payMethodDetail = order.payment_methods || null;

  // Generate QR
  useEffect(() => {
    if (!order.payment_qr || isManual) return;
    import('qrcode').then(QRCode =>
      QRCode.toDataURL(order.payment_qr, {
        width: 300, margin: 2, color: { dark: '#000', light: '#fff' },
      }).then(setQrImage)
    );
  }, [order.payment_qr, isManual]);

  // Timer — seluruhnya dari localStorage, tidak bergantung DB sama sekali
  useEffect(() => {
    if (isManual || status === 'completed') return;

    // getExpiresAt hanya jalan di client (useEffect tidak SSR)
    const expiresAt = getExpiresAt(order.id);

    const tick = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft('00:00');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    tick(); // jalankan langsung supaya timer langsung tampil
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isManual, status, order.id]);

  // Poll status setiap 5 detik
  const checkStatus = useCallback(async () => {
    if (status === 'completed' || expired) return;
    try {
      const res  = await fetch(`/api/payment/status?orderId=${order.id}`);
      const data = await res.json();
      if (data.status === 'completed') {
        setStatus('completed');
        setTimeout(() => router.push(`/orders/${order.id}`), 1500);
      }
    } catch {}
  }, [order.id, router, status, expired]);

  useEffect(() => {
    const id = setInterval(checkStatus, 5000);
    return () => clearInterval(id);
  }, [checkStatus]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(order.id);
    setCopied('id');
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Berhasil
  if (status === 'completed') return (
    <div style={{maxWidth:'448px',margin:'0 auto',paddingBottom:'40px'}}>
      {/* Banner success */}
      <div style={{
        position:'relative',overflow:'hidden',
        background:'linear-gradient(135deg,#0a2e1a 0%,#0f3d22 50%,#0a2e1a 100%)',
        padding:'32px 20px 44px',textAlign:'center',
      }}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(34,197,94,0.2) 0%,transparent 50%,rgba(34,197,94,0.15) 100%)',backgroundSize:'300% 300%',animation:'bg 5s ease infinite'}}/>
        {[{w:90,h:90,t:-20,l:-20,c:'rgba(34,197,94,0.15)'},{w:60,h:60,b:-15,r:-10,c:'rgba(34,197,94,0.1)'},{w:40,h:40,t:30,r:'30%',c:'rgba(34,197,94,0.08)'}].map((o,i)=>(
          <div key={i} style={{position:'absolute',width:o.w,height:o.h,borderRadius:'50%',background:o.c,top:o.t,left:o.l,right:o.r,bottom:o.b,animation:`orb${i} ${4+i}s ease-in-out infinite`,filter:'blur(2px)'}}/>
        ))}
        <div style={{position:'absolute',bottom:-2,left:0,right:0,height:'32px',background:'#0a1628',clipPath:'ellipse(60% 100% at 50% 100%)'}}/>
        <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(34,197,94,0.2)',border:'2px solid rgba(34,197,94,0.5)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',position:'relative',zIndex:1,animation:'successPulse 2s ease-in-out infinite'}}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{position:'relative',zIndex:1,margin:0,fontWeight:900,fontSize:'1.3rem',color:'#fff'}}>Pembayaran Berhasil!</h1>
        <p style={{position:'relative',zIndex:1,margin:'6px 0 0',fontSize:'0.8rem',color:'rgba(255,255,255,0.55)'}}>Terima kasih, pesananmu sedang diproses.</p>
        <style>{`
          @keyframes bg{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
          @keyframes successPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}50%{box-shadow:0 0 0 14px rgba(34,197,94,0)}}
          @keyframes orb0{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,8px)}}
          @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-6px)}}
          @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,10px)}}
        `}</style>
      </div>
      <div style={{padding:'20px 16px 0',display:'flex',flexDirection:'column',gap:'12px'}}>
        {/* Produk */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px',display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{width:'52px',height:'52px',borderRadius:'12px',flexShrink:0,overflow:'hidden',background:'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(10,22,64,0.8))',border:'1.5px solid rgba(34,197,94,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {thumbnail?<img src={thumbnail} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>:<span style={{fontSize:'1.5rem'}}>🎮</span>}
          </div>
          <div>
            <p style={{margin:0,fontWeight:800,color:'#fff',fontSize:'0.95rem'}}>{order.product_name}</p>
            <p style={{margin:'3px 0 0',color:'#4ade80',fontSize:'0.8rem',fontWeight:600}}>
              {order.variant_name}{order.quantity&&order.quantity>1?` ×${order.quantity}`:''}
            </p>
          </div>
        </div>
        {/* Status */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px'}}>
          <div style={{display:'flex',gap:'10px'}}>
            <div style={{flex:1}}>
              <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.8rem',margin:'0 0 6px'}}>Status Pembayaran</p>
              <span style={{display:'inline-block',padding:'4px 12px',borderRadius:'7px',fontSize:'0.72rem',fontWeight:800,letterSpacing:'0.06em',background:'rgba(34,197,94,0.12)',color:'#4ade80',border:'1px solid rgba(34,197,94,0.3)'}}>PAID</span>
            </div>
            <div style={{flex:1}}>
              <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.8rem',margin:'0 0 6px'}}>Status Transaksi</p>
              <span style={{display:'inline-block',padding:'4px 12px',borderRadius:'7px',fontSize:'0.72rem',fontWeight:800,letterSpacing:'0.06em',background:'rgba(34,197,94,0.12)',color:'#4ade80',border:'1px solid rgba(34,197,94,0.3)'}}>SUCCESS</span>
            </div>
          </div>
        </div>
        {/* CTA */}
        <a href={`/orders/${order.id}`} style={{display:'block',padding:'14px',borderRadius:'14px',background:'linear-gradient(135deg,#16a34a,#15803d)',color:'#fff',fontWeight:800,fontSize:'0.9rem',textAlign:'center',textDecoration:'none',boxShadow:'0 4px 20px rgba(34,197,94,0.3)'}}>
          Lihat Detail Pesanan
        </a>
      </div>
    </div>
  );

  // ── Expired
  if (expired) return (
    <div style={{maxWidth:'448px',margin:'0 auto',padding:'80px 16px 40px',textAlign:'center'}}>
      <div style={{
        width:'80px',height:'80px',borderRadius:'50%',
        background:'rgba(239,68,68,0.12)',border:'1.5px solid rgba(239,68,68,0.3)',
        display:'flex',alignItems:'center',justifyContent:'center',
        margin:'0 auto 20px',
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <h2 style={{margin:'0 0 8px',fontWeight:900,fontSize:'1.3rem',color:'#fff'}}>Invoice Kedaluwarsa</h2>
      <p style={{margin:'0 0 28px',fontSize:'0.85rem',color:'rgba(255,255,255,0.5)',lineHeight:1.6}}>
        Waktu pembayaran untuk invoice{' '}
        <span style={{fontFamily:'monospace',color:'#93c5fd',fontWeight:700}}>{order.id}</span>{' '}
        telah habis. Silakan buat pesanan baru untuk melanjutkan.
      </p>
      <a href={`/products/${order.product_id}`} style={{
        display:'inline-block',padding:'13px 32px',borderRadius:'14px',
        background:'linear-gradient(135deg,#1d6fff,#1450cc)',
        color:'#fff',fontWeight:800,fontSize:'0.9rem',textDecoration:'none',
        boxShadow:'0 4px 20px rgba(29,111,255,0.35)',
      }}>Buat Pesanan Baru</a>
      <div style={{marginTop:'16px'}}>
        <a href="/" style={{color:'rgba(255,255,255,0.35)',fontSize:'0.8rem',textDecoration:'none'}}>
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );

  // ── Menunggu pembayaran
  return (
    <div style={{maxWidth:'448px',margin:'0 auto',paddingBottom:'40px'}}>

      {/* Banner animasi */}
      <div style={{position:'relative',overflow:'hidden',background:'#0f1e5a',padding:'32px 20px 44px',textAlign:'center'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(29,111,255,0.3) 0%,transparent 50%,rgba(29,111,255,0.2) 100%)',backgroundSize:'300% 300%',animation:'bg 5s ease infinite'}}/>
        {[[90,90,-20,-20,'rgba(29,111,255,0.15)','a'],[60,60,-15,-10,'rgba(96,165,250,0.12)','b'],[40,40,30,'30%','rgba(29,111,255,0.1)','c']].map(([w,h,t,l,bg,k],i)=>(
          <div key={k} style={{position:'absolute',width:w,height:h,borderRadius:'50%',background:bg,top:i===1?undefined:t,bottom:i===1?t:undefined,left:i!==2?l:undefined,right:i===2?l:undefined,animation:`orb${k} ${4+i}s ease-in-out infinite`,filter:'blur(2px)'}}/>
        ))}
        <div style={{position:'absolute',bottom:-2,left:0,right:0,height:'32px',background:'#0a1628',clipPath:'ellipse(60% 100% at 50% 100%)'}}/>
        <div style={{width:'60px',height:'60px',borderRadius:'50%',position:'relative',zIndex:1,background:'rgba(29,111,255,0.2)',border:'1.5px solid rgba(96,165,250,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',animation:'pulse 2.5s ease-in-out infinite'}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <h1 style={{position:'relative',zIndex:1,margin:0,fontWeight:900,fontSize:'1.25rem',color:'#fff'}}>Menunggu Pembayaran</h1>
        <p style={{position:'relative',zIndex:1,margin:'6px 0 0',fontSize:'0.8rem',color:'rgba(255,255,255,0.55)'}}>Silakan lakukan pembayaran dengan metode yang kamu pilih.</p>
        {!isManual && (
          <div style={{position:'relative',zIndex:1,marginTop:'14px'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'7px',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'999px',padding:'5px 16px',fontWeight:800,fontSize:'0.9rem',fontFamily:'monospace',color:'#fbbf24'}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {timeLeft}
            </span>
          </div>
        )}
        <style>{`
          @keyframes bg{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
          @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(29,111,255,0.5)}50%{box-shadow:0 0 0 14px rgba(29,111,255,0)}}
          @keyframes orba{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,8px)}}
          @keyframes orbb{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-6px)}}
          @keyframes orbc{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,10px)}}
        `}</style>
      </div>

      <div style={{padding:'20px 16px 0',display:'flex',flexDirection:'column',gap:'12px'}}>

        {/* Produk */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px',display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{width:'52px',height:'52px',borderRadius:'12px',flexShrink:0,overflow:'hidden',background:'linear-gradient(135deg,rgba(29,111,255,0.15),rgba(10,22,64,0.8))',border:'1.5px solid rgba(29,111,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {thumbnail ? <img src={thumbnail} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/> : <span style={{fontSize:'1.5rem'}}>🎮</span>}
          </div>
          <div>
            <p style={{margin:0,fontWeight:800,color:'#fff',fontSize:'0.95rem'}}>{order.product_name}</p>
            <p style={{margin:'3px 0 0',color:'#60a5fa',fontSize:'0.8rem',fontWeight:600}}>
              {order.variant_name}{order.quantity && order.quantity > 1 ? ` ×${order.quantity}` : ''}
            </p>
          </div>
        </div>

        {/* Harga */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'9px'}}>
            <span style={{color:'rgba(255,255,255,0.45)',fontSize:'0.85rem'}}>Harga</span>
            <span style={{color:'#e8f4ff',fontSize:'0.85rem',fontWeight:600}}>
              {order.quantity && order.quantity > 1
                ? `${formatIDR(Math.round(order.base_amount / order.quantity))} × ${order.quantity}`
                : formatIDR(order.base_amount)}
            </span>
          </div>
          {order.fee_amount > 0 && (
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'9px'}}>
              <span style={{color:'rgba(255,255,255,0.45)',fontSize:'0.85rem'}}>Payment Fee</span>
              <span style={{color:'rgba(255,255,255,0.45)',fontSize:'0.85rem'}}>{formatIDR(order.fee_amount)}</span>
            </div>
          )}
          <div style={{height:'1px',background:'rgba(255,255,255,0.08)',margin:'10px 0'}}/>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'#fff',fontWeight:800,fontSize:'0.9rem'}}>Total Pembayaran</span>
            <span style={{color:'#60a5fa',fontWeight:900,fontSize:'1rem'}}>{formatIDR(order.total_amount)}</span>
          </div>
        </div>

        {/* Invoice */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
            <span style={{color:'rgba(255,255,255,0.45)',fontSize:'0.82rem'}}>Metode Pembayaran</span>
            <span style={{color:'#fff',fontWeight:700,fontSize:'0.85rem'}}>
              {payMethodDetail ? payMethodDetail.provider : 'QRIS'}
            </span>
          </div>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.82rem',margin:'0 0 7px'}}>Nomor Invoice</p>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
            <div style={{flex:1,background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'9px 12px',fontFamily:'monospace',fontSize:'0.78rem',color:'#e8f4ff',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{order.id}</div>
            <button onClick={handleCopy} style={{flexShrink:0,width:'36px',height:'36px',borderRadius:'10px',cursor:'pointer',background:copied?'rgba(16,185,129,0.15)':'rgba(255,255,255,0.07)',border:copied?'1px solid rgba(16,185,129,0.4)':'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}>
              {copied
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={copied==='id'?'#10b981':'#94a3b8'} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              }
            </button>
          </div>
          <div style={{display:'flex',gap:'10px',marginBottom:'14px'}}>
            {[['Status Pembayaran','UNPAID'],['Status Transaksi','PENDING']].map(([label,val])=>(
              <div key={label} style={{flex:1}}>
                <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.8rem',margin:'0 0 6px'}}>{label}</p>
                <span style={{display:'inline-block',padding:'4px 12px',borderRadius:'7px',fontSize:'0.72rem',fontWeight:800,letterSpacing:'0.06em',background:'rgba(251,191,36,0.1)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.25)'}}>{val}</span>
              </div>
            ))}
          </div>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.8rem',margin:'0 0 5px'}}>Pesan</p>
          <p style={{color:'#94a3b8',fontSize:'0.82rem',margin:0,lineHeight:1.5}}>Silakan lakukan pembayaran dengan metode yang kamu pilih.</p>
        </div>

        {/* Kode Pembayaran / Transfer Info */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px'}}>
          {/* Bank / E-Wallet: tampilkan nomor rekening + nama */}
          {isManual && payMethodDetail ? (
            <>
              <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.82rem',margin:'0 0 14px'}}>Transfer ke</p>
              {/* Provider badge + nama */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
                <div style={{
                  width:'44px',height:'44px',borderRadius:'10px',flexShrink:0,overflow:'hidden',
                  background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',padding:'4px',
                }}>
                  {payMethodDetail.logo_url
                    ? <img src={payMethodDetail.logo_url} alt={payMethodDetail.provider} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                    : <span style={{fontWeight:900,fontSize:'0.65rem',color:'#111',fontFamily:'monospace'}}>{payMethodDetail.provider.toUpperCase().slice(0,6)}</span>
                  }
                </div>
                <p style={{margin:0,fontWeight:800,color:'#fff',fontSize:'1rem'}}>{payMethodDetail.provider}</p>
              </div>
              {/* Nomor rekening + copy button */}
              <div style={{marginBottom:'12px'}}>
                <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.78rem',margin:'0 0 6px'}}>Nomor Rekening</p>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{
                    flex:1,background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,255,255,0.1)',
                    borderRadius:'10px',padding:'10px 14px',
                    fontFamily:'monospace',fontSize:'1rem',color:'#e8f4ff',fontWeight:700,
                    letterSpacing:'0.08em',
                  }}>{payMethodDetail.account_number}</div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(payMethodDetail.account_number);
                      setCopied('acc');
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{
                      flexShrink:0,width:'40px',height:'40px',borderRadius:'10px',cursor:'pointer',
                      background: copied==='acc' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
                      border: copied==='acc' ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',
                    }}>
                    {copied==='acc'
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    }
                  </button>
                </div>
              </div>
              {/* Atas nama */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'rgba(255,255,255,0.04)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.07)'}}>
                <span style={{color:'rgba(255,255,255,0.45)',fontSize:'0.82rem'}}>Atas Nama</span>
                <span style={{color:'#e8f4ff',fontWeight:700,fontSize:'0.88rem'}}>{payMethodDetail.account_name}</span>
              </div>
              <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.75rem',textAlign:'center',margin:'12px 0 0'}}>
                Konfirmasi ke admin dan kirim bukti transfer.
              </p>
            </>
          ) : isManual ? (
            /* QRIS manual — tampilkan image QR dari env */
            <>
              <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.82rem',margin:'0 0 14px'}}>Kode Pembayaran</p>
              <div style={{display:'flex',justifyContent:'center',marginBottom:'11px'}}>
                <div style={{background:'#fff',borderRadius:'14px',padding:'13px'}}>
                  <img src={manualQrUrl} alt="QR" style={{width:'230px',height:'230px',objectFit:'contain',display:'block'}}/>
                </div>
              </div>
              <p style={{textAlign:'center',color:'rgba(255,255,255,0.35)',fontSize:'0.77rem',margin:0}}>Scan QR Code untuk melakukan pembayaran.</p>
            </>
          ) : (
            /* QRIS otomatis — generate QR dari string */
            <>
              <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.82rem',margin:'0 0 14px'}}>Kode Pembayaran</p>
              <div style={{display:'flex',justifyContent:'center',marginBottom:'11px'}}>
                {qrImage ? (
                  <div style={{background:'#fff',borderRadius:'14px',padding:'13px'}}>
                    <img src={qrImage} alt="QR" style={{width:'230px',height:'230px',display:'block',borderRadius:'6px'}}/>
                  </div>
                ) : (
                  <div style={{width:'256px',height:'256px',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.04)',borderRadius:'14px'}}>
                    <LoadingSpinner size={40}/>
                  </div>
                )}
              </div>
              <p style={{textAlign:'center',color:'rgba(255,255,255,0.35)',fontSize:'0.77rem',margin:0}}>Scan QR Code untuk melakukan pembayaran.</p>
            </>
          )}
        </div>


      </div>
    </div>
  );
}