import { supabaseAdmin } from '@/lib/supabase';
import { formatIDR } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const { data: products } = await supabaseAdmin.from('products').select(`
    id, name, slug, thumbnail, delivery_type, is_active, sort_order,
    categories(name),
    product_variants(id, price),
    product_keys(id, is_used)
  `).order('created_at', { ascending: false });

  return (
    <div style={{padding:32,maxWidth:1100}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,color:'#f1f0ff'}}>Produk</h1>
          <p style={{color:'#52526e',fontSize:14,marginTop:4}}>{(products||[]).length} produk terdaftar</p>
        </div>
        <Link href="/admin/products/new" style={{background:'#7c3aed',color:'#fff',borderRadius:10,padding:'10px 20px',fontSize:14,fontWeight:600,textDecoration:'none',display:'inline-block'}}>+ Tambah Produk</Link>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {(products||[]).length===0 && (
          <div style={{textAlign:'center',padding:60,color:'#52526e'}}>
            <div style={{fontSize:40,marginBottom:12}}>📦</div>
            <p>Belum ada produk.</p>
            <Link href="/admin/products/new" style={{color:'#7c3aed',fontSize:14}}>Tambah produk pertama →</Link>
          </div>
        )}
        {(products||[]).map(p => {
          const stock = p.delivery_type==='auto' ? (p.product_keys||[]).filter(k=>!k.is_used).length : null;
          const prices = (p.product_variants||[]).map(v=>v.price).filter(Boolean);
          const minPrice = prices.length ? Math.min(...prices) : null;
          return (
            <div key={p.id} style={{background:'#16161e',border:'1px solid #2a2a3a',borderRadius:14,padding:'16px 20px',display:'flex',alignItems:'center',gap:16}}>
              {p.thumbnail
                ? <img src={p.thumbnail} alt="" style={{width:52,height:52,borderRadius:10,objectFit:'cover',flexShrink:0}}/>
                : <div style={{width:52,height:52,borderRadius:10,background:'#2a2a3a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📦</div>
              }
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:'#e5e7eb',marginBottom:4}}>{p.name}</div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:12,color:'#6b7280'}}>{p.categories?.name||'—'}</span>
                  <span style={{fontSize:11,padding:'2px 8px',borderRadius:999,fontWeight:600,
                    background:p.delivery_type==='auto'?'rgba(124,58,237,0.15)':'rgba(255,255,255,0.05)',
                    color:p.delivery_type==='auto'?'#a78bfa':'#9ca3af'}}>
                    {p.delivery_type==='auto'?'⚡ Auto':'👤 Manual'}
                  </span>
                  {stock!==null && (
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:999,fontWeight:600,
                      background:stock>0?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',
                      color:stock>0?'#34d399':'#ef4444'}}>
                      {stock} stok
                    </span>
                  )}
                  {minPrice && <span style={{fontSize:12,color:'#a78bfa',fontWeight:600}}>{formatIDR(minPrice)}+</span>}
                </div>
              </div>
              <div style={{display:'flex',gap:8,flexShrink:0}}>
                {p.delivery_type==='auto' && (
                  <Link href={`/admin/products/${p.id}/keys`} style={{background:'rgba(245,158,11,0.1)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,padding:'6px 14px',fontSize:13,textDecoration:'none',fontWeight:600}}>🔑 Stok</Link>
                )}
                <Link href={`/admin/products/${p.id}`} style={{background:'#2a2a3a',color:'#d1d5db',borderRadius:8,padding:'6px 14px',fontSize:13,textDecoration:'none'}}>Edit</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
