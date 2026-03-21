'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProductPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [cats, setCats]       = useState([]);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ name:'', slug:'', category_id:'', description:'', thumbnail:'', banner_image:'', publisher:'', delivery_type:'auto', is_active:true, is_best_seller:false });
  const [variants, setVariants] = useState([{ name:'', price:'', stock:'0' }]);
  const [formFields, setFormFields] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/admin/categories').then(r => r.json()),
      fetch(`/api/admin/products/${id}`).then(r => r.json()),
    ]).then(([c, p]) => {
      if (cancelled) return;
      setCats(c || []);
      if (p) {
        setForm({
          name: p.name||'', slug: p.slug||'', category_id: p.category_id||'',
          description: p.description||'', thumbnail: p.thumbnail||'', banner_image: p.banner_image||'', publisher: p.publisher||'',
          delivery_type: p.delivery_type||'auto',
          is_active: p.is_active??true, is_best_seller: p.is_best_seller??false,
        });
        setVariants(
          p.product_variants?.length
            ? p.product_variants.map(v => ({ id: v.id, name: v.name || '', price: String(v.price || ''), stock: String(v.stock ?? 0) }))
            : [{ name:'', price:'', stock:'0' }]
        );
        setFormFields(p.form_fields || []);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);

  const setF  = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setFB = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  const addVariant    = () => setVariants(v => [...v, { name:'', price:'', stock:'0' }]);
  const removeVariant = i => setVariants(v => v.filter((_,j)=>j!==i));
  const setVariant    = (i,k,v) => setVariants(prev => prev.map((x,j)=>j===i?{...x,[k]:v}:x));
  const addField      = () => setFormFields(f => [...f, { label:'', placeholder:'', guide:'', required:true }]);

  // Toggle Ready/Sold untuk varian manual yang sudah tersimpan (punya id)
  const toggleAvailability = async (i, currentVal) => {
    const variant = variants[i];
    const newVal  = !currentVal;
    // Update state lokal dulu
    setVariant(i, 'is_available', newVal);
    // Kalau sudah punya ID (sudah tersimpan di DB), langsung hit API
    if (variant.id) {
      try {
        await fetch(`/api/admin/variants/${variant.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_available: newVal }),
        });
      } catch (e) {
        console.error('[TOGGLE]', e.message);
        setVariant(i, 'is_available', currentVal); // rollback
      }
    }
  };
  const removeField   = i => setFormFields(f => f.filter((_,j)=>j!==i));
  const setField      = (i,k,v) => setFormFields(prev => prev.map((x,j)=>j===i?{...x,[k]:v}:x));

  const save = async () => {
    if (!form.name || !form.category_id) return setError('Nama dan kategori wajib diisi.');
    if (variants.some(v => !v.name || !v.price)) return setError('Semua varian harus diisi lengkap.');
    setSaving(true); setError('');

    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        form_fields: formFields,
        variant_sync: variants.map(v => ({ name: v.name, price: parseInt(v.price), stock: parseInt(v.stock) || 0 })),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || data.error) return setError(data.error || 'Gagal menyimpan.');
    router.push('/admin/products');
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus produk "${form.name}"?`)) return;
    setDeleting(true);
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    router.push('/admin/products');
  };

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Produk</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">{form.name}</p>
          </div>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="px-3 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 disabled:opacity-50 transition-colors">
          {deleting ? '...' : '🗑️ Hapus'}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Nama Produk *</label>
            <input className={inputCls} value={form.name} onChange={setF('name')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Slug</label>
            <input className={inputCls} value={form.slug} onChange={setF('slug')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Kategori *</label>
            <select className={inputCls} value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))}>
              <option value="">-- Pilih --</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Deskripsi</label>
            <textarea className={inputCls} rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">URL Thumbnail (Icon Produk)</label>
            <input className={inputCls} value={form.thumbnail} onChange={setF('thumbnail')} placeholder="https://..." />
            {form.thumbnail && <img src={form.thumbnail} alt="preview" className="mt-2 w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />}
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">URL Banner (Background Detail Page)</label>
            <input className={inputCls} value={form.banner_image||''} onChange={setF('banner_image')} placeholder="https://... (opsional, landscape)" />
            {form.banner_image && <img src={form.banner_image} alt="banner" className="mt-2 w-full h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />}
            <p className="text-xs text-gray-400 mt-1">Jika kosong, thumbnail digunakan sebagai background</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Publisher / Developer</label>
            <input className={inputCls} value={form.publisher} onChange={setF('publisher')} placeholder="Contoh: Garena, Tencent, Moonton, HoyoVerse" />
            <p className="text-xs text-gray-400 mt-1">Ditampilkan di bawah nama produk pada halaman utama & detail</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Tipe Pengiriman</label>
            <select className={inputCls} value={form.delivery_type} onChange={e=>setForm(f=>({...f,delivery_type:e.target.value}))}>
              <option value="auto">⚡ Otomatis</option>
              <option value="manual">👤 Manual</option>
            </select>
          </div>
          <div className="flex flex-col gap-3 justify-center pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={setFB('is_active')} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Produk Aktif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_best_seller} onChange={setFB('is_best_seller')} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">🔥 Best Seller</span>
            </label>
          </div>
        </div>

        {/* Variants */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">Varian & Harga</p>
              <p className="text-xs text-gray-400 mt-0.5">Harga dalam Rupiah (tanpa fee)</p>
            </div>
            <button onClick={addVariant}
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 transition-colors">
              + Tambah Varian
            </button>
          </div>
          {/* Sub-header kolom */}
          <div className="grid gap-1 mb-1" style={{gridTemplateColumns:'1fr 90px 80px 32px'}}>
            <span className="text-xs text-gray-400 dark:text-gray-500 px-1">Nama Item</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 px-1">Harga (Rp)</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 px-1">Stok</span>
            <span></span>
          </div>
          <div className="space-y-1.5">
            {variants.map((v,i) => (
              <div key={i} className="grid gap-1.5 items-center" style={{gridTemplateColumns:'1fr 90px 80px 32px'}}>
                <input
                  value={v.name}
                  onChange={e=>setVariant(i,'name',e.target.value)}
                  placeholder="80 ROBUX"
                  className={inputCls}
                />
                <input
                  value={v.price}
                  onChange={e=>setVariant(i,'price',e.target.value)}
                  placeholder="15000"
                  type="number"
                  className={inputCls}
                />
                <input
                  value={v.stock}
                  onChange={e=>setVariant(i,'stock',e.target.value)}
                  placeholder="0"
                  type="number"
                  min="0"
                  className={inputCls}
                  title="0 = tidak tersedia (tidak bisa dipilih pembeli)"
                />
                <button onClick={()=>removeVariant(i)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 text-xl">×</button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">💡 Stok 0 = variant tidak bisa dipilih pembeli</p>
        </div>

        {/* Form Fields */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">Form Checkout Kustom</p>
              <p className="text-xs text-gray-400 mt-0.5">Field yang diisi pembeli (Game ID, Username, dll)</p>
            </div>
            <button onClick={addField}
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 transition-colors">
              + Tambah Field
            </button>
          </div>
          <div className="space-y-3">
            {formFields.map((f,i) => (
              <div key={i} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex gap-2 items-center">
                  <input value={f.label} onChange={e=>setField(i,'label',e.target.value)} placeholder="Label (mis: USERNAME)" className={`flex-1 ${inputCls}`} />
                  <input value={f.placeholder} onChange={e=>setField(i,'placeholder',e.target.value)} placeholder="Placeholder (mis: roblox123)" className={`flex-1 ${inputCls}`} />
                  <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <input type="checkbox" checked={f.required} onChange={e=>setField(i,'required',e.target.checked)} className="w-3.5 h-3.5" /> Wajib
                  </label>
                  <button onClick={()=>removeField(i)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 flex-shrink-0 text-xl">×</button>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-2.5" style={{color:'#3b82f6'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </div>
                  <textarea value={f.guide||''} onChange={e=>setField(i,'guide',e.target.value)} rows={2} placeholder="Panduan cara menemukan nilai ini (opsional)..." className={`flex-1 ${inputCls}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.push('/admin/products')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Batal
          </button>
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}