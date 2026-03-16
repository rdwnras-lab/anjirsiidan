'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cats, setCats]     = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const [form, setForm] = useState({
    name: '', slug: '', category_id: '', description: '',
    thumbnail: '', delivery_type: 'auto', is_active: true, is_best_seller: false,
  });
  const [variants, setVariants] = useState([]);
  const [formFields, setFormFields] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then(r => r.json()),
      fetch(`/api/admin/products/${id}`).then(r => r.json()),
    ]).then(([c, p]) => {
      setCats(c || []);
      if (p) {
        setForm({
          name: p.name || '',
          slug: p.slug || '',
          category_id: p.category_id || '',
          description: p.description || '',
          thumbnail: p.thumbnail || '',
          delivery_type: p.delivery_type || 'auto',
          is_active: p.is_active ?? true,
          is_best_seller: p.is_best_seller ?? false,
        });
        setVariants(p.product_variants?.map(v => ({ id: v.id, name: v.name, price: v.price })) || []);
        setFormFields(p.form_fields || []);
      }
      setLoading(false);
    });
  }, [id]);

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setFB = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  const addVariant    = () => setVariants(v => [...v, { name: '', price: '' }]);
  const removeVariant = i => setVariants(v => v.filter((_, j) => j !== i));
  const setVariant    = (i, k, v) => setVariants(prev => prev.map((x, j) => j === i ? { ...x, [k]: v } : x));

  const addField    = () => setFormFields(f => [...f, { label: '', placeholder: '', required: true }]);
  const removeField = i => setFormFields(f => f.filter((_, j) => j !== i));
  const setField    = (i, k, v) => setFormFields(prev => prev.map((x, j) => j === i ? { ...x, [k]: v } : x));

  const save = async () => {
    if (!form.name || !form.category_id) return setError('Nama dan kategori wajib diisi.');
    setSaving(true); setError('');
    // Update product
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, form_fields: formFields }),
    });
    // Update variants: delete all then re-insert
    await fetch(`/api/admin/products/${id}/variants`, { method: 'DELETE' }).catch(() => {});
    if (variants.length) {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, variants }),
      }).catch(() => {});
    }
    setSaving(false);
    if (!res.ok) { const d = await res.json(); return setError(d.error || 'Gagal menyimpan.'); }
    router.push('/admin/products');
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus produk "${form.name}"? Semua varian dan stok akan ikut terhapus.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    router.push('/admin/products');
  };

  if (loading) return <div className="p-6"><LoadingSpinner /></div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold">Edit Produk</h1>
        <button onClick={handleDelete} disabled={deleting}
          className="text-sm text-danger border border-danger/30 px-4 py-2 rounded-xl hover:bg-danger/10 transition-colors font-semibold">
          {deleting ? 'Menghapus...' : '🗑️ Hapus Produk'}
        </button>
      </div>
      <div className="space-y-5">
        <Input label="Nama Produk *" value={form.name} onChange={setF('name')} />
        <Input label="Slug (URL)" value={form.slug} onChange={setF('slug')} />
        <Select label="Kategori *" value={form.category_id}
          onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
          options={[{ value: '', label: '-- Pilih Kategori --' }, ...cats.map(c => ({ value: c.id, label: c.name }))]} />
        <Textarea label="Deskripsi" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <Input label="Thumbnail URL" value={form.thumbnail} onChange={setF('thumbnail')} placeholder="https://i.imgur.com/xxx.jpg" />
        <Select label="Tipe Pengiriman" value={form.delivery_type}
          onChange={e => setForm(f => ({ ...f, delivery_type: e.target.value }))}
          options={[{ value: 'auto', label: '⚡ Otomatis' }, { value: 'manual', label: '👤 Manual' }]} />

        {/* Toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-dim cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={setFB('is_active')} className="w-4 h-4" />
            Produk Aktif
          </label>
          <label className="flex items-center gap-2 text-sm text-dim cursor-pointer">
            <input type="checkbox" checked={form.is_best_seller} onChange={setFB('is_best_seller')} className="w-4 h-4" />
            🔥 Best Seller
          </label>
        </div>

        {/* Variants */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-dim">Varian & Harga</label>
            <button onClick={addVariant} className="text-xs text-accent-light">+ Tambah</button>
          </div>
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input value={v.name} onChange={e => setVariant(i, 'name', e.target.value)}
                  placeholder="50 Diamond"
                  className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent/50" />
                <input value={v.price} onChange={e => setVariant(i, 'price', e.target.value)}
                  placeholder="15000" type="number"
                  className="w-32 bg-card border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent/50" />
                <button onClick={() => removeVariant(i)} className="text-danger px-2">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom form fields */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="text-sm text-dim">Form Checkout Kustom</label>
              <p className="text-xs text-muted">Field yang diisi pembeli saat checkout (Game ID, Server, dll)</p>
            </div>
            <button onClick={addField} className="text-xs text-accent-light">+ Tambah Field</button>
          </div>
          <div className="space-y-2">
            {formFields.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={f.label} onChange={e => setField(i, 'label', e.target.value)}
                  placeholder="Label (misal: Game ID)"
                  className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent/50" />
                <input value={f.placeholder} onChange={e => setField(i, 'placeholder', e.target.value)}
                  placeholder="Placeholder"
                  className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent/50" />
                <label className="flex items-center gap-1 text-xs text-dim whitespace-nowrap">
                  <input type="checkbox" checked={f.required} onChange={e => setField(i, 'required', e.target.checked)} /> Wajib
                </label>
                <button onClick={() => removeField(i)} className="text-danger px-2">×</button>
              </div>
            ))}
          </div>
        </div>

        {form.thumbnail && (
          <div>
            <p className="text-xs text-dim mb-2">Preview Thumbnail:</p>
            <img src={form.thumbnail} alt="preview" className="w-24 h-24 rounded-xl object-cover border border-border" />
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3">
          <button onClick={() => router.push('/admin/products')} className="text-sm text-muted hover:text-text">← Batal</button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
        </div>
      </div>
    </div>
  );
}
