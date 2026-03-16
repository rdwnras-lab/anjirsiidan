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
    if (p?.product_variants?.[0]) setVid(p.product_variants[0].id);
  };
  useEffect(() => { load(); }, [id]);

  const addKeys = async () => {
    if (!variantId || !bulk.trim()) return;
    const lines = bulk.split('\n').map(l=>l.trim()).filter(Boolean);
    setSaving(true);
    await fetch('/api/admin/keys', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ productId: id, variantId, keys: lines }) });
    setSaving(false); setBulk(''); load();
  };

  const deleteKey = async keyId => {
    if (!confirm('Hapus key ini?')) return;
    await fetch(`/api/admin/keys/${keyId}`, { method:'DELETE' });
    load();
  };

  const filtered = keys.filter(k => filter==='all' ? true : filter==='available' ? !k.is_used : k.is_used);

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', count: keys.length, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
          { label: 'Tersedia', count: keys.filter(k=>!k.is_used).length, color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800' },
          { label: 'Terpakai', count: keys.filter(k=>k.is_used).length,  color: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 text-center border ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add keys */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-white">Tambah Keys</h2>
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Pilih Varian</label>
          <select className={inputCls} value={variantId} onChange={e=>setVid(e.target.value)}>
            {product?.product_variants?.map(v => <option key={v.id} value={v.id}>{v.name} — Rp{v.price?.toLocaleString('id-ID')}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Keys (1 per baris)</label>
          <textarea className={inputCls} rows={6} value={bulk} onChange={e=>setBulk(e.target.value)} placeholder={"KEY001\nKEY002\nKEY003"} />
          <p className="text-xs text-gray-400 mt-1">{bulk.split('\n').filter(l=>l.trim()).length} keys</p>
        </div>
        <button onClick={addKeys} disabled={saving || !variantId || !bulk.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Menyimpan...' : `+ Tambah ${bulk.split('\n').filter(l=>l.trim()).length || 0} Keys`}
        </button>
      </div>

      {/* Keys list */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-white">Daftar Keys</h2>
          <div className="flex gap-1">
            {['all','available','used'].map(f => (
              <button key={f} onClick={()=>setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filter===f ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                {f==='all'?'Semua':f==='available'?'Tersedia':'Terpakai'}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-gray-400 dark:text-gray-600 text-sm">Tidak ada keys</div>
          ) : filtered.map(k => (
            <div key={k.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">{k.key_content}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.variant_name || ''}</p>
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
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
    </div>
  );
}
