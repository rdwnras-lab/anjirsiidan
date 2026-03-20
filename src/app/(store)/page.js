export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { supabaseAdmin } from '@/lib/supabase';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';
import BannerSlider from '@/components/store/BannerSlider';
import CategoryFilter from '@/components/store/CategoryFilter';

async function getHomeData() {
  const [catsRes, prodsRes, bannersRes] = await Promise.all([
    supabaseAdmin.from('categories').select('*').eq('is_active', true).order('sort_order'),
    supabaseAdmin.from('products').select(`
      *,
      categories(name, icon, slug),
      product_variants(id, price),
      product_keys(id, is_used)
    `).eq('is_active', true).order('sort_order').limit(50),
    supabaseAdmin.from('banners').select('*').eq('is_active', true).order('sort_order').limit(3),
  ]);
  return {
    cats:    catsRes.data    || [],
    prods:   prodsRes.data   || [],
    banners: bannersRes.data || [],
  };
}

export default async function HomePage() {
  const { cats, prods, banners } = await getHomeData();
  const bestSellers = prods.filter(p => p.is_best_seller).slice(0, 9);
  const showBS      = bestSellers.length > 0 ? bestSellers : prods.slice(0, 6);

  return (
    <div className="relative min-h-screen">
      <BannerSlider banners={banners} />

      {/* ── FAIRY LIGHTS DECORATION ── */}
      <FairyLights />

      {/* BEST SELLER */}
      {showBS.length > 0 && (
        <section style={{ padding:'24px 16px 16px' }}>
          <div style={{ marginBottom:'14px' }}>
            <h2 style={{ fontWeight:900, fontSize:'1.2rem', color:'#fff', letterSpacing:'0.02em' }}>
              🔥 BEST SELLER!
            </h2>
            <p style={{ fontSize:'0.8rem', marginTop:'3px', color:'#93c5fd' }}>
              Some of the most popular products right now.
            </p>
          </div>

          {/* 2-column grid, ~80px card height */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'11px' }}>
            {showBS.map(p => (
              <BestSellerCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Category chips */}
      {cats.length > 0 && (
        <section style={{ padding:'16px 16px 8px' }}>
          <CategoryFilter cats={cats} />
        </section>
      )}

      {/* Products per category */}
      <section style={{ padding:'0 16px 96px' }}>
        {cats.map(cat => {
          const catProds = prods.filter(p => p.category_id === cat.id);
          if (catProds.length === 0) return null;
          return (
            <div key={cat.id} id={`cat-${cat.slug}`} style={{ marginBottom:'32px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
                {catProds.map(p => (
                  <ProductCard key={p.id} product={{ ...p, category: p.categories }} />
                ))}
              </div>
            </div>
          );
        })}
        {prods.length === 0 && (
          <div style={{ textAlign:'center', paddingTop:'80px' }}>
            <p style={{ fontSize:'2.5rem', marginBottom:'8px' }}>🏪</p>
            <p style={{ fontWeight:600, color:'#93c5fd' }}>Belum ada produk</p>
          </div>
        )}
      </section>
    </div>
  );
}

/* Single hanging pendant light — tali + bohlam biru turun dari banner */
function FairyLights() {
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', paddingRight:'48px', position:'relative', height:'56px', overflow:'visible', pointerEvents:'none', userSelect:'none' }}>
      {/* Tali / kawat turun */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width:'1.5px', height:'36px', background:'linear-gradient(to bottom, rgba(29,111,255,0.6), rgba(29,111,255,0.9))' }} />
        {/* Bohlam bulat */}
        <div style={{
          width:'14px', height:'18px',
          borderRadius:'50% 50% 48% 48%',
          background:'radial-gradient(circle at 40% 35%, #7bb8ff 0%, #1d6fff 60%, #0a3fa0 100%)',
          boxShadow:'0 0 10px 4px rgba(29,111,255,0.65), 0 0 22px 8px rgba(29,111,255,0.3)',
          position:'relative',
        }}>
          {/* Highlight kecil di bohlam */}
          <div style={{ position:'absolute', top:'3px', left:'4px', width:'4px', height:'4px', borderRadius:'50%', background:'rgba(255,255,255,0.55)' }} />
        </div>
        {/* Ulir bawah bohlam */}
        <div style={{ width:'8px', height:'3px', background:'rgba(29,111,255,0.7)', borderRadius:'0 0 3px 3px' }} />
      </div>
    </div>
  );
}

/* Best Seller Card — slim horizontal, 80px height, glassmorphism */
function BestSellerCard({ product }) {
  return (
    <Link
      href={'/products/' + product.slug}
      style={{
        display:'flex', alignItems:'center', gap:'10px',
        textDecoration:'none', color:'inherit',
        position:'relative', overflow:'hidden',
        height:'62px',
        padding:'6px 8px',
        borderRadius:'12px',
        background:'linear-gradient(135deg, rgba(55,100,220,0.7) 0%, rgba(26,52,160,0.85) 100%)',
        border:'1px solid rgba(255,255,255,0.18)',
        backdropFilter:'blur(6px)',
        boxShadow:'0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
    >
      {/* Diagonal shimmer overlay */}
      <div aria-hidden='true' style={{
        position:'absolute', right:'-12px', top:'-20%',
        width:'50px', height:'180%',
        background:'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
        transform:'skewX(-20deg)', pointerEvents:'none',
      }} />
      <div aria-hidden='true' style={{
        position:'absolute', right:'28px', top:'-20%',
        width:'22px', height:'180%',
        background:'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        transform:'skewX(-20deg)', pointerEvents:'none',
      }} />

      {/* Top highlight line */}
      <div aria-hidden='true' style={{
        position:'absolute', top:0, left:0, right:0, height:'1px',
        background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.35) 60%, transparent 100%)',
        pointerEvents:'none',
      }} />
      {/* Icon — 50x50, rounded 10px */}
      <div style={{
        flexShrink:0, width:'38px', height:'38px',
        borderRadius:'8px', overflow:'hidden',
        border:'1.5px solid rgba(29,111,255,0.7)',
        background:'rgba(255,255,255,0.06)',
        position:'relative', zIndex:1,
      }}>
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        ) : (
          <div style={{
            width:'100%', height:'100%', display:'flex',
            alignItems:'center', justifyContent:'center',
            fontSize:'1.1rem', background:'rgba(29,111,255,0.18)',
          }}>
            {product.categories?.icon || '📦'}
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ flex:1, minWidth:0, position:'relative', zIndex:1 }}>
        <p style={{
          fontWeight:700, fontSize:'14px', color:'#fff',
          lineHeight:1.25, overflow:'hidden',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
        }}>
          {product.name}
        </p>
        <p style={{
          fontSize:'11px', marginTop:'3px', fontWeight:500,
          color:'#93c5fd', overflow:'hidden',
          whiteSpace:'nowrap', textOverflow:'ellipsis',
        }}>
          {product.publisher || product.categories?.name || ''}
        </p>
      </div>
    </Link>
  );
}