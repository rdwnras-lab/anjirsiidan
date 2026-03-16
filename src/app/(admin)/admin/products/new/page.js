'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Input = ({label,desc,...p}) => (
  <div style={{marginBottom:18}}>
    {label&&<label style={{fontSize:13,color:'#9ca3af',display:'block',marginBottom:6}}>{label}</label>}
    <input style={{width:'100%',background:'#0f0f13',border:'1px solid #2a2a3a',color:'#f1f0ff',borderRadius:10,padding:'10px 14px',fontSize:14,outline:'none',boxSizing:'border-box'}} {...p}/>
    {desc&&<p style={{fontSize:12,color:'#52526e',marginTop:4}}>{desc}</p>}
  </div>
);

export default function NewProductPage() {
  const router = useRouter();
  const [cats, setCats]   = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm] = useState({ name:'', slug:'', category_id:'', description:'', thumbnail:'', delivery_type:'auto', is_active:true });
  const [variants, setVariants]     = useState([{name:'',price:''}]);
  const [formFields, setFormFields] = useState([]);

  useEffect(()=>{
    fetch('/api/admin/categories').then(r=>r.json()).then(d=>setCats(Array.isArray(d)?d:[])).catch(()=>{});
  },[]);

  const setF = k => e => setForm(f=>({...f,[k]:e.target.value,...(k==='name'&&!form.slug?{slug:e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}:{})}));
  const setV = (i,k,v) => setVariants(prev=>prev.map((x,j)=>j===i?{...x,[k]:v}:x));
  const setFF = (i,k,v) => setFormFields(prev=>prev.map((x,j)=>j===i?{...x,[k]:v}:x));

  const save = async () => {
    setError('');
    if(!form.name||!form.category_id){setError('Nama dan kategori wajib diisi');return;}
    if(variants.some(v=>!v.name||!v.price)){setError('Semua varian harus diisi');return;}
    setSaving(true);
    const res = await fetch('/api/admin/products',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...form,variants,formFields})
    });
    const data = await res.json().catch(()=>({}));
    setSaving(false);
    if(!res.ok){setError(data.error||'Gagal menyimpan');return;}
    router.push('/admin/products');
  };

  const S = {background:'#16161e',border:'1px solid #2a2a3a',borderRadius:16,padding:24,marginBottom:20};

  return (
    <div style={{padding:32,maxWidth:700}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
        <button onClick={()=>router.push('/admin/products')} style={{background:'#2a2a3a',border:'none',color:'#9ca3af',borderRadius:8,padding:'8px 14px',fontSize:13,cursor:'pointer'}}>← Kembali</button>
        <h1 style={{fontSize:22,fontWeight:800,color:'#f1f0ff'}}>Tambah Produk</h1>
      </div>

      {/* Info Dasar */}
      <div style={S}>
        <h2 style={{fontSize:14,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:20}}>Info Produk</h2>
        <Input label="Nama Produk *" value={form.name} onChange={setF('name')} placeholder="Spotify Premium 1 Bulan" />
        <Input label="Slug (URL)" value={form.slug} onChange={setF('slug')} placeholder="spotify-premium-1-bulan" />
        <div style={{marginBottom:18}}>
          <label style={{fontSize:13,color:'#9ca3af',display:'block',marginBottom:6}}>Kategori *</label>
          <select value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))}
            style={{width:'100%',background:'#0f0f13',border:'1px solid #2a2a3a',color:form.category_id?'#f1f0ff':'#6b7280',borderRadius:10,padding:'10px 14px',fontSize:14,outline:'none'}}>
            <option value="">-- Pilih Kategori --</option>
            {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:13,color:'#9ca3af',display:'block',marginBottom:6}}>Deskripsi</label>
          <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3}
            style={{width:'100%',background:'#0f0f13',border:'1px solid #2a2a3a',color:'#f1f0ff',borderRadius:10,padding:'10px 14px',fontSize:14,outline:'none',resize:'vertical',boxSizing:'border-box'}}
            placeholder="Deskripsi produk..." />
        </div>
        <Input label="Thumbnail URL" value={form.thumbnail} onChange={setF('thumbnail')} placeholder="https://i.imgur.com/xxx.jpg" />
        <div style={{marginBottom:18}}>
          <label style={{fontSize:13,color:'#9ca3af',display:'block',marginBottom:6}}>Tipe Pengiriman</label>
          <div style={{display:'flex',gap:10}}>
            {[{v:'auto',l:'⚡ Otomatis (kirim key setelah bayar)'},{v:'manual',l:'👤 Manual (admin proses)'}].map(t=>(
              <button key={t.v} onClick={()=>setForm(f=>({...f,delivery_type:t.v}))}
                style={{flex:1,padding:'10px 14px',borderRadius:10,fontSize:13,cursor:'pointer',fontWeight:600,
                  background:form.delivery_type===t.v?'rgba(124,58,237,0.2)':'#0f0f13',
                  border:form.delivery_type===t.v?'1px solid #7c3aed':'1px solid #2a2a3a',
                  color:form.delivery_type===t.v?'#a78bfa':'#6b7280'}}>
                {t.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Variants */}
      <div style={S}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.08em'}}>Varian & Harga</h2>
          <button onClick={()=>setVariants(v=>[...v,{name:'',price:''}])} style={{background:'rgba(124,58,237,0.1)',color:'#a78bfa',border:'none',borderRadius:8,padding:'6px 12px',fontSize:13,cursor:'pointer'}}>+ Tambah</button>
        </div>
        {variants.map((v,i)=>(
          <div key={i} style={{display:'flex',gap:10,marginBottom:10,alignItems:'flex-end'}}>
            <div style={{flex:2}}>
              {i===0&&<label style={{fontSize:12,color:'#6b7280',display:'block',marginBottom:4}}>Nama Varian</label>}
              <input value={v.name} onChange={e=>setV(i,'name',e.target.value)} placeholder="50 Diamond" style={{width:'100%',background:'#0f0f13',border:'1px solid #2a2a3a',color:'#f1f0ff',borderRadius:10,padding:'10px 14px',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{flex:1}}>
              {i===0&&<label style={{fontSize:12,color:'#6b7280',display:'block',marginBottom:4}}>Harga (Rp)</label>}
              <input value={v.price} onChange={e=>setV(i,'price',e.target.value)} placeholder="15000" type="number" style={{width:'100%',background:'#0f0f13',border:'1px solid #2a2a3a',color:'#f1f0ff',borderRadius:10,padding:'10px 14px',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
            </div>
            {variants.length>1&&<button onClick={()=>setVariants(v=>v.filter((_,j)=>j!==i))} style={{background:'rgba(239,68,68,0.1)',color:'#ef4444',border:'none',borderRadius:8,padding:'10px 14px',cursor:'pointer'}}>×</button>}
          </div>
        ))}
        <p style={{fontSize:12,color:'#52526e',marginTop:8}}>Harga dalam Rupiah. Biaya QRIS Pakasir otomatis ditambahkan saat checkout.</p>
      </div>

      {/* Custom form fields */}
      <div style={S}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div>
            <h2 style={{fontSize:14,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.08em'}}>Form Checkout Kustom</h2>
            <p style={{fontSize:12,color:'#52526e',marginTop:4}}>Field tambahan yang wajib diisi pembeli, contoh: Game ID, Server ID</p>
          </div>
          <button onClick={()=>setFormFields(f=>[...f,{label:'',placeholder:'',required:true}])} style={{background:'rgba(124,58,237,0.1)',color:'#a78bfa',border:'none',borderRadius:8,padding:'6px 12px',fontSize:13,cursor:'pointer'}}>+ Tambah</button>
        </div>
        {formFields.length===0&&<p style={{fontSize:13,color:'#52526e'}}>Tidak ada field kustom. Tambah jika produk memerlukan info tambahan dari pembeli.</p>}
        {formFields.map((f,i)=>(
          <div key={i} style={{display:'flex',gap:10,marginBottom:10,alignItems:'center'}}>
            <input value={f.label} onChange={e=>setFF(i,'label',e.target.value)} placeholder="Label (misal: Game ID)" style={{flex:1,background:'#0f0f13',border:'1px solid #2a2a3a',color:'#f1f0ff',borderRadius:10,padding:'10px 14px',fontSize:13,outline:'none'}}/>
            <input value={f.placeholder} onChange={e=>setFF(i,'placeholder',e.target.value)} placeholder="Placeholder" style={{flex:1,background:'#0f0f13',border:'1px solid #2a2a3a',color:'#f1f0ff',borderRadius:10,padding:'10px 14px',fontSize:13,outline:'none'}}/>
            <label style={{display:'flex',alignItems:'center',gap:4,fontSize:12,color:'#9ca3af',whiteSpace:'nowrap'}}>
              <input type="checkbox" checked={f.required} onChange={e=>setFF(i,'required',e.target.checked)}/> Wajib
            </label>
            <button onClick={()=>setFormFields(f=>f.filter((_,j)=>j!==i))} style={{background:'rgba(239,68,68,0.1)',color:'#ef4444',border:'none',borderRadius:8,padding:'8px 12px',cursor:'pointer'}}>×</button>
          </div>
        ))}
      </div>

      {error&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:14}}>{error}</div>}
      <div style={{display:'flex',gap:12}}>
        <button onClick={()=>router.push('/admin/products')} style={{background:'#2a2a3a',color:'#9ca3af',border:'none',borderRadius:10,padding:'12px 24px',fontSize:14,cursor:'pointer'}}>Batal</button>
        <button onClick={save} disabled={saving} style={{background:'#7c3aed',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontSize:14,fontWeight:600,cursor:saving?'not-allowed':'pointer',opacity:saving?.6:1}}>{saving?'Menyimpan...':'Simpan Produk'}</button>
      </div>
    </div>
  );
}
