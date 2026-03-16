export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { formatIDR, calculateFee } from '@/lib/utils';

const tierDiscount = { platinum: 0.10, gold: 0.05, member: 0 };
const tierInfo = {
  platinum: { label: 'PLATINUM', color: '#e2e8f0' },
  gold:     { label: 'GOLD',     color: '#fbbf24' },
  member:   { label: 'MEMBER',   color: '#60a5fa' },
};

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  const tier    = (session?.user?.tier || 'member').toLowerCase();
  const disc    = tierDiscount[tier] || 0;
  const tInfo   = tierInfo[tier] || tierInfo.member;

  const { data: cats }  = await supabaseAdmin.from('categories').select('*').eq('is_active', true).order('sort_order');
  const { data: prods } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, thumbnail, delivery_type, category_id, categories(name), product_variants(id, name, price, sort_order)')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <div className="px-4 pb-24 pt-4 max-w-xl mx-auto">
      <h1 className="font-black text-xl text-white mb-1 tracking-wide">PRODUK</h1>

      {/* Tier badge */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs px-2.5 py-1 rounded-full font-black border"
          style={{color: tInfo.color, borderColor: tInfo.color, background: 'rgba(0,0,0,0.3)'}}>
          {tInfo.label}
        </span>
        <p className="text-xs" style={{color:'#7bafd4'}}>
          {disc > 0 ? `Kamu mendapat diskon ${disc*100}% untuk semua produk` : 'Login & belanja lebih banyak untuk diskon!'}
        </p>
      </div>

      {/* Harga per tier */}
      <div className="rounded-xl p-3 mb-5 grid grid-cols-3 gap-2" style={{background:'#091828', border:'1px solid #0e2445'}}>
        {Object.entries(tierInfo).map(([t, info]) => (
          <div key={t} className={`rounded-lg p-2 text-center ${t === tier ? 'ring-1' : ''}`}
            style={{background: t === tier ? 'rgba(29,111,255,0.1)' : 'transparent', ringColor: tInfo.color}}>
            <p className="text-xs font-black" style={{color: info.color}}>{info.label}</p>
            <p className="text-xs mt-0.5" style={{color:'#3d5a7a'}}>
              {tierDiscount[t] > 0 ? `-${tierDiscount[t]*100}%` : 'Normal'}
            </p>
          </div>
        ))}
      </div>

      {/* Products by category */}
      {(cats || []).map(cat => {
        const catProds = (prods || []).filter(p => p.category_id === cat.id);
        if (!catProds.length) return null;
        return (
          <div key={cat.id} className="mb-8">
            <h2 className="font-bold text-base text-white mb-3">{cat.name}</h2>
            <div className="flex flex-col gap-2">
              {catProds.map(p => {
                const sortedVars = [...(p.product_variants || [])].sort((a,b) => a.sort_order - b.sort_order);
                const minPrice = sortedVars.length ? Math.floor(sortedVars[0].price * (1 - disc)) : 0;
                const { total: minTotal } = calculateFee(minPrice);
                return (
                  <Link key={p.id} href={`/products/${p.slug}`}
                    className="rounded-2xl p-3 flex gap-3 transition-all"
                    style={{background:'#091828', border:'1px solid #0e2445', textDecoration:'none', color:'inherit'}}>
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{border:'1px solid #1d4ed8'}}>
                      {p.thumbnail
                        ? <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl" style={{background:'rgba(29,111,255,0.1)'}}>📦</div>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{p.name}</p>
                      <p className="text-xs mt-0.5" style={{color:'#7bafd4'}}>{p.categories?.name}</p>
                      {sortedVars.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sortedVars.slice(0, 3).map(v => {
                            const discPrice = Math.floor(v.price * (1 - disc));
                            const { total } = calculateFee(discPrice);
                            return (
                              <span key={v.id} className="text-xs px-2 py-0.5 rounded-full"
                                style={{background:'rgba(29,111,255,0.12)', color:'#60a5fa', border:'1px solid #1d4ed8'}}>
                                {v.name} — {formatIDR(total)}
                              </span>
                            );
                          })}
                          {sortedVars.length > 3 && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{color:'#3d5a7a'}}>
                              +{sortedVars.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3d5a7a" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {(!prods || prods.length === 0) && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-dim">Belum ada produk tersedia</p>
        </div>
      )}
    </div>
  );
}
