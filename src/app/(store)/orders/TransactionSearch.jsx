'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TransactionSearch() {
  const [invoice, setInvoice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!invoice.trim()) return;
    setLoading(true); setError('');
    const res  = await fetch(`/api/orders/search?id=${encodeURIComponent(invoice.trim())}`);
    const data = await res.json();
    setLoading(false);
    if (data.id) {
      router.push(`/orders/${data.id}`);
    } else {
      setError('Invoice tidak ditemukan. Pastikan ID pesanan benar.');
    }
  };

  return (
    <div className="rounded-2xl p-4" style={{border:'1px solid #0e2445', background:'#091828'}}>
      <p className="font-bold text-sm text-white mb-3 tracking-wider">CEK TRANSAKSI</p>
      <p className="text-xs mb-3" style={{color:'#7bafd4'}}>Masukkan nomor invoice untuk cek status pesanan</p>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={invoice}
          onChange={e => setInvoice(e.target.value)}
          placeholder="VCH-20260316-XXXXX"
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{background:'#050f1e', border:'1px solid #0e2445', color:'#e8f4ff'}}
        />
        <button type="submit" disabled={loading || !invoice.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors"
          style={{background:'#1d6fff'}}>
          {loading ? '...' : 'Cek'}
        </button>
      </form>
      {error && <p className="text-xs mt-2" style={{color:'#ef4444'}}>{error}</p>}
    </div>
  );
}
