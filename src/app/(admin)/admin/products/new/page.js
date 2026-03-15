'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

export default function NewProductPage() {
  const router = useRouter();
  const [cats, setCats]     = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const [form, setForm] = useState({
    name: '', slug: '', category_id: '', description: '',
    thumbnail: '', delivery_type: 'auto', is_active: true,
  });
  const [variants, setVariants] = useState([
    { name: '', price: '' }
  ]);
  const [formFields, setFormFields] = useState([]); // custom checkout form fields

  useEffect(() => {
    fetch('/api/admin/categories').then(r=>r.json()).then(setCats);
  }, []);

  const setF = k => e => setForm(f => ({
    ...f, [k]: e.target.value,
    ...(k==='name' ? { slug: e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') } : {})
  }));

  const addVariant     = () => setVariants(v => [...v, { name:'', price:'' }]);
  const removeVariant  = i => setVariants(v => v.filter((_,j)=>j!==i));
  const setVariant     = (i,k,v) => setVariants(prev => prev.map((x,j) => j===i ? {...x,[k]:v} : x));

  const addField       = () => setFormFields(f => [...f, { label:'', placeholder:'', required:true }]);
  const removeField    = i => setFormFields(f => f.filter((_,j)=>j!==i));
  const setField       = (i,k,v) => setFormFields(prev => prev.map((x,j) => j===i ? {...x,[k]:v} : x));

  const save = async () => {
    if (!form.name || !form.category_id) return setError('Nama dan kategori wajib diisi.');
    if (variants.some(v => !v.name || !v.price)) return setError('Semua varian harus diisi.');
    setSaving(true); setError('');
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, variants, formFields }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || data.error) return setError(data.error || 'Gagal menyimpan.');
    router.push('/admin/products');
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-extrabold mb-6">Tambah Produk</h1>
      <div className="space-y-5">
        <Input label="Nama Produk *" value={form.name} onChange={setF('name')} placeholder="Spotify Premium 1 Bulan" />
        <Input label="Slug (URL)" value={form.slug} onChange={setF('slug')} placeholder="spotify-premium-1-bulan" />
        <Select label="Kategori *" value={form.category_id} onChange={e => setForm(f=>({...f,category_id:e.target.value}))}
          options={[{value:'',label:'-- Pilih Kategori --'}, ...cats.map(c=>({value:c.id, label:c.name}))]} />
        <Textarea label="Deskripsi" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Deskripsi produk..." />
        <Input label="Thumbnail URL" value={form.thumbnail} onChange={setF('thumbnail')} placeholder="https://i.imgur.com/xxx.jpg" />
        <Select label="Tipe Pengiriman" value={form.delivery_type} onChange={e=>setForm(f=>({...f,delivery_type:e.target.value}))}
          options={[{value:'auto',label:'⚡ Otomatis (kirim key via Discord + halaman)'},{value:'manual',label:'👤 Manual (admin proses)'}]} />

        {/* Variants */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-dim">Varian & Harga *</label>
            <button onClick={addVariant} className="text-xs text-accent-light">+ Tambah</button>
          </div>
          <div className="space-y-2">
            {variants.map((v,i) => (
              <div key={i} className="flex gap-2">
                <input value={v.name} onChange={e=>setVariant(i,'name',e.target.value)}
                  placeholder="50 Diamond" className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent/50" />
                <input value={v.price} onChange={e=>setVariant(i,'price',e.target.value)}
                  placeholder="15000" type="number" className="w-32 bg-card border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent/50" />
                <button onClick={()=>removeVariant(i)} className="text-danger px-2">×</button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-1">Harga dalam Rupiah (tanpa titik/koma). Biaya QRIS otomatis dihitung.</p>
        </div>

        {/* Custom form fields */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="text-sm text-dim">Form Checkout Kustom</label>
              <p className="text-xs text-muted">Tambah field yang harus diisi pembeli (misal: Game ID, Server)</p>
            </div>
            <button onClick={addField} className="text-xs text-accent-light">+ Tambah Field</button>
          </div>
          <div className="space-y-2">
            {formFields.map((f,i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={f.label} onChange={e=>setField(i,'label',e.target.value)}
                  placeholder="Label (misal: Game ID)" className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent/50" />
                <input value={f.placeholder} onChange={e=>setField(i,'placeholder',e.target.value)}
                  placeholder="Placeholder" className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent/50" />
                <label className="flex items-center gap-1 text-xs text-dim whitespace-nowrap">
                  <input type="checkbox" checked={f.required} onChange={e=>setField(i,'required',e.target.checked)} /> Wajib
                </label>
                <button onClick={()=>removeField(i)} className="text-danger px-2">×</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3">
          <button onClick={()=>router.push('/admin/products')} className="text-sm text-muted hover:text-text">← Batal</button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Produk'}</Button>
        </div>
      </div>
    </div>
  );
}
