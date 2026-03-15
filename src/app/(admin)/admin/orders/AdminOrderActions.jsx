'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function AdminOrderActions({ order }) {
  const router   = useRouter();
  const [loading, setLoading] = useState(false);

  const update = async status => {
    if (!confirm(`Ubah status ke "${status}"?`)) return;
    setLoading(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ status })
    });
    setLoading(false); router.refresh();
  };

  return (
    <div className="flex gap-1">
      {order.status === 'processing' && (
        <Button size="sm" variant="gold" onClick={() => update('completed')} disabled={loading}>Selesai</Button>
      )}
      {['pending','paid'].includes(order.status) && (
        <Button size="sm" variant="danger" onClick={() => update('cancelled')} disabled={loading}>Batal</Button>
      )}
      <a href={`/orders/${order.id}`} target="_blank" className="text-xs text-accent-light hover:underline px-2 py-1.5">Lihat</a>
    </div>
  );
}
