'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminOrderActions({ order }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const update = async (status) => {
    if (!confirm(`Ubah status ke "${status}"?`)) return;
    setLoading(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {order.status === 'processing' && (
        <button onClick={() => update('completed')} disabled={loading}
          className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 disabled:opacity-50 transition-colors">
          ✓ Selesai
        </button>
      )}
      {['pending', 'paid'].includes(order.status) && (
        <button onClick={() => update('cancelled')} disabled={loading}
          className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 disabled:opacity-50 transition-colors">
          Batal
        </button>
      )}
      <a href={`/orders/${order.id}`} target="_blank"
        className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 transition-colors">
        Lihat
      </a>
    </div>
  );
}
