'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function KeysPage() {
  const { id }            = useParams();
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
    setKeys(k || []);
    if (p?.product_variants?.[0]) setVid(p.product_variants[0].id);
  };
  useEffect(() => { load(); }, [id]);

  const addKeys = async () => {
    if (!variantId || !bulk.trim()) return;
    const lines = bulk.split('\n').map(l=>l.trim()).filter(Boolean);
    setSaving(true);
    await fetch('/api/admin/keys', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ productId: id, variantId, keys: lines })
    });
    setSaving(false); setBulk(''); load();
  };

  const deleteKey = async keyId => {
    if (!confirm('Hapus key ini?')) return;
    await fetch(`/api/admin/keys/${keyId}`, { method: 'DELETE' });
    load();
  };

  const filtered = keys.filter(k =>
    filter === 'all' ? true : filter === 'available' ? !k.is_used : k.is_used
  );

  if (!product) return <div className="p-6"><LoadingSpinner /></div>;

  const variants = product.product_variants || [];
  const availCount = keys.filter(k => !k.is_used).length;
  const usedCount  = keys.filter(k => k.is_used).length;

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-sm text-muted hover:text-text">← Produk</Link>
        <span className="text-muted">/</span>
        <h1 className="text-xl font-extrabold">{product.name} — Stok Key</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-success">{availCount}</div>
          <div className="text-xs text-muted">Tersedia</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-muted">{usedCount}</div>
          <div className="text-xs text-muted">Terpakai</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold">{keys.length}</div>
          <div className="text-xs text-muted">Total</div>
        </div>
      </div>

      {/* Add keys form */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <h2 className="font-bold mb-4">Tambah Stok</h2>
        <div className="space-y-3">
          <Select label="Varian" value={variantId} onChange={e=>setVid(e.target.value)}
            options={variants.map(v=>({ value:v.id, label:`${v.name} (Rp${v.price.toLocaleString()})` }))} />
          <div>
            <label className="text-sm text-dim block mb-1.5">Key / Kode (1 baris = 1 item)</label>
            <textarea rows={6} value={bulk} onChange={e=>setBulk(e.target.value)}
              placeholder={"username1:password1\nusername2:password2\nATCODE-XXXXX\n..."}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-muted outline-none focus:border-accent/50 font-mono resize-y" />
            <p className="text-xs text-muted mt-1">{bulk.split('\n').filter(l=>l.trim()).length} item akan ditambahkan</p>
          </div>
          <Button onClick={addKeys} disabled={saving}>{saving ? 'Menyimpan...' : 'Tambah Key'}</Button>
        </div>
      </div>

      {/* Keys list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Daftar Key</h2>
          <div className="flex gap-2">
            {['all','available','used'].map(f => (
              <button key={f} onClick={()=>setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter===f ? 'bg-accent/20 text-accent-light border-accent/30' : 'border-border text-muted hover:text-text'}`}>
                {f==='all'?'Semua':f==='available'?'Tersedia':'Terpakai'}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map(k => (
            <div key={k.id} className={`bg-card border rounded-xl p-3 flex items-center justify-between gap-4 ${k.is_used ? 'border-border opacity-50' : 'border-border'}`}>
              <div className="flex-1 min-w-0">
                <pre className="text-xs text-dim font-mono truncate">{k.key_content}</pre>
                <p className="text-xs text-muted mt-0.5">{variants.find(v=>v.id===k.variant_id)?.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge status={k.is_used ? 'completed' : 'pending'}>{k.is_used ? 'Terpakai' : 'Tersedia'}</Badge>
                {!k.is_used && <button onClick={()=>deleteKey(k.id)} className="text-xs text-danger hover:text-red-400">Hapus</button>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted text-sm py-8">Tidak ada key.</p>}
        </div>
      </div>
    </div>
  );
}
