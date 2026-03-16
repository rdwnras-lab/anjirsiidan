'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const MANUAL_QR = 'https://i.ibb.co.com/JR78g396/vechqr.png';

export default function CheckoutClient({ order }) {
  const router = useRouter();
  const [status, setStatus]   = useState('pending');
  const [timeLeft, setTimeLeft] = useState('');
  const [qrData, setQrData]   = useState(order.payment_qr || '');
  const [qrImage, setQrImage] = useState('');
  const isManual = !order.payment_qr;

  useEffect(() => {
    if (!qrData || isManual) return;
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(qrData, { width: 280, margin: 2, color: { dark: '#000', light: '#fff' } })
        .then(url => setQrImage(url));
    });
  }, [qrData, isManual]);

  useEffect(() => {
    if (!order.payment_expired_at || isManual) return;
    const interval = setInterval(() => {
      const diff = new Date(order.payment_expired_at) - Date.now();
      if (diff <= 0) { setTimeLeft('Kadaluarsa'); clearInterval(interval); return; }
      const m = Math.floor(diff / 60000), s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [order.payment_expired_at, isManual]);

  const checkStatus = useCallback(async () => {
    const res  = await fetch(`/api/payment/status?orderId=${order.id}&amount=${order.total_amount}`);
    const data = await res.json();
    if (data.status === 'completed') {
      setStatus('completed');
      setTimeout(() => router.push(`/orders/${order.id}`), 1500);
    }
  }, [order.id, order.total_amount, router]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  if (status === 'completed') return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4 animate-bounce">✅</div>
      <h2 className="text-xl font-bold">Pembayaran Berhasil!</h2>
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
            ? 'Scan QR di bawah untuk transfer ke rekening kami'
            : 'Gunakan aplikasi mobile banking atau e-wallet'}
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-5">
          {isManual ? (
            <img src={MANUAL_QR} alt="QR Pembayaran" className="rounded-xl w-60 h-60 object-contain" style={{background:'#fff', padding:'8px'}} />
          ) : qrImage ? (
            <img src={qrImage} alt="QR Code" className="rounded-xl w-60 h-60" />
          ) : (
            <div className="w-60 h-60 flex items-center justify-center">
              <LoadingSpinner size={40} />
            </div>
          )}
        </div>

        {/* Timer (auto only) */}
        {!isManual && timeLeft && (
          <div className="text-center mb-4">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${timeLeft === 'Kadaluarsa' ? 'bg-red-900/20 text-red-400 border border-red-800' : 'bg-yellow-900/20 text-yellow-400 border border-yellow-800'}`}>
              ⏱ {timeLeft === 'Kadaluarsa' ? 'QR Kadaluarsa' : `Berlaku ${timeLeft}`}
            </span>
          </div>
        )}

        {/* Manual info */}
        {isManual && (
          <div className="rounded-xl p-3 mb-4 text-xs text-center" style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', color:'#fbbf24'}}>
            👤 Pesanan manual — admin akan konfirmasi dalam 1×24 jam setelah transfer
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
          <div className="flex justify-between pt-2 font-bold" style={{borderTop:'1px solid #0e2445'}}>
            <span className="text-white">Total Bayar</span>
            <span style={{color:'#60a5fa'}}>{formatIDR(order.total_amount)}</span>
          </div>
        </div>

        <p className="text-xs text-center" style={{color:'#3d5a7a'}}>
          Halaman ini otomatis update saat pembayaran berhasil
        </p>
      </div>
    </div>
  );
}
