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
      id, name, slug, description, thumbnail, delivery_type, category_id, is_best_seller,
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

      {/* Best Seller */}
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
              <Link key={p.id} href={`/products/${p.slug}`} className="bs-card">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{border:'1px solid #1d4ed8'}}>
                  {p.thumbnail
                    ? <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl" style={{background:'rgba(29,111,255,0.1)'}}>📦</div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-white line-clamp-2 leading-tight">{p.name}</p>
                  <p className="text-xs mt-0.5" style={{color:'var(--accent-light)', opacity:0.7}}>
                    {p.categories?.name || 'Product'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category filter chips */}
      {cats.length > 0 && (
        <section className="px-4 pt-4 pb-2">
          <CategoryFilter cats={cats} />
        </section>
      )}

      {/* Products — dikelompokkan per kategori, TIDAK dicampur */}
      <section className="px-4 pb-24">
        {cats.map(cat => {
          // Filter ketat: hanya produk milik kategori ini
          const catProds = prods.filter(p => p.category_id === cat.id);
          if (catProds.length === 0) return null;
          return (
            <div key={cat.id} id={`cat-${cat.slug}`} className="mb-10">
              <div className="flex items-center gap-2 mb-4 pt-2">
                <div>
                  <h2 className="font-bold text-base text-white uppercase">{cat.name}</h2>
                  {cat.description && (
                    <p className="text-xs uppercase" style={{color:'var(--accent-light)', opacity:0.6}}>
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>
              {/* Grid 3 kolom — HANYA produk kategori ini */}
              <div className="grid grid-cols-3 gap-2">
                {catProds.map(p => {
                  const stock = p.delivery_type === 'auto'
                    ? p.product_keys?.filter(k => !k.is_used).length
                    : undefined;
                  return (
                    <ProductCard
                      key={p.id}
                      product={{...p, category: p.categories}}
                      stockCount={stock}
                    />
                  );
                })}
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
