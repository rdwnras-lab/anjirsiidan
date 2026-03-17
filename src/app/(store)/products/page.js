export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { formatIDR, calculateFee } from '@/lib/utils';

const tierDiscount = { platinum: 0.10, gold: 0.05, member: 0 };
const tierInfo = {
  platinum: { label:'PLATINUM', color:'#e2e8f0', border:'rgba(226,232,240,0.3)' },
  gold:     { label:'GOLD',     color:'#fbbf24', border:'rgba(251,191,36,0.3)' },
  member:   { label:'MEMBER',   color:'#60a5fa', border:'rgba(96,165,250,0.3)' },
};

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  const tier    = (session?.user?.tier || 'member').toLowerCase();
  const disc    = tierDiscount[tier] || 0;
  const tInfo   = tierInfo[tier] || tierInfo.member;

  const { data: cats }  = await supabaseAdmin.from('categories').select('*').eq('is_active', true).order('sort_order');
  const { data: prods } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, thumbnail, delivery_type, category_id, categories(name, slug), product_variants(id, name, price, sort_order)')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <div className="px-4 pb-24 pt-4 max-w-xl mx-auto">
      <h1 className="font-black text-xl text-white mb-1 tracking-wide">DAFTAR LAYANAN</h1>
      <p className="text-xs mb-5" style={{color:'#7bafd4'}}>Pilih produk untuk melihat daftar harga</p>

      {/* Harga kamu saat ini */}
      <div className="rounded-2xl p-4 mb-5" style={{border:`1px solid ${tInfo.border}`, background:'rgba(0,0,0,0.2)'}}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">Harga Berlaku Untukmu</p>
          <span className="text-xs font-black px-2.5 py-1 rounded-full border"
            style={{color: tInfo.color, borderColor: tInfo.border}}>
            {tInfo.label}
          </span>
        </div>
        {/* Tabel harga per tier */}
        <div className="rounded-xl overflow-hidden" style={{border:'1px solid #0e2445'}}>
          <div className="grid grid-cols-3 text-xs font-bold uppercase" style={{background:'#050f1e', borderBottom:'1px solid #0e2445'}}>
            <div className="px-3 py-2" style={{color:'#3d5a7a'}}>TIER</div>
            <div className="px-3 py-2 text-center" style={{color:'#3d5a7a'}}>DISKON</div>
            <div className="px-3 py-2 text-right" style={{color:'#3d5a7a'}}>STATUS</div>
          </div>
          {Object.entries(tierInfo).map(([t, info]) => (
            <div key={t} className="grid grid-cols-3 text-xs border-t items-center"
              style={{borderColor:'#0e2445', background: t === tier ? 'rgba(29,111,255,0.06)' : 'transparent'}}>
              <div className="px-3 py-2.5 font-bold" style={{color: info.color}}>{info.label}</div>
              <div className="px-3 py-2.5 text-center font-bold" style={{color: tierDiscount[t] > 0 ? '#10b981' : '#3d5a7a'}}>
                {tierDiscount[t] > 0 ? `-${tierDiscount[t]*100}%` : 'Normal'}
              </div>
              <div className="px-3 py-2.5 text-right">
                {t === tier
                  ? <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:'rgba(16,185,129,0.15)', color:'#10b981', border:'1px solid rgba(16,185,129,0.3)'}}>Aktif</span>
                  : <span className="text-xs" style={{color:'#3d5a7a'}}>{tierDiscount[t] > Math.max(...Object.values(tierDiscount).filter(d => d <= disc)) ? 'Upgrade' : '—'}</span>
                }
              </div>
            </div>
          ))}
        </div>
        {disc === 0 && (
          <p className="text-xs mt-2 text-center" style={{color:'#3d5a7a'}}>
            Belanja lebih banyak → upgrade tier → dapat diskon lebih besar!
          </p>
        )}
      </div>

      {/* Products by category - table style */}
      {(cats || []).map(cat => {
        const catProds = (prods || []).filter(p => p.category_id === cat.id);
        if (!catProds.length) return null;
        return (
          <div key={cat.id} className="mb-6">
            <h2 className="font-bold text-base text-white mb-3">{cat.name}</h2>
            <div className="rounded-2xl overflow-hidden" style={{border:'1px solid #0e2445', background:'#091828'}}>
              {catProds.map((p, idx) => {
                const sortedVars = [...(p.product_variants || [])].sort((a,b) => a.sort_order - b.sort_order);
                if (sortedVars.length === 0) return (
                  <Link key={p.id} href={`/products/${p.slug}`}
                    className="flex items-center gap-3 px-4 py-3 transition-all hover:opacity-80"
                    style={{borderTop: idx > 0 ? '1px solid #0e2445' : 'none', textDecoration:'none', color:'inherit'}}>
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{border:'1px solid #1d4ed8'}}>
                      {p.thumbnail
                        ? <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg" style={{background:'rgba(29,111,255,0.1)'}}>📦</div>
                      }
                    </div>
                    <p className="flex-1 font-semibold text-sm text-white">{p.name}</p>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d5a7a" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                );
                // Show all variants with prices
                return (
                  <div key={p.id} style={{borderTop: idx > 0 ? '1px solid #0e2445' : 'none'}}>
                    {/* Product header */}
                    <div className="flex items-center gap-3 px-4 py-3" style={{background:'rgba(29,111,255,0.04)', borderBottom:'1px solid #0e2445'}}>
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{border:'1px solid #1d4ed8'}}>
                        {p.thumbnail
                          ? <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg" style={{background:'rgba(29,111,255,0.1)'}}>📦</div>
                        }
                      </div>
                      <p className="font-bold text-sm text-white flex-1">{p.name}</p>
                    </div>
                    {/* Variants table header */}
                    <div className="grid text-xs font-bold uppercase px-4 py-2" style={{gridTemplateColumns:'1fr repeat(3, 80px)', borderBottom:'1px solid #0e2445', color:'#3d5a7a', background:'#050f1e'}}>
                      <div>NAMA PRODUK</div>
                      <div className="text-right" style={{color:'#60a5fa'}}>MEMBER</div>
                      <div className="text-right" style={{color:'#fbbf24'}}>GOLD</div>
                      <div className="text-right" style={{color:'#e2e8f0'}}>PLATINUM</div>
                    </div>
                    {/* Variant rows */}
                    {sortedVars.map((v, vi) => {
                      const memberPrice   = calculateFee(v.price).total;
                      const goldPrice     = calculateFee(Math.floor(v.price * 0.95)).total;
                      const platinumPrice = calculateFee(Math.floor(v.price * 0.90)).total;
                      return (
                        <Link key={v.id} href={`/products/${p.slug}`}
                          className="grid px-4 py-3 text-xs items-center hover:opacity-80 transition-all"
                          style={{gridTemplateColumns:'1fr repeat(3, 80px)', borderTop: vi > 0 ? '1px solid #0e2445' : 'none', textDecoration:'none', color:'inherit', background: tier === 'member' ? 'transparent' : tier === 'gold' ? 'rgba(245,158,11,0.02)' : 'rgba(226,232,240,0.02)'}}>
                          <div className="font-medium text-white pr-2">{v.name}</div>
                          <div className={`text-right font-bold ${tier === 'member' ? 'text-white' : ''}`} style={{color: tier === 'member' ? '#60a5fa' : '#3d5a7a'}}>
                            {formatIDR(memberPrice)}
                          </div>
                          <div className="text-right font-bold" style={{color: tier === 'gold' ? '#fbbf24' : '#3d5a7a'}}>
                            {formatIDR(goldPrice)}
                          </div>
                          <div className="text-right font-bold" style={{color: tier === 'platinum' ? '#e2e8f0' : '#3d5a7a'}}>
                            {formatIDR(platinumPrice)}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {(!prods || prods.length === 0) && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📦</p>
          <p style={{color:'#3d5a7a'}}>Belum ada produk</p>
        </div>
      )}
    </div>
  );
}
