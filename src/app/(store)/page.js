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

      {/* POPULAR SECTION */}
      {showBS.length > 0 && (
        <section className="px-4 pt-6 pb-4">
          <div className="mb-4">
            <h2 className="font-black text-xl text-white tracking-wide">POPULAR!</h2>
            <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
              Some of the most popular products right now.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {showBS.map(p => (
              <PopularCard key={p.id} product={p} />
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

      {/* Products per category */}
      <section className="px-4 pb-24">
        {cats.map(cat => {
          const catProds = prods.filter(p => p.category_id === cat.id);
          if (catProds.length === 0) return null;
          return (
            <div key={cat.id} id={`cat-${cat.slug}`} className="mb-10">
              <div className="grid grid-cols-3 gap-2">
                {catProds.map(p => (
                  <ProductCard
                    key={p.id}
                    product={{ ...p, category: p.categories }}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {prods.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-semibold" style={{ color: '#475569' }}>Belum ada produk</p>
          </div>
        )}
      </section>
    </div>
  );
}

function PopularCard({ product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex items-center gap-3 rounded-2xl p-3 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        className="flex-shrink-0 rounded-xl overflow-hidden"
        style={{ width: '56px', height: '56px', border: '2px solid rgba(245,158,11,0.5)' }}
      >
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl"
            style={{ background: 'rgba(29,111,255,0.12)' }}
          >
            {product.categories?.icon || '📦'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white leading-tight line-clamp-1">
          {product.name}
        </p>
        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#f59e0b' }}>
          {product.publisher || product.categories?.name || ''}
        </p>
      </div>
    </Link>
  );
}