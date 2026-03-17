'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CheckoutClient({ order }) {
  const router = useRouter();
  const [status, setStatus]   = useState(order.status === 'completed' ? 'completed' : 'pending');
  const [timeLeft, setTimeLeft] = useState('');
  const [qrImage, setQrImage] = useState('');

  const isManual    = !order.payment_qr;
  const manualQrUrl = process.env.NEXT_PUBLIC_MANUAL_QR_URL || 'https://i.ibb.co.com/JR78g396/vechqr.png';

  // Generate QR dari string (auto only)
  useEffect(() => {
    if (!order.payment_qr || isManual) return;
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(order.payment_qr, { width: 280, margin: 2, color: { dark: '#000', light: '#fff' } })
        .then(url => setQrImage(url));
    });
  }, [order.payment_qr, isManual]);

  // Countdown (auto only)
  useEffect(() => {
    if (!order.payment_expired_at || isManual || status === 'completed') return;
    const tick = () => {
      const diff = new Date(order.payment_expired_at) - Date.now();
      if (diff <= 0) { setTimeLeft('Kadaluarsa'); return; }
      const m = Math.floor(diff / 60000), s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
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

  if (status === 'completed') return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4 animate-bounce">✅</div>
      <h2 className="text-xl font-bold text-white">Pembayaran Berhasil!</h2>
      <p className="text-sm mt-2" style={{color:'#7bafd4'}}>Mengalihkan ke halaman pesanan...</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="rounded-2xl p-6" style={{background:'#091828', border:'1px solid #0e2445'}}>
        <h1 className="text-lg font-bold mb-1 text-center text-white">
          {isManual ? 'Transfer Pembayaran' : 'Scan QR untuk Bayar'}
        </h1>
        <p className="text-xs text-center mb-5" style={{color:'#7bafd4'}}>
          {isManual
            ? 'Scan QR di bawah, lalu konfirmasi ke admin via WhatsApp'
            : 'Gunakan aplikasi mobile banking atau e-wallet'}
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          {isManual ? (
            <div className="rounded-2xl overflow-hidden" style={{background:'#fff', padding:'12px'}}>
              <img src={manualQrUrl} alt="QR Pembayaran" style={{width:'240px', height:'240px', objectFit:'contain', display:'block'}} />
            </div>
          ) : qrImage ? (
            <img src={qrImage} alt="QR Code" className="rounded-xl" style={{width:'240px', height:'240px'}} />
          ) : (
            <div style={{width:'240px', height:'240px', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <LoadingSpinner size={40} />
            </div>
          )}
        </div>

        {/* Timer — auto only, only show if not expired or still within grace */}
        {!isManual && timeLeft && (
          <div className="text-center mb-4">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${
              timeLeft === 'Kadaluarsa'
                ? 'border-red-800 text-red-400' 
                : 'border-yellow-800 text-yellow-400'
            }`} style={{background:'rgba(0,0,0,0.3)'}}>
              ⏱ {timeLeft === 'Kadaluarsa' ? 'QR Kadaluarsa — tapi pembayaran masih diterima jika sudah transfer' : `Berlaku ${timeLeft}`}
            </span>
          </div>
        )}

        {/* Manual note */}
        {isManual && (
          <div className="rounded-xl p-3 mb-4 text-center text-xs"
            style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', color:'#fbbf24'}}>
            👤 Pesanan manual — admin konfirmasi dalam 1×24 jam setelah transfer
          </div>
        )}

        {/* Order summary */}
        <div className="rounded-xl p-4 space-y-2 text-sm mb-4" style={{background:'#050f1e'}}>
          <div className="flex justify-between">
            <span style={{color:'#3d5a7a'}}>Order ID</span>
            <span className="font-mono text-xs text-white">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span style={{color:'#3d5a7a'}}>Produk</span>
            <span className="font-semibold text-white">{order.product_name}</span>
          </div>
          <div className="flex justify-between">
            <span style={{color:'#3d5a7a'}}>Varian</span>
            <span style={{color:'#e8f4ff'}}>{order.variant_name}</span>
          </div>
          {order.fee_amount > 0 && (
            <div className="flex justify-between">
              <span style={{color:'#3d5a7a'}}>Biaya QRIS</span>
              <span style={{color:'#7bafd4'}}>+{formatIDR(order.fee_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2" style={{borderTop:'1px solid #0e2445'}}>
            <span className="text-white">Total Bayar</span>
            <span style={{color:'#60a5fa'}}>{formatIDR(order.total_amount)}</span>
          </div>
        </div>

        <p className="text-xs text-center" style={{color:'#3d5a7a'}}>
          {isManual
            ? 'Setelah transfer, kirim bukti ke WhatsApp admin'
            : 'Halaman ini otomatis update saat pembayaran berhasil'}
        </p>
      </div>
    </div>
  );
}
