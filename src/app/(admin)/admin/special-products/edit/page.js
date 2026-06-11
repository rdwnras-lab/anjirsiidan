'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SPECIAL_CATS = ['website', 'bot', 'template'];
const inp = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";
const lbl = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5";

function EditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id   = searchParams.get('id');
  const isNew = !id;

  const [loading,      setLoading]      = useState(!isNew);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  const [imgProgress,  setImgProgress]  = useState('');
  const [vidProgress,  setVidProgress]  = useState('');

  const [form, setForm] = useState({
    name:'', slug:'', category_slug:'website', product_info:'',
    is_active:true, delivery_type:'manual', thumbnail:'', banner_image:'',
  });
  const [variants,      setVariants]      = useState([{ name:'Paket Standar', price:'' }]);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideo,  setPreviewVideo]  = useState('');
  const imgRef = useRef(null);
  const vidRef = useRef(null);

  const setF  = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setFB = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));
  const slugify = v => v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  useEffect(() => {
    setLoading(false);
    if (isNew) { return; }
    fetch('/api/admin/special-products/edit?id=' + id)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setForm({
          name: d.name||'', slug: d.slug||'',
          category_slug: d.categories?.name?.toLowerCase()||'website',
          product_info: d.product_info||'', is_active: d.is_active??true,
          delivery_type: d.delivery_type||'auto', thumbnail: d.thumbnail||'',
          banner_image: d.banner_image||'',
        });
        setVariants(d.product_variants?.length
          ? d.product_variants.map(v=>({id:v.id,name:v.name,price:String(v.price),stock:String(v.stock??0)}))
          : [{name:'Paket Standar',price:'',stock:'0'}]);
        setPreviewImages(Array.isArray(d.preview_images) ? d.preview_images : []);
        setPreviewVideo(d.preview_video||'');
        setLoading(false);
      });
  }, []); // eslint-disable-line

  // Direct upload to Supabase via presigned URL - much faster
  const uploadDirect = async (file, type, onProgress) => {
    try {
      onProgress('Mempersiapkan upload...');
      
      // Coba upload via FormData ke server
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      
      onProgress('Mengupload ' + (type === 'video' ? 'video' : 'foto') + '...');
      
      const r = await fetch('/api/upload-media', { method:'POST', body: fd });
      const data = await r.json();
      
      if (data.error) {
        onProgress('');
        setError('Upload gagal: ' + data.error);
        return null;
      }
      
      onProgress('');
      return data.url || null;
    } catch(e) {
      onProgress('');
      setError('Upload error: ' + e.message);
      return null;
    }
  };

  const handleImages = async (e) => {
    const files = Array.from(e.target.files||[]).slice(0, 20 - previewImages.length);
    if (!files.length) return;
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadDirect(files[i], 'image', msg => setImgProgress(msg + ' (' + (i+1) + '/' + files.length + ')'));
      if (url) urls.push(url);
    }
    setPreviewImages(p => [...p, ...urls].slice(0,20));
    if (imgRef.current) imgRef.current.value = '';
  };

  const handleVideo = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await uploadDirect(file, 'video', setVidProgress);
    if (url) setPreviewVideo(url);
    if (vidRef.current) vidRef.current.value = '';
  };

  const addV    = () => setVariants(v=>[...v,{name:'',price:'',delivery_content:''}]);
  const removeV = i => setVariants(v=>v.filter((_,j)=>j!==i));
  const setV    = (i,k,val) => setVariants(v=>v.map((x,j)=>j===i?{...x,[k]:val}:x));

  const handleDelete = async () => {
    if (!id || !confirm('Hapus produk ini? Tidak bisa dikembalikan.')) return;
    const r = await fetch('/api/admin/special-products/edit?id='+id, {method:'DELETE'});
    const d = await r.json();
    if (d.ok) router.push('/admin/special-products');
    else setError(d.error || 'Gagal hapus.');
  };

  const save = async () => {
    if (!form.name.trim())     return setError('Nama wajib diisi.');
    if (!form.slug.trim())     return setError('Slug wajib diisi.');
    if (variants.some(v=>!v.name||!v.price)) return setError('Semua paket harus diisi.');
    console.log('saving...', {form, variants}); setSaving(true); setError(''); setSuccess('');
    const body = {
      ...form, preview_images:previewImages, preview_video:previewVideo, download_url: null,
      variant_sync: variants.map(v=>({...(v.id?{id:v.id}:{}),name:v.name,price:parseInt(v.price),stock:parseInt(v.stock)||0})),
    };
    const url    = isNew ? '/api/admin/special-products' : '/api/admin/special-products/edit?id='+id;
    const method = isNew ? 'POST' : 'PATCH';
    const res  = await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data = await res.json();
    if (data.error) { setError(data.error); setSaving(false); return; }
    setSuccess('Tersimpan!');
    if (isNew && data.id) router.push('/admin/special-products/edit?id='+data.id);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={()=>router.push('/admin/special-products')}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{isNew?'Tambah Produk':'Edit Produk'}</h1>
        </div>
        {!isNew && (
          <button onClick={handleDelete}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors">
            Hapus Produk
          </button>
        )}
      </div>

      {/* Info Dasar */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Informasi Dasar</h2>
        <div>
          <label className={lbl}>Nama Produk</label>
          <input className={inp} placeholder="Landing Page Premium"
            value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,slug:slugify(e.target.value)}))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Slug URL</label>
            <input className={inp} value={form.slug} onChange={setF('slug')} />
          </div>
          <div>
            <label className={lbl}>Kategori</label>
            <select className={inp} value={form.category_slug} onChange={setF('category_slug')}>
              {SPECIAL_CATS.map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={lbl}>Thumbnail / Icon URL</label>
          <input className={inp} type="url" placeholder="https://... (gambar ikon produk di listing)"
            value={form.thumbnail||''} onChange={setF('thumbnail')} />
          {form.thumbnail && (
            <img src={form.thumbnail} alt="thumb" className="mt-2 w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
          )}
        </div>
        <div>
          <label className={lbl}>Jenis Pengiriman</label>
          <div className={inp + " bg-gray-50 dark:bg-gray-900 cursor-not-allowed"} style={{opacity:0.7}}>Manual (admin proses pesanan)</div>
          <p className="text-xs text-gray-400 mt-1">Produk khusus selalu manual — admin proses dan hubungi pembeli via Discord.</p>
        </div>
        <div>
          <label className={lbl}>Banner URL (opsional)</label>
          <input className={inp} type="url" placeholder="https://..." value={form.banner_image} onChange={setF('banner_image')} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={setFB('is_active')} className="w-4 h-4 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Produk aktif</span>
        </label>
      </div>

      {/* Informasi */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Informasi Produk</h2>
        <textarea className={inp} rows={7} placeholder="Fitur, spesifikasi, teknologi..." value={form.product_info} onChange={setF('product_info')} />
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 space-y-5">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Preview Produk</h2>
        <input ref={vidRef} type="file" accept="video/*" onChange={handleVideo} className="hidden" />
        <input ref={imgRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
        <div>
          <label className={lbl}>Video Preview (maks 1)</label>
          {previewVideo ? (
            <div className="relative">
              <video src={previewVideo} controls className="w-full rounded-xl max-h-52 bg-black" />
              <button onClick={()=>setPreviewVideo('')} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white font-bold flex items-center justify-center">x</button>
            </div>
          ) : (
            <button onClick={()=>vidRef.current?.click()} disabled={!!vidProgress}
              className="w-full py-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all disabled:opacity-50">
              {vidProgress || '+ Pilih Video dari Galeri'}
            </button>
          )}
        </div>
        <div>
          <label className={lbl}>Foto Preview ({previewImages.length}/20)</label>
          {previewImages.length < 20 && (
            <button onClick={()=>imgRef.current?.click()} disabled={!!imgProgress}
              className="w-full py-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all disabled:opacity-50 mb-3">
              {imgProgress || '+ Pilih Foto (sisa '+(20-previewImages.length)+')'}
            </button>
          )}
          {previewImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {previewImages.map((url,i)=>(
                <div key={i} className="relative group aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                  <button onClick={()=>setPreviewImages(p=>p.filter((_,j)=>j!==i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Paket Harga */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Paket Harga</h2>
          <button onClick={addV} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold">+ Tambah</button>
        </div>
        <div className="space-y-2">
          <div className="grid gap-2 mb-1" style={{gridTemplateColumns:'1fr 130px 32px'}}>
            <span className="text-xs text-gray-400 px-1">Nama Paket</span>
            <span className="text-xs text-gray-400 px-1">Harga (Rp)</span>
            <span/>
          </div>
          {/* Header kolom */}
          <div className="grid gap-2 mb-1" style={{gridTemplateColumns:'1fr 120px 90px 32px'}}>
            <span className="text-xs text-gray-400 px-1">Nama Paket</span>
            <span className="text-xs text-gray-400 px-1">Harga (Rp)</span>
            <span className="text-xs text-gray-400 px-1">Stok</span>
            <span/>
          </div>
          {variants.map((v,i)=>(
            <div key={i} className="grid gap-2 items-center" style={{gridTemplateColumns:'1fr 120px 90px 32px'}}>
              <input className={inp} placeholder="Source Code" value={v.name} onChange={e=>setV(i,'name',e.target.value)} />
              <input className={inp} type="number" min="0" placeholder="500000" value={v.price} onChange={e=>setV(i,'price',e.target.value)} />
              <input className={inp} type="number" min="0" placeholder="0"
                value={v.stock??'0'} onChange={e=>setV(i,'stock',e.target.value)}
                title="0 = tidak tersedia" />
              <button onClick={()=>removeV(i)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 text-xl font-bold">x</button>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">Stok 0 = paket tidak bisa dipilih pembeli</p>
        </div>
      </div>



      {error   && <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400 font-semibold">{error}</div>}
      {success && <div className="px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-sm text-green-600 dark:text-green-400 font-semibold">{success}</div>}

      <div className="flex gap-3 pb-8">
        <button onClick={()=>router.push('/admin/special-products')}
          className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300">Batal</button>
        <button onClick={save} disabled={saving}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
          {saving?'Menyimpan...':(isNew?'Buat Produk':'Simpan')}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>}>
      <EditForm />
    </Suspense>
  );
}