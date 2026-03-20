'use client';
import { useState } from 'react';

export default function AdminOrderActions({ order }) {
  const [loading, setLoading] = useState(false);

  const update = async (status) => {
    const labels = { completed: 'Selesaikan', cancelled: 'Batalkan', paid: 'Tandai Sudah Bayar' };
    if (!confirm(`${labels[status] || status} pesanan ini?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert('Gagal: ' + (d.error || res.status));
        return;
      }
      // Force full reload agar server component re-fetch data terbaru
      window.location.reload();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const isManual  = order.delivery_type === 'manual';
  const isPending = ['pending', 'paid'].includes(order.status);
  const isProcess = order.status === 'processing';

  return (
    <div className="flex items-center justify-end gap-1.5 flex-wrap">
      {/* Manual pending/paid → Selesaikan */}
      {isManual && isPending && (
        <button onClick={() => update('completed')} disabled={loading}
          className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 disabled:opacity-50 transition-colors">
          {loading ? '...' : '✓ Selesaikan'}
        </button>
      )}
      {/* Auto processing → Selesaikan */}
      {isProcess && (
        <button onClick={() => update('completed')} disabled={loading}
          className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 disabled:opacity-50 transition-colors">
          {loading ? '...' : '✓ Selesai'}
        </button>
      )}
      {/* Tandai sudah bayar (manual pending) */}
      {isManual && order.status === 'pending' && (
        <button onClick={() => update('paid')} disabled={loading}
          className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 disabled:opacity-50 transition-colors">
          {loading ? '...' : 'Sudah Bayar'}
        </button>
      )}
      {/* Batalkan */}
      {isPending && (
        <button onClick={() => update('cancelled')} disabled={loading}
          className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 disabled:opacity-50 transition-colors">
          {loading ? '...' : 'Batal'}
        </button>
      )}
      <a href={`/orders/${order.id}`} target="_blank"
        className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 transition-colors">
        Lihat
      </a>
    </div>
  );
}