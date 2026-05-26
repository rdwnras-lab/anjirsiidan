'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const SPECIAL_CATS = ['website', 'bot', 'template'];

export default function SpecialProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    fetch('/api/admin/special-products')
      .then(r => r.json())
      .then(d => { setProducts(d || []); setLoading(false); });
  }, []);

  const filtered = filter === 'all'
    ? products
    : products.filter(p => p.categories?.name?.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Product Website / Bot / Template</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola produk digital untuk kategori khusus</p>
        </div>
        <Link href="/admin/special-products/edit"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          + Tambah Product
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...SPECIAL_CATS].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            {cat === 'all' ? 'Semua' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-3xl mb-2">📦</p>
          <p className="text-sm">Belum ada produk. Klik + Tambah Product.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <Link key={p.id} href={`/admin/special-products/edit?id=${p.id}`}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden hover:border-blue-400 dark:hover:border-blue-600 transition-all group">
              {/* Preview */}
              <div className="h-40 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {p.preview_images?.[0] ? (
                  <img src={p.preview_images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                ) : p.preview_video ? (
                  <video src={p.preview_video} className="w-full h-full object-cover" muted/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 dark:text-gray-600">📦</div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500'
                  }`}>{p.is_active ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 capitalize">
                    {p.categories?.name || 'Special'}
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <p className="font-bold text-gray-800 dark:text-white text-sm leading-tight">{p.name}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.product_info || 'Belum ada informasi produk'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {p.product_variants?.[0]
                      ? `Rp ${parseInt(p.product_variants[0].price).toLocaleString('id-ID')}`
                      : 'Belum ada harga'}
                  </p>
                  <span className="text-xs text-gray-400">{p.product_variants?.length || 0} paket</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}