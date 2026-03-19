'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function KeysPage() {
  const { id } = useParams();
  const [product, setProd]  = useState(null);
  const [keys, setKeys]     = useState([]);
  const [variantId, setVid] = useState('');
  const [bulk, setBulk]     = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const [p, k] = await Promise.all([
      fetch(`/api/admin/products/${id}`).then(r=>r.json()),
      fetch(`/api/admin/keys?productId=${id}`).then(r=>r.json()),
    ]);
    setProd(p);
    setKeys(k||[]);
    if (!variantId && p?.product_variants?.[0]) setVid(p.product_variants[0].id);
  };
  useEffect(() => { load(); }, [id]);

  const addKeys = async () => {
    if (!variantId || !bulk.trim()) return;
    const lines = bulk.split('\n').map(l=>l.trim()).filter(Boolean);
    setSaving(true);
    await fetch('/api/admin/keys', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ productId: id, variantId, keys: lines }),
    });
    setSaving(false); setBulk(''); load();
  };

  const deleteKey = async keyId => {
    if (!confirm('Hapus key ini?')) return;
    await fetch(`/api/admin/keys/${keyId}`, { method:'DELETE' });
    load();
  };

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  // Group keys by variant
  const variants = product?.product_variants || [];
  const keysByVariant = variants.reduce((acc, v) => {
    acc[v.id] = keys.filter(k => k.variant_id === v.id);
    return acc;
  }, {});

  const filteredByVariant = (vId) => {
    const vKeys = keysByVariant[vId] || [];
    if (filter === 'available') return vKeys.filter(k => !k.is_used);
    if (filter === 'used') return vKeys.filter(k => k.is_used);
    return vKeys;
  };

  const totalAvailable = keys.filter(k => !k.is_used).length;
  const totalUsed = keys.filter(k => k.is_used).length;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Stok Keys</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{product?.name || '...'}</p>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Total',    count: keys.length,    color:'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
          { label:'Tersedia', count: totalAvailable,  color:'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800' },
          { label:'Terpakai', count: totalUsed,       color:'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 text-center border ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add keys — per variant */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-white">Tambah Keys</h2>
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Pilih Varian *</label>
          <select className={inputCls} value={variantId} onChange={e=>setVid(e.target.value)}>
            <option value="">-- Pilih Varian --</option>
            {variants.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} — Rp{v.price?.toLocaleString('id-ID')} ({(keysByVariant[v.id]||[]).filter(k=>!k.is_used).length} tersedia)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Keys (1 per baris)</label>
          <textarea className={inputCls} rows={6} value={bulk} onChange={e=>setBulk(e.target.value)} placeholder={"KEY001\nKEY002\nKEY003"} />
          <p className="text-xs text-gray-400 mt-1">{bulk.split('\n').filter(l=>l.trim()).length} keys akan ditambahkan</p>
        </div>
        <button onClick={addKeys} disabled={saving || !variantId || !bulk.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Menyimpan...' : `+ Tambah ${bulk.split('\n').filter(l=>l.trim()).length || 0} Keys ke "${variants.find(v=>v.id===variantId)?.name || '...'}"`}
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all','available','used'].map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filter===f ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {f==='all'?'Semua':f==='available'?'Tersedia':'Terpakai'}
          </button>
        ))}
      </div>

      {/* Keys list — grouped per variant */}
      {variants.map(v => {
        const vKeys = filteredByVariant(v.id);
        const vAll  = keysByVariant[v.id] || [];
        return (
          <div key={v.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
            {/* Variant header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm">{v.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Rp{v.price?.toLocaleString('id-ID')} &nbsp;·&nbsp;
                  <span className="text-green-600 dark:text-green-400 font-semibold">{vAll.filter(k=>!k.is_used).length} tersedia</span>
                  &nbsp;·&nbsp; {vAll.filter(k=>k.is_used).length} terpakai
                </p>
              </div>
              <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {vAll.length} total
              </div>
            </div>

            {/* Keys rows */}
            <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-64 overflow-y-auto">
              {vKeys.length === 0 ? (
                <div className="py-6 text-center text-gray-400 dark:text-gray-600 text-sm">
                  {filter === 'all' ? 'Belum ada keys untuk varian ini' : `Tidak ada keys ${filter === 'available' ? 'tersedia' : 'terpakai'}`}
                </div>
              ) : vKeys.map(k => (
                <div key={k.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <p className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate flex-1 mr-3">{k.key_content}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${k.is_used ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
                      {k.is_used ? 'Terpakai' : 'Tersedia'}
                    </span>
                    {!k.is_used && (
                      <button onClick={()=>deleteKey(k.id)} className="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {variants.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">Produk ini belum memiliki varian</div>
      )}
    </div>
  );
}