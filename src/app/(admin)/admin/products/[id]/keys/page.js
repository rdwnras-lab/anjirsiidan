'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function KeysPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [keys, setKeys]       = useState([]);
  const [variantId, setVid]   = useState('');
  const [bulk, setBulk]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [filter, setFilter]   = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [p, k] = await Promise.all([
        fetch(`/api/admin/products/${id}`).then(r=>r.json()),
        fetch(`/api/admin/keys?productId=${id}`).then(r=>r.json()),
      ]);
      setProduct(p);
      setKeys(Array.isArray(k)?k:[]);
      if(p?.product_variants?.[0]) setVid(p.product_variants[0].id);
    } catch(e) { console.error(e); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[id]);

  const addKeys = async () => {
    const lines = bulk.split('\n').map(l=>l.trim()).filter(Boolean);
    if(!variantId||!lines.length){alert('Pilih varian dan isi stok');return;}
    setSaving(true);
    const res = await fetch('/api/admin/keys',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({productId:id,variantId,keys:lines})
    });
    const data = await res.json().catch(()=>({}));
    setSaving(false);
    if(!res.ok){alert(data.error||'Gagal');return;}
    alert(`${lines.length} key berhasil ditambahkan!`);
    setBulk('');load();
  };

  const delKey = async kid => {
    if(!confirm('Hapus key ini?'))return;
    await fetch(`/api/admin/keys/${kid}`,{method:'DELETE'});
    load();
  };

  if(loading) return <div style={{padding:32,color:'#6b7280'}}>Memuat...</div>;
  if(!product) return <div style={{padding:32,color:'#ef4444'}}>Produk tidak ditemukan.</div>;

  const variants = product.product_variants||[];
  const filtered = keys.filter(k=>filter==='all'?true:filter==='available'?!k.is_used:k.is_used);
  const avail = keys.filter(k=>!k.is_used).length;
  const used  = keys.filter(k=>k.is_used).length;

  return (
    <div style={{padding:32,maxWidth:800}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
        <Link href="/admin/products" style={{background:'#2a2a3a',border:'none',color:'#9ca3af',borderRadius:8,padding:'8px 14px',fontSize:13,textDecoration:'none'}}>← Kembali</Link>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#f1f0ff'}}>{product.name}</h1>
          <p style={{fontSize:13,color:'#52526e',marginTop:2}}>Kelola Stok Key</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {[{label:'Tersedia',val:avail,c:'#34d399'},{label:'Terpakai',val:used,c:'#6b7280'},{label:'Total',val:keys.length,c:'#a78bfa'}].map(s=>(
          <div key={s.label} style={{background:'#16161e',border:'1px solid #2a2a3a',borderRadius:12,padding:'16px 20px',textAlign:'center'}}>
            <div style={{fontSize:28,fontWeight:800,color:s.c}}>{s.val}</div>
            <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add keys */}
      <div style={{background:'#16161e',border:'1px solid #2a2a3a',borderRadius:16,padding:24,marginBottom:24}}>
        <h2 style={{fontSize:14,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:16}}>Tambah Stok</h2>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:13,color:'#9ca3af',display:'block',marginBottom:6}}>Varian</label>
          <select value={variantId} onChange={e=>setVid(e.target.value)} style={{width:'100%',background:'#0f0f13',border:'1px solid #2a2a3a',color:'#f1f0ff',borderRadius:10,padding:'10px 14px',fontSize:14,outline:'none'}}>
            {variants.map(v=><option key={v.id} value={v.id}>{v.name} (Rp{(v.price||0).toLocaleString('id-ID')})</option>)}
          </select>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:13,color:'#9ca3af',display:'block',marginBottom:6}}>Key / Kode (1 baris = 1 item)</label>
          <textarea rows={7} value={bulk} onChange={e=>setBulk(e.target.value)}
            placeholder={'user1@gmail.com:password1\nuser2@gmail.com:password2\nKODE-XXXX-XXXX\n...'} style={{width:'100%',background:'#0f0f13',border:'1px solid #2a2a3a',color:'#f1f0ff',borderRadius:10,padding:'12px 14px',fontSize:13,fontFamily:'monospace',resize:'vertical',outline:'none',boxSizing:'border-box'}}/>
          <p style={{fontSize:12,color:'#52526e',marginTop:4}}>{bulk.split('\n').filter(l=>l.trim()).length} item akan ditambahkan</p>
        </div>
        <button onClick={addKeys} disabled={saving} style={{background:'#7c3aed',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:saving?'not-allowed':'pointer',opacity:saving?.6:1}}>
          {saving?'Menyimpan...':'Tambah Key'}
        </button>
      </div>

      {/* Keys list */}
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.08em'}}>Daftar Key</h2>
          <div style={{display:'flex',gap:6}}>
            {['all','available','used'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{fontSize:12,padding:'5px 12px',borderRadius:999,border:'1px solid',cursor:'pointer',
                background:filter===f?'rgba(124,58,237,0.2)':'transparent',
                borderColor:filter===f?'#7c3aed':'#2a2a3a',
                color:filter===f?'#a78bfa':'#6b7280'}}>
                {f==='all'?'Semua':f==='available'?'Tersedia':'Terpakai'}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {filtered.length===0&&<p style={{color:'#52526e',textAlign:'center',padding:24,fontSize:14}}>Tidak ada key.</p>}
          {filtered.map(k=>(
            <div key={k.id} style={{background:'#16161e',border:'1px solid #2a2a3a',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,opacity:k.is_used?.6:1}}>
              <div style={{flex:1,minWidth:0}}>
                <code style={{fontSize:12,color:k.is_used?'#6b7280':'#a78bfa',fontFamily:'monospace',display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{k.key_content}</code>
                <div style={{fontSize:11,color:'#52526e',marginTop:2}}>{variants.find(v=>v.id===k.variant_id)?.name||'—'}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                <span style={{fontSize:11,padding:'2px 8px',borderRadius:999,fontWeight:600,
                  background:k.is_used?'rgba(255,255,255,0.05)':'rgba(16,185,129,0.15)',
                  color:k.is_used?'#6b7280':'#34d399'}}>
                  {k.is_used?'Terpakai':'Tersedia'}
                </span>
                {!k.is_used&&<button onClick={()=>delKey(k.id)} style={{background:'rgba(239,68,68,0.1)',color:'#ef4444',border:'none',borderRadius:8,padding:'5px 10px',fontSize:12,cursor:'pointer'}}>Hapus</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
