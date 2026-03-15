import { supabaseAdmin } from '@/lib/supabase';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';

async function getHomeData() {
  const { data: cats }  = await supabaseAdmin.from('categories').select('*').eq('is_active', true).order('sort_order');
  const { data: prods } = await supabaseAdmin.from('products').select(`
    id, name, slug, description, thumbnail, delivery_type, category_id,
    product_variants(id, price),
    product_keys(id, is_used)
  `).eq('is_active', true).order('sort_order').limit(12);
  return { cats: cats || [], prods: prods || [] };
}

export default async function HomePage() {
  const { cats, prods } = await getHomeData();
  const storeName   = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';
  const storeTagline = process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Top Up & Digital Products';

  return (
    <div className="relative">
      {/* Ambient orbs */}
      <div className="orb w-[600px] h-[600px] bg-accent/8 top-[-200px] left-[-200px]" />
      <div className="orb w-[400px] h-[400px] bg-purple-600/5 top-[300px] right-[-100px]" />

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 text-sm text-accent-light font-medium mb-6">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          Stok selalu update
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="text-gradient">{storeName}</span>
        </h1>
        <p className="text-dim text-lg max-w-lg mx-auto mb-8">{storeTagline}</p>
        <div className="flex gap-3 justify-center">
          <Link href="#products" className="bg-accent hover:bg-accent-h text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Lihat Produk
          </Link>
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`} target="_blank" rel="noreferrer"
             className="bg-white/5 hover:bg-white/10 border border-border text-dim font-semibold px-6 py-3 rounded-xl transition-colors">
            Hubungi Kami
          </a>
        </div>
      </section>

      {/* Categories */}
      {cats.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mb-10">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            <Link href="#products"
              className="flex-shrink-0 bg-card border border-border hover:border-accent/40 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors">
              Semua
            </Link>
            {cats.map(c => (
              <Link key={c.id} href={`#cat-${c.slug}`}
                className="flex-shrink-0 bg-card border border-border hover:border-accent/40 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors flex items-center gap-2">
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products by category */}
      <section id="products" className="max-w-6xl mx-auto px-4 pb-16">
        {cats.map(cat => {
          const catProds = prods.filter(p => p.category_id === cat.id);
          if (!catProds.length) return null;
          return (
            <div key={cat.id} id={`cat-${cat.slug}`} className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <h2 className="text-xl font-bold">{cat.name}</h2>
                  {cat.description && <p className="text-sm text-muted">{cat.description}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {catProds.map(p => {
                  const stock = p.delivery_type === 'auto'
                    ? p.product_keys?.filter(k => !k.is_used).length
                    : undefined;
                  return <ProductCard key={p.id} product={p} stockCount={stock} />;
                })}
              </div>
            </div>
          );
        })}
        {prods.length === 0 && (
          <div className="text-center py-20 text-muted">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-semibold">Belum ada produk</p>
          </div>
        )}
      </section>
    </div>
  );
}
