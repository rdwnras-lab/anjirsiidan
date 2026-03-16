'use client';
import { useEffect, useState } from 'react';
import { formatIDR, timeAgo } from '@/lib/utils';

const STATUS_LABEL = { pending:'Menunggu Bayar', paid:'Dibayar', processing:'Diproses Admin', completed:'Selesai', failed:'Gagal', cancelled:'Dibatalkan' };
const STATUS_COLOR = { pending:'#fbbf24', paid:'#a78bfa', processing:'#60a5fa', completed:'#34d399', failed:'#ef4444', cancelled:'#6b7280' };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/orders').then(r=>r.json()).then(d=>{
      setOrders(Array.isArray(d)?d:[]);setLoading(false);
    }).catch(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  const updateStatus = async (id, status) => {
    if(!confirm(`Ubah status ke "${STATUS_LABEL[status] || status}"?`))return;
    setUpdating(id);
    await fetch(`/api/admin/orders/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
    setUpdating(null);load();
  };

  const filtered = filter==='all' ? orders : orders.filter(o=>o.status===filter);

  return (
    <div style={{padding:32,maxWidth:1100}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,color:'#f1f0ff'}}>Pesanan</h1>
          <p style={{color:'#52526e',fontSize:14,marginTop:4}}>{orders.length} total pesanan</p>
        </div>
        <button onClick={load} style={{background:'#2a2a3a',color:'#9ca3af',border:'none',borderRadius:10,padding:'10px 18px',fontSize:13,cursor:'pointer'}}>↻ Refresh</button>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        {['all','pending','paid','processing','completed','failed'].map(f=>{
          const count = f==='all'?orders.length:orders.filter(o=>o.status===f).length;
          return (
            <button key={f} onClick={()=>setFilter(f)} style={{fontSize:12,padding:'6px 14px',borderRadius:999,border:'1px solid',cursor:'pointer',
              background:filter===f?'rgba(124,58,237,0.2)':'#16161e',
              borderColor:filter===f?'#7c3aed':'#2a2a3a',
              color:filter===f?'#a78bfa':'#6b7280'}}>
              {f==='all'?'Semua':STATUS_LABEL[f]} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      {loading ? <p style={{color:'#6b7280'}}>Memuat...</p> : (
        <div style={{background:'#16161e',border:'1px solid #2a2a3a',borderRadius:16,overflow:'hidden'}}>
          {filtered.length===0 && <p style={{padding:40,textAlign:'center',color:'#52526e'}}>Tidak ada pesanan.</p>}
          {filtered.map((o,i)=>(
            <div key={o.id} style={{padding:'16px 20px',borderBottom:i<filtered.length-1?'1px solid #2a2a3a':'none',display:'flex',alignItems:'flex-start',gap:16}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <span style={{fontSize:11,padding:'2px 8px',borderRadius:999,fontWeight:700,background:`${STATUS_COLOR[o.status]||'#6b7280'}22`,color:STATUS_COLOR[o.status]||'#6b7280'}}>
                    {STATUS_LABEL[o.status]||o.status}
                  </span>
                  <span style={{fontSize:11,padding:'2px 8px',borderRadius:999,background:o.delivery_type==='auto'?'rgba(124,58,237,0.15)':'rgba(255,255,255,0.05)',color:o.delivery_type==='auto'?'#a78bfa':'#6b7280',fontWeight:600}}>
                    {o.delivery_type==='auto'?'⚡ Auto':'👤 Manual'}
                  </span>
                </div>
                <div style={{fontSize:14,fontWeight:600,color:'#e5e7eb'}}>{o.product_name} — {o.variant_name}</div>
                <div style={{fontSize:12,color:'#52526e',fontFamily:'monospace',marginTop:2}}>{o.id}</div>
                <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>
                  {o.customer_name||o.discord_id||'—'}
                  {o.customer_whatsapp&&` · WA: ${o.customer_whatsapp}`}
                  {o.form_data && Object.keys(o.form_data).length>0 &&
                    Object.entries(o.form_data).map(([k,v])=>` · ${k}: ${v}`).join('')
                  }
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:15,fontWeight:700,color:'#a78bfa',marginBottom:4}}>{formatIDR(o.total_amount||0)}</div>
                <div style={{fontSize:11,color:'#52526e',marginBottom:8}}>{timeAgo(o.created_at)}</div>
                <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                  {o.status==='processing'&&(
                    <button disabled={updating===o.id} onClick={()=>updateStatus(o.id,'completed')}
                      style={{background:'rgba(16,185,129,0.15)',color:'#34d399',border:'1px solid rgba(16,185,129,0.3)',borderRadius:8,padding:'5px 12px',fontSize:12,cursor:'pointer',fontWeight:600}}>
                      {updating===o.id?'...':'✓ Selesai'}
                    </button>
                  )}
                  {['pending','paid'].includes(o.status)&&(
                    <button disabled={updating===o.id} onClick={()=>updateStatus(o.id,'cancelled')}
                      style={{background:'rgba(239,68,68,0.1)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'5px 12px',fontSize:12,cursor:'pointer'}}>
                      Batal
                    </button>
                  )}
                  <a href={`/orders/${o.id}`} target="_blank" style={{background:'#2a2a3a',color:'#9ca3af',borderRadius:8,padding:'5px 12px',fontSize:12,textDecoration:'none'}}>Lihat</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
