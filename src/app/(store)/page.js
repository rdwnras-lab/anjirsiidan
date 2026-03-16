import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getData() {
  const { data: cats }  = await supabaseAdmin.from('categories').select('*').eq('is_active', true).order('sort_order');
  const { data: prods } = await supabaseAdmin.from('products').select(`
    id, name, slug, description, thumbnail, delivery_type, category_id,
    product_variants(id, price),
    product_keys(id, is_used)
  `).eq('is_active', true).order('sort_order');
  return { cats: cats||[], prods: prods||[] };
}

function ProductCard({ product, stock }) {
  const isAuto   = product.delivery_type === 'auto';
  const prices   = (product.product_variants||[]).map(v=>v.price).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const noStock  = isAuto && stock === 0;
  return (
    <Link href={`/products/${product.slug}`} style={{
      display:'block', textDecoration:'none',
      background:'#13131a', border:'1px solid #1e1e2e',
      borderRadius:16, overflow:'hidden', transition:'all 0.2s',
      opacity: noStock ? 0.6 : 1
    }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(124,58,237,0.5)';e.currentTarget.style.transform='translateY(-2px)';}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor='#1e1e2e';e.currentTarget.style.transform='translateY(0)';}}>
      {/* Thumbnail */}
      <div style={{aspectRatio:'16/9',background:'linear-gradient(135deg,#1a1a2e,#16213e)',position:'relative',overflow:'hidden'}}>
        {product.thumbnail
          ? <img src={product.thumbnail} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36}}>🎮</div>
        }
        {/* Badges */}
        <div style={{position:'absolute',top:10,left:10,display:'flex',gap:6}}>
          {isAuto && <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:999,background:'rgba(124,58,237,0.9)',color:'#fff'}}>⚡ Otomatis</span>}
        </div>
        {isAuto && (
          <div style={{position:'absolute',top:10,right:10}}>
            <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:999,
              background:noStock?'rgba(239,68,68,0.9)':'rgba(16,185,129,0.9)',color:'#fff'}}>
              {noStock?'Habis':`${stock>99?'99+':stock} stok`}
            </span>
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{padding:'14px 16px'}}>
        <h3 style={{fontSize:14,fontWeight:700,color:'#e5e7eb',marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{product.name}</h3>
        {product.description && <p style={{fontSize:12,color:'#6b7280',marginBottom:8,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{product.description}</p>}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          {minPrice ? (
            <span style={{fontSize:13,fontWeight:700,color:'#a78bfa'}}>
              Mulai Rp{minPrice.toLocaleString('id-ID')}
            </span>
          ) : <span style={{fontSize:13,color:'#6b7280'}}>Lihat harga →</span>}
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const { cats, prods } = await getData();
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';
  return (
    <div>
      {/* Hero */}
      <section style={{position:'relative',overflow:'hidden',paddingTop:80,paddingBottom:64,textAlign:'center'}}>
        {/* BG blobs */}
        <div style={{position:'absolute',top:'-20%',left:'50%',transform:'translateX(-50%)',width:800,height:600,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(124,58,237,0.12) 0%,transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>
        <div style={{position:'relative',maxWidth:680,margin:'0 auto',padding:'0 20px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(124,58,237,0.12)',border:'1px solid rgba(124,58,237,0.25)',color:'#a78bfa',fontSize:12,fontWeight:600,padding:'4px 14px',borderRadius:999,marginBottom:24,letterSpacing:'0.05em'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#7c3aed',display:'inline-block',animation:'pulse 2s infinite'}}/>
            Stok selalu update
          </div>
          <h1 style={{fontSize:'clamp(40px,8vw,72px)',fontWeight:900,letterSpacing:'-2px',marginBottom:16,
            background:'linear-gradient(135deg,#f1f0ff 30%,#a78bfa 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            {storeName}
          </h1>
          <p style={{fontSize:17,color:'#6b7280',marginBottom:36,lineHeight:1.7,maxWidth:480,margin:'0 auto 36px'}}>
            {process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Top Up Game & Digital Products — Cepat, Aman, Terpercaya'}
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="#products" style={{background:'#7c3aed',color:'#fff',padding:'13px 28px',borderRadius:12,fontSize:15,fontWeight:700,textDecoration:'none'}}>Lihat Produk</a>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`} target="_blank" rel="noreferrer"
               style={{background:'rgba(255,255,255,0.06)',color:'#9ca3af',border:'1px solid #1e1e2e',padding:'13px 28px',borderRadius:12,fontSize:15,fontWeight:600,textDecoration:'none'}}>
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      {cats.length > 0 && (
        <section style={{maxWidth:1100,margin:'0 auto',padding:'0 20px 20px',overflowX:'auto'}}>
          <div style={{display:'flex',gap:8,paddingBottom:4}}>
            <a href="#products" style={{flexShrink:0,background:'#13131a',border:'1px solid #1e1e2e',color:'#9ca3af',padding:'8px 18px',borderRadius:12,fontSize:13,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>Semua</a>
            {cats.map(c=>(
              <a key={c.id} href={`#cat-${c.slug}`} style={{flexShrink:0,background:'#13131a',border:'1px solid #1e1e2e',color:'#9ca3af',padding:'8px 18px',borderRadius:12,fontSize:13,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:6}}>
                <span>{c.icon}</span>{c.name}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section id="products" style={{maxWidth:1100,margin:'0 auto',padding:'20px 20px 60px'}}>
        {prods.length === 0 && (
          <div style={{textAlign:'center',padding:80,color:'#52526e'}}>
            <div style={{fontSize:48,marginBottom:12}}>🏪</div>
            <p style={{fontSize:16}}>Belum ada produk tersedia.</p>
          </div>
        )}
        {cats.map(cat => {
          const catProds = prods.filter(p=>p.category_id===cat.id);
          if(!catProds.length) return null;
          return (
            <div key={cat.id} id={`cat-${cat.slug}`} style={{marginBottom:48}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                <span style={{fontSize:28}}>{cat.icon}</span>
                <div>
                  <h2 style={{fontSize:20,fontWeight:800,color:'#f1f0ff'}}>{cat.name}</h2>
                  {cat.description&&<p style={{fontSize:13,color:'#6b7280',marginTop:2}}>{cat.description}</p>}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
                {catProds.map(p=>{
                  const stock = p.delivery_type==='auto'?(p.product_keys||[]).filter(k=>!k.is_used).length:undefined;
                  return <ProductCard key={p.id} product={p} stock={stock}/>;
                })}
              </div>
            </div>
          );
        })}
      </section>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}
