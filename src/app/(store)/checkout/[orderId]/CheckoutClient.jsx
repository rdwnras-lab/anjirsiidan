'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CheckoutClient({ order }) {
  const router = useRouter();
  const [status,   setStatus]   = useState(order.status === 'completed' ? 'completed' : 'pending');
  const [timeLeft, setTimeLeft] = useState('');
  const [qrImage,  setQrImage]  = useState('');
  const [copied,   setCopied]   = useState(false);
  const [expired,  setExpired]  = useState(false);

  const isManual    = !order.payment_qr;
  const manualQrUrl = process.env.NEXT_PUBLIC_MANUAL_QR_URL || 'https://i.ibb.co.com/JR78g396/vechqr.png';

  // Generate QR dari string (auto only)
  useEffect(() => {
    if (!order.payment_qr || isManual) return;
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(order.payment_qr, { width: 300, margin: 2, color: { dark: '#000', light: '#fff' } })
        .then(url => setQrImage(url));
    });
  }, [order.payment_qr, isManual]);

  // Countdown (auto only) — hanya tampilkan sisa waktu, tidak tampilkan "Kadaluarsa" sebagai error
  useEffect(() => {
    if (!order.payment_expired_at || isManual || status === 'completed') return;
    const tick = () => {
      const expDate = new Date(order.payment_expired_at);
      const diff = expDate - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        setExpired(true);
        return;
      }
      setExpired(false);
      const totalSec = Math.floor(diff / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order.payment_expired_at, isManual, status]);

  // Poll payment status setiap 5 detik
  const checkStatus = useCallback(async () => {
    if (status === 'completed') return;
    try {
      const res  = await fetch(`/api/payment/status?orderId=${order.id}&amount=${order.total_amount}`);
      const data = await res.json();
      if (data.status === 'completed') {
        setStatus('completed');
        setTimeout(() => router.push(`/orders/${order.id}`), 1500);
      }
    } catch {}
  }, [order.id, order.total_amount, router, status]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'completed') return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4 animate-bounce">✅</div>
      <h2 className="text-xl font-bold text-white">Pembayaran Berhasil!</h2>
      <p className="text-sm mt-2" style={{color:'#7bafd4'}}>Mengalihkan ke halaman pesanan...</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto pb-10">

      {/* ── Animated Banner ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#0f1e5a',
        padding: '32px 20px 44px',
        textAlign: 'center',
      }}>
        {/* Animated gradient overlay */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(135deg, rgba(29,111,255,0.3) 0%, rgba(10,26,74,0) 50%, rgba(29,111,255,0.2) 100%)',
          backgroundSize:'300% 300%',
          animation:'bannerGrad 5s ease infinite',
        }}/>
        {/* Floating orbs */}
        {[
          {w:90,h:90,t:-20,l:-20,c:'rgba(29,111,255,0.15)'},
          {w:60,h:60,t:'auto',b:-15,r:-10,c:'rgba(96,165,250,0.12)'},
          {w:40,h:40,t:30,r:'30%',c:'rgba(29,111,255,0.1)'},
        ].map((orb,i)=>(
          <div key={i} style={{
            position:'absolute', width:orb.w, height:orb.h, borderRadius:'50%',
            background:orb.c, top:orb.t, left:orb.l, right:orb.r, bottom:orb.b,
            animation:`orbFloat${i} ${4+i}s ease-in-out infinite`,
            filter:'blur(2px)',
          }}/>
        ))}

        {/* Wave at bottom */}
        <div style={{
          position:'absolute', bottom:-2, left:0, right:0, height:'32px',
          background:'#0a1628',
          clipPath:'ellipse(60% 100% at 50% 100%)',
        }}/>

        {/* Icon */}
        <div style={{
          width:'60px', height:'60px', borderRadius:'50%',
          background:'rgba(29,111,255,0.2)',
          border:'1.5px solid rgba(96,165,250,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 14px', position:'relative', zIndex:1,
          animation:'iconPulse 2.5s ease-in-out infinite',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>

        <h1 style={{ position:'relative', zIndex:1, margin:0, fontWeight:900, fontSize:'1.25rem', color:'#fff' }}>
          Menunggu Pembayaran
        </h1>
        <p style={{ position:'relative', zIndex:1, margin:'6px 0 0', fontSize:'0.8rem', color:'rgba(255,255,255,0.55)' }}>
          Silakan lakukan pembayaran dengan metode yang kamu pilih.
        </p>

        {/* Timer */}
        {!isManual && timeLeft && (
          <div style={{ position:'relative', zIndex:1, marginTop:'14px' }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:'7px',
              background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:'999px', padding:'5px 16px',
              fontWeight:800, fontSize:'0.85rem', fontFamily:'monospace',
              color: expired ? '#f87171' : '#fbbf24',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {expired ? 'Waktu Habis' : timeLeft}
            </span>
          </div>
        )}

        <style>{`
          @keyframes bannerGrad { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
          @keyframes iconPulse { 0%,100%{box-shadow:0 0 0 0 rgba(29,111,255,0.5)} 50%{box-shadow:0 0 0 14px rgba(29,111,255,0)} }
          @keyframes orbFloat0 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,8px)} }
          @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-8px,-6px)} }
          @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(5px,10px) scale(1.1)} }
        `}</style>
      </div>

      <div className="px-4 mt-5 space-y-3">

        {/* ── Order Item Card ── */}
        <div style={{
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
          borderRadius:'16px', padding:'16px',
          display:'flex', alignItems:'center', gap:'14px',
        }}>
          <div style={{
            width:'52px', height:'52px', borderRadius:'12px',
            background:'linear-gradient(135deg,rgba(29,111,255,0.15),rgba(10,22,64,0.8))',
            border:'1.5px solid rgba(29,111,255,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.5rem', flexShrink:0,
          }}>🎮</div>
          <div style={{flex:1}}>
            <p style={{margin:0, fontWeight:800, color:'#fff', fontSize:'0.95rem'}}>{order.product_name}</p>
            <p style={{margin:'3px 0 0', color:'#60a5fa', fontSize:'0.8rem', fontWeight:600}}>{order.variant_name}</p>
          </div>
        </div>

        {/* ── Pricing Card ── */}
        <div style={{
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
          borderRadius:'16px', padding:'16px',
        }}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'9px'}}>
            <span style={{color:'rgba(255,255,255,0.45)', fontSize:'0.85rem'}}>Harga</span>
            <span style={{color:'#e8f4ff', fontSize:'0.85rem', fontWeight:600}}>{formatIDR(order.base_amount)}</span>
          </div>
          {order.fee_amount > 0 && (
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'9px'}}>
              <span style={{color:'rgba(255,255,255,0.45)', fontSize:'0.85rem'}}>Payment Fee</span>
              <span style={{color:'rgba(255,255,255,0.45)', fontSize:'0.85rem'}}>{formatIDR(order.fee_amount)}</span>
            </div>
          )}
          <div style={{height:'1px', background:'rgba(255,255,255,0.08)', margin:'10px 0'}}/>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span style={{color:'#fff', fontWeight:800, fontSize:'0.9rem'}}>Total Pembayaran</span>
            <span style={{color:'#60a5fa', fontWeight:900, fontSize:'1rem'}}>{formatIDR(order.total_amount)}</span>
          </div>
        </div>

        {/* ── Invoice & Status Card ── */}
        <div style={{
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
          borderRadius:'16px', padding:'16px',
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
            <span style={{color:'rgba(255,255,255,0.45)', fontSize:'0.82rem'}}>Metode Pembayaran</span>
            <span style={{color:'#fff', fontWeight:700, fontSize:'0.85rem'}}>{isManual ? 'QRIS' : 'QRIS'}</span>
          </div>

          <div style={{marginBottom:'14px'}}>
            <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.82rem', margin:'0 0 7px'}}>Nomor Invoice</p>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <div style={{
                flex:1, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'10px', padding:'9px 12px',
                fontFamily:'monospace', fontSize:'0.78rem', color:'#e8f4ff', fontWeight:700,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{order.id}</div>
              <button onClick={handleCopy} style={{
                flexShrink:0, width:'36px', height:'36px', borderRadius:'10px',
                background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
                border: copied ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                transition:'all 0.2s',
              }}>
                {copied
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                }
              </button>
            </div>
          </div>

          <div style={{display:'flex', gap:'10px', marginBottom:'14px'}}>
            <div style={{flex:1}}>
              <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.8rem', margin:'0 0 6px'}}>Status Pembayaran</p>
              <span style={{
                display:'inline-block', padding:'4px 12px', borderRadius:'7px',
                fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.06em',
                background:'rgba(251,191,36,0.1)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.25)',
              }}>UNPAID</span>
            </div>
            <div style={{flex:1}}>
              <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.8rem', margin:'0 0 6px'}}>Status Transaksi</p>
              <span style={{
                display:'inline-block', padding:'4px 12px', borderRadius:'7px',
                fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.06em',
                background:'rgba(251,191,36,0.1)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.25)',
              }}>PENDING</span>
            </div>
          </div>

          <div>
            <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.8rem', margin:'0 0 5px'}}>Pesan</p>
            <p style={{color:'#94a3b8', fontSize:'0.82rem', margin:0, lineHeight:1.5}}>
              Silakan lakukan pembayaran dengan metode yang kamu pilih.
            </p>
          </div>
        </div>

        {/* ── QR Code Card ── */}
        <div style={{
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
          borderRadius:'16px', padding:'16px',
        }}>
          <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.82rem', margin:'0 0 14px'}}>Kode Pembayaran</p>
          <div style={{display:'flex', justifyContent:'center', marginBottom:'11px'}}>
            {isManual ? (
              <div style={{background:'#fff', borderRadius:'14px', padding:'13px'}}>
                <img src={manualQrUrl} alt="QR Pembayaran" style={{width:'230px', height:'230px', objectFit:'contain', display:'block'}}/>
              </div>
            ) : qrImage ? (
              <div style={{background:'#fff', borderRadius:'14px', padding:'13px'}}>
                <img src={qrImage} alt="QR Code" style={{width:'230px', height:'230px', display:'block', borderRadius:'6px'}}/>
              </div>
            ) : (
              <div style={{width:'256px', height:'256px', display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(255,255,255,0.04)', borderRadius:'14px'}}>
                <LoadingSpinner size={40}/>
              </div>
            )}
          </div>
          <p style={{textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:'0.77rem', margin:0}}>
            Scan QR Code untuk melakukan pembayaran.
          </p>
        </div>

        {/* ── Instruksi Pembayaran ── */}
        <div style={{
          background:'rgba(29,111,255,0.06)', border:'1px solid rgba(29,111,255,0.2)',
          borderRadius:'14px', padding:'14px',
        }}>
          <p style={{color:'#60a5fa', fontWeight:700, fontSize:'0.82rem', margin:'0 0 8px'}}>📋 Instruksi Pembayaran</p>
          <ol style={{margin:0, paddingLeft:'18px', color:'rgba(255,255,255,0.55)', fontSize:'0.8rem', lineHeight:1.8}}>
            <li>Buka aplikasi mobile banking atau e-wallet kamu</li>
            <li>Pilih fitur scan QR / QRIS</li>
            <li>Scan QR Code di atas</li>
            <li>Periksa nominal dan konfirmasi pembayaran</li>
            <li>Selesai — halaman ini otomatis update</li>
          </ol>
        </div>

        <p style={{textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:'0.72rem', paddingBottom:'4px'}}>
          Halaman ini otomatis update saat pembayaran berhasil
        </p>
      </div>
    </div>
  );
}