'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CheckoutClient({ order }) {
  const router        = useRouter();
  const [status, setStatus]     = useState('pending');
  const [timeLeft, setTimeLeft] = useState('');
  const [qrData, setQrData]     = useState(order.payment_qr || '');
  const [qrImage, setQrImage]   = useState('');

  // Generate QR image from string
  useEffect(() => {
    if (!qrData) return;
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(qrData, { width: 280, margin: 2, color: { dark: '#000', light: '#fff' } })
        .then(url => setQrImage(url));
    });
  }, [qrData]);

  // Countdown timer
  useEffect(() => {
    if (!order.payment_expired_at) return;
    const interval = setInterval(() => {
      const diff = new Date(order.payment_expired_at) - Date.now();
      if (diff <= 0) { setTimeLeft('Kadaluarsa'); clearInterval(interval); return; }
      const m = Math.floor(diff / 60000), s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [order.payment_expired_at]);

  // Poll payment status every 5s
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
      <p className="text-dim text-sm mt-2">Mengalihkan ke halaman pesanan...</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h1 className="text-lg font-bold mb-1 text-center">Scan QR untuk Bayar</h1>
        <p className="text-dim text-xs text-center mb-5">Gunakan aplikasi mobile banking atau e-wallet</p>

        {/* QR Code */}
        <div className="flex justify-center mb-5">
          {qrImage
            ? <img src={qrImage} alt="QR Code" className="rounded-xl w-60 h-60" />
            : <div className="w-60 h-60 flex items-center justify-center"><LoadingSpinner size={40} /></div>
          }
        </div>

        {/* Timer */}
        {timeLeft && (
          <div className="text-center mb-4">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${timeLeft === 'Kadaluarsa' ? 'bg-danger/15 text-danger' : 'bg-gold/15 text-gold'}`}>
              ⏱ {timeLeft === 'Kadaluarsa' ? 'QR Kadaluarsa' : `Berlaku ${timeLeft}`}
            </span>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-surface rounded-xl p-4 space-y-2 text-sm mb-4">
          <div className="flex justify-between"><span className="text-muted">Order ID</span><span className="font-mono text-xs">{order.id}</span></div>
          <div className="flex justify-between"><span className="text-muted">Produk</span><span className="font-semibold">{order.product_name}</span></div>
          <div className="flex justify-between"><span className="text-muted">Varian</span><span>{order.variant_name}</span></div>
          <div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total Bayar</span><span className="text-accent-light">{formatIDR(order.total_amount)}</span></div>
        </div>

        <p className="text-xs text-center text-muted">
          Halaman ini otomatis update saat pembayaran berhasil
        </p>
      </div>
    </div>
  );
}
