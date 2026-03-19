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
      id, name, slug, thumbnail, delivery_type, category_id, is_best_seller,
      categories(name, icon),
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
  const bestSellers = prods.filter(p => p.is_best_seller).slice(0, 6);
  const showBS      = bestSellers.length > 0 ? bestSellers : prods.slice(0, 4);

  return (
    <div className="relative min-h-screen">
      <BannerSlider banners={banners} />

      {/* ── BEST SELLER — layout seperti foto: image besar kiri, teks kanan ── */}
      {showBS.length > 0 && (
        <section className="px-4 pt-6 pb-4">
          <div className="mb-4">
            <h2 className="font-black text-xl text-white tracking-wide">🔥 BEST SELLER</h2>
            <p className="text-sm mt-1" style={{color:'var(--accent-light)', opacity:0.7}}>
              beberapa product populer saat ini
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {showBS.map(p => (
              <BestSellerCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Category chips */}
      {cats.length > 0 && (
        <section className="px-4 pt-4 pb-2">
          <CategoryFilter cats={cats} />
        </section>
      )}

      {/* Products per category — TANPA header nama/deskripsi kategori */}
      <section className="px-4 pb-24">
        {cats.map(cat => {
          const catProds = prods.filter(p => p.category_id === cat.id);
          if (catProds.length === 0) return null;
          return (
            <div key={cat.id} id={`cat-${cat.slug}`} className="mb-10">
              {/* Grid 3 kolom — NO header category */}
              <div className="grid grid-cols-3 gap-2">
                {catProds.map(p => (
                  <ProductCard
                    key={p.id}
                    product={{...p, category: p.categories}}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {prods.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-semibold text-dim">Belum ada produk</p>
          </div>
        )}
      </section>
    </div>
  );
}

// Best Seller card: image besar + teks, border biru saat ditekan
function BestSellerCard({ product }) {
  return (
    <Link href={`/products/${product.slug}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-200"
      style={{background:'var(--card-bg)', border:'1px solid #0e2445', textDecoration:'none', color:'inherit'}}>
      {/* Image besar di atas */}
      <div className="aspect-video relative overflow-hidden" style={{background:'#050f1e'}}>
        {product.thumbnail
          ? <img src={product.thumbnail} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-4xl"
              style={{background:'rgba(29,111,255,0.08)'}}>📦</div>
        }
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{background:'rgba(29,111,255,0.15)', border:'2px solid #1d6fff', borderRadius:'16px'}} />
      </div>
      {/* Teks di bawah */}
      <div className="p-2.5">
        <p className="font-bold text-xs text-white leading-tight line-clamp-2">{product.name}</p>
        <p className="text-xs mt-0.5" style={{color:'#60a5fa', opacity:0.7}}>
          {product.categories?.name || 'Product'}
        </p>
      </div>
    </Link>
  );
}
