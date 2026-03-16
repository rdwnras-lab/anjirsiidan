'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/products').then(r => r.json()).then(d => { setProducts(d || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (id, val) => {
    await fetch(`/api/admin/products/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ is_active: !val }) });
    load();
  };
  const toggleBS = async (id, val) => {
    await fetch(`/api/admin/products/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ is_best_seller: !val }) });
    load();
  };
  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus produk "${name}"? Aksi ini tidak bisa dibatalkan.`)) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.categories?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Produk</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{products.length} produk terdaftar</p>
        </div>
        <Link href="/admin/products/new"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          + Tambah Produk
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Cari produk atau kategori..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-600">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm">{search ? 'Produk tidak ditemukan' : 'Belum ada produk'}</p>
            {!search && <Link href="/admin/products/new" className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline block">+ Tambah sekarang</Link>}
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map(p => {
              const stock    = p.delivery_type === 'auto' ? (p.product_keys?.filter(k => !k.is_used).length ?? 0) : null;
              const minPrice = p.product_variants?.length ? Math.min(...p.product_variants.map(v => v.price)) : 0;
              return (
                <div key={p.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Thumbnail */}
                  {p.thumbnail
                    ? <img src={p.thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-gray-800 flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                  }
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">{p.name}</p>
                      {p.is_best_seller && <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">🔥 Best Seller</span>}
                      {!p.is_active && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">Nonaktif</span>}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                      {p.categories?.name || 'Tanpa Kategori'} · {p.product_variants?.length || 0} varian · ab Rp{minPrice.toLocaleString('id-ID')}
                      {stock !== null && ` · ${stock} stok`}
                    </p>
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      <Link href={`/admin/products/${p.id}/keys`}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 transition-colors">
                        🔑 Stok
                      </Link>
                      <Link href={`/admin/products/${p.id}`}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 transition-colors">
                        ✏️ Edit
                      </Link>
                      <button onClick={() => toggleBS(p.id, p.is_best_seller)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${p.is_best_seller ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'}`}>
                        {p.is_best_seller ? 'BS ON' : 'BS OFF'}
                      </button>
                      <button onClick={() => toggleActive(p.id, p.is_active)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${p.is_active ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'}`}>
                        {p.is_active ? '✓ Aktif' : 'Mati'}
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
