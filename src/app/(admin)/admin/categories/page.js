'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const Input = ({label, ...p}) => (
  <div style={{marginBottom:16}}>
    {label && <label style={{fontSize:13,color:'#9ca3af',display:'block',marginBottom:6}}>{label}</label>}
    <input style={{width:'100%',background:'#0f0f13',border:'1px solid #2a2a3a',color:'#f1f0ff',borderRadius:10,padding:'10px 14px',fontSize:14,outline:'none',boxSizing:'border-box'}} {...p}/>
  </div>
);

export default function CategoriesPage() {
  const [cats, setCats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({name:'',slug:'',description:'',icon:'',sort_order:0});

  const load = () => {
    setLoading(true);
    fetch('/api/admin/categories').then(r=>r.json()).then(d=>{setCats(Array.isArray(d)?d:[]);setLoading(false);}).catch(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  const openNew = () => {setEditing(null);setForm({name:'',slug:'',description:'',icon:'',sort_order:0});setShowForm(true);};
  const openEdit = c => {setEditing(c);setForm({name:c.name||'',slug:c.slug||'',description:c.description||'',icon:c.icon||'',sort_order:c.sort_order||0});setShowForm(true);};
  const setF = k => e => setForm(f=>({...f,[k]:e.target.value,...(k==='name'&&!editing?{slug:e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}:{})}));

  const save = async () => {
    if(!form.name||!form.slug){alert('Nama dan slug wajib diisi');return;}
    setSaving(true);
    const url    = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,sort_order:Number(form.sort_order)||0})});
    const data = await res.json().catch(()=>({}));
    setSaving(false);
    if(!res.ok){alert(data.error||'Gagal menyimpan');return;}
    setShowForm(false);load();
  };

  const del = async id => {
    if(!confirm('Hapus kategori ini? Produk di dalamnya tidak akan terhapus.'))return;
    await fetch(`/api/admin/categories/${id}`,{method:'DELETE'});
    load();
  };

  const toggle = async (id, active) => {
    await fetch(`/api/admin/categories/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_active:!active})});
    load();
  };

  return (
    <div style={{padding:32,maxWidth:900}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,color:'#f1f0ff'}}>Kategori</h1>
          <p style={{color:'#52526e',fontSize:14,marginTop:4}}>{cats.length} kategori terdaftar</p>
        </div>
        <button onClick={openNew} style={{background:'#7c3aed',color:'#fff',border:'none',borderRadius:10,padding:'10px 20px',fontSize:14,fontWeight:600,cursor:'pointer'}}>+ Tambah</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#16161e',border:'1px solid #2a2a3a',borderRadius:20,padding:28,width:'100%',maxWidth:480}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#f1f0ff'}}>{editing?'Edit':'Tambah'} Kategori</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:20,cursor:'pointer'}}>×</button>
            </div>
            <Input label="Nama *" value={form.name} onChange={setF('name')} placeholder="Game Top Up" />
            <Input label="Slug (URL) *" value={form.slug} onChange={setF('slug')} placeholder="game-topup" />
            <Input label="Icon (emoji)" value={form.icon} onChange={setF('icon')} placeholder="🎮" />
            <Input label="Deskripsi" value={form.description} onChange={setF('description')} placeholder="Deskripsi kategori..." />
            <Input label="Urutan tampil" type="number" value={form.sort_order} onChange={setF('sort_order')} />
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
              <button onClick={()=>setShowForm(false)} style={{background:'#2a2a3a',color:'#9ca3af',border:'none',borderRadius:10,padding:'10px 20px',fontSize:14,cursor:'pointer'}}>Batal</button>
              <button onClick={save} disabled={saving} style={{background:'#7c3aed',color:'#fff',border:'none',borderRadius:10,padding:'10px 20px',fontSize:14,fontWeight:600,cursor:saving?'not-allowed':'pointer',opacity:saving?.6:1}}>{saving?'Menyimpan...':'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? <p style={{color:'#52526e'}}>Memuat...</p> : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {cats.length===0 && <p style={{color:'#52526e',textAlign:'center',padding:40}}>Belum ada kategori. Tambah yang pertama!</p>}
          {cats.map(c=>(
            <div key={c.id} style={{background:'#16161e',border:'1px solid #2a2a3a',borderRadius:14,padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <span style={{fontSize:26}}>{c.icon||'📁'}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:'#e5e7eb'}}>{c.name}</div>
                  <div style={{fontSize:12,color:'#52526e'}}>/{c.slug} · Urutan: {c.sort_order}</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:11,padding:'3px 10px',borderRadius:999,fontWeight:600,
                  background:c.is_active?'rgba(16,185,129,0.15)':'rgba(255,255,255,0.05)',
                  color:c.is_active?'#34d399':'#6b7280'}}>
                  {c.is_active?'Aktif':'Nonaktif'}
                </span>
                <button onClick={()=>openEdit(c)} style={{background:'#2a2a3a',color:'#d1d5db',border:'none',borderRadius:8,padding:'6px 14px',fontSize:13,cursor:'pointer'}}>Edit</button>
                <button onClick={()=>toggle(c.id,c.is_active)} style={{background:'#2a2a3a',color:'#d1d5db',border:'none',borderRadius:8,padding:'6px 14px',fontSize:13,cursor:'pointer'}}>{c.is_active?'Nonaktifkan':'Aktifkan'}</button>
                <button onClick={()=>del(c.id)} style={{background:'rgba(239,68,68,0.1)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'6px 14px',fontSize:13,cursor:'pointer'}}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
