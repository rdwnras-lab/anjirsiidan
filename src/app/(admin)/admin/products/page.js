'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = () => {
    fetch('/api/admin/products').then(r => r.json()).then(d => {
      setProducts(d || []);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (id, val) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !val }),
    });
    load();
  };

  const toggleBestSeller = async (id, val) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_best_seller: !val }),
    });
    load();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-extrabold">Produk</h1>
        <Link href="/admin/products/new"
          className="bg-accent hover:bg-accent-h text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          + Tambah Produk
        </Link>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-3">
          {products.length === 0 && (
            <div className="text-center py-20 text-muted">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold">Belum ada produk</p>
              <Link href="/admin/products/new" className="text-sm text-accent-light mt-2 inline-block">+ Tambah sekarang</Link>
            </div>
          )}
          {products.map(p => {
            const stock = p.delivery_type === 'auto'
              ? p.product_keys?.filter(k => !k.is_used).length ?? 0
              : null;
            const minPrice = p.product_variants?.length
              ? Math.min(...p.product_variants.map(v => v.price))
              : 0;
            return (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                    }
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">{p.name}</p>
                        {p.is_best_seller && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">🔥 Best Seller</span>}
                        {!p.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/20">Nonaktif</span>}
                      </div>
                      <p className="text-xs text-muted mt-0.5">{p.categories?.name} · {p.product_variants?.length || 0} varian · ab Rp{(minPrice||0).toLocaleString('id-ID')}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${p.delivery_type === 'auto' ? 'bg-accent/15 text-accent-light border-accent/20' : 'bg-white/5 text-dim border-border'}`}>
                          {p.delivery_type === 'auto' ? '⚡ Auto' : '👤 Manual'}
                        </span>
                        {stock !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${stock > 0 ? 'bg-success/15 text-success border-success/20' : 'bg-danger/15 text-danger border-danger/20'}`}>
                            {stock} stok
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col gap-2 shrink-0 items-end">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${p.id}/keys`}
                        className="text-xs bg-gold/10 text-gold border border-gold/20 px-3 py-1.5 rounded-xl font-semibold hover:bg-gold/20 transition-colors">
                        🔑 Stok
                      </Link>
                      <Link href={`/admin/products/${p.id}`}
                        className="text-xs bg-white/5 text-dim border border-border px-3 py-1.5 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                        ✏️ Edit
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="text-xs bg-danger/10 text-danger border border-danger/20 px-3 py-1.5 rounded-xl font-semibold hover:bg-danger/20 transition-colors">
                        🗑️
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleBestSeller(p.id, p.is_best_seller)}
                        className={`text-xs px-3 py-1 rounded-xl border font-medium transition-colors ${p.is_best_seller ? 'bg-orange-500/15 text-orange-400 border-orange-500/20 hover:bg-orange-500/25' : 'bg-white/5 text-muted border-border hover:text-text'}`}>
                        {p.is_best_seller ? '🔥 Best Seller ON' : 'Set Best Seller'}
                      </button>
                      <button onClick={() => toggleActive(p.id, p.is_active)}
                        className={`text-xs px-3 py-1 rounded-xl border font-medium transition-colors ${p.is_active ? 'bg-success/15 text-success border-success/20 hover:bg-success/25' : 'bg-white/5 text-muted border-border hover:text-text'}`}>
                        {p.is_active ? '✓ Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
