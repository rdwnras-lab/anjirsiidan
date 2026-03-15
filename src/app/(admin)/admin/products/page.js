import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

export const metadata = { title: 'Produk' };

export default async function ProductsPage() {
  const { data: products } = await supabaseAdmin.from('products')
    .select('*, categories(name), product_variants(id,price), product_keys(id,is_used)')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-extrabold">Produk</h1>
        <Link href="/admin/products/new" className="bg-accent hover:bg-accent-h text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">+ Tambah Produk</Link>
      </div>
      <div className="grid gap-3">
        {(products || []).map(p => {
          const stock = p.delivery_type === 'auto'
            ? p.product_keys?.filter(k => !k.is_used).length || 0
            : null;
          const minPrice = Math.min(...(p.product_variants?.map(v=>v.price) || [0]));
          return (
            <div key={p.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {p.thumbnail
                  ? <img src={p.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  : <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-xl">📦</div>
                }
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-xs text-muted">{p.categories?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${p.delivery_type==='auto' ? 'bg-accent/15 text-accent-light border-accent/20' : 'bg-white/5 text-dim border-border'}`}>
                      {p.delivery_type === 'auto' ? '⚡ Auto' : '👤 Manual'}
                    </span>
                    {stock !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${stock > 0 ? 'bg-success/15 text-success border-success/20' : 'bg-danger/15 text-danger border-danger/20'}`}>
                        {stock} stok
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/products/${p.id}/keys`} className="text-xs bg-gold/10 text-gold border border-gold/20 px-3 py-1.5 rounded-xl font-semibold hover:bg-gold/20 transition-colors">
                  🔑 Stok
                </Link>
                <Link href={`/admin/products/${p.id}`} className="text-xs bg-white/5 text-dim border border-border px-3 py-1.5 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  Edit
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
