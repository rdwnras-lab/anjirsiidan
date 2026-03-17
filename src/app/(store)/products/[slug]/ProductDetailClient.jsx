'use client';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatIDR, calculateFee } from '@/lib/utils';

const tierDiscount = { platinum: 0.10, gold: 0.05, member: 0 };
const tierInfo = {
  platinum: { label:'PLATINUM', color:'#e2e8f0', disc:'10% OFF' },
  gold:     { label:'GOLD',     color:'#fbbf24', disc:'5% OFF' },
  member:   { label:'MEMBER',   color:'#60a5fa', disc:'Harga Normal' },
};

export default function ProductDetailClient({ product, variants, stockByVariant }) {
  const { data: session }       = useSession();
  const router                  = useRouter();
  const [selected, setSelected] = useState(variants[0]?.id || null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const tier       = (session?.user?.tier || 'member').toLowerCase();
  const isAuto     = product.delivery_type === 'auto';
  const disc       = tierDiscount[tier] || 0;
  const tInfo      = tierInfo[tier] || tierInfo.member;
  const formFields = product.form_fields || [];

  const selVariant = variants.find(v => v.id === selected);
  const stock      = selected ? (stockByVariant[selected] ?? (isAuto ? 0 : 999)) : 0;

  // Harga setelah diskon tier
  const discountedPrice = selVariant ? Math.floor(selVariant.price * (1 - disc)) : 0;
  // Fee hanya untuk auto (QRIS), manual tidak kena fee
  const pricing = selVariant
    ? isAuto
      ? calculateFee(discountedPrice)
      : { base: discountedPrice, fee: 0, total: discountedPrice }
    : null;

  const handleOrder = async () => {
    if (!selected) return setError('Pilih varian terlebih dahulu.');
    if (isAuto && !session) return signIn('discord');
    if (isAuto && stock === 0) return setError('Stok habis untuk varian ini.');
    for (const field of formFields) {
      if (field.required && !formData[field.label]) return setError(`${field.label} wajib diisi.`);
    }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selected,
          formData,
          tierPrice: discountedPrice,
          customerName: !isAuto ? (formData.name || '') : null,
          customerWhatsapp: !isAuto ? (formData.whatsapp || '') : null,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Gagal membuat pesanan');
      router.push(`/checkout/${data.orderId}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Product image */}
      <div className="aspect-video rounded-2xl overflow-hidden mb-5" style={{border:'1px solid #0e2445', background:'#091828'}}>
        {product.thumbnail
          ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
        }
      </div>

      {product.categories && <p className="text-xs font-bold mb-1" style={{color:'#60a5fa'}}>{product.categories.name}</p>}
      <h1 className="text-xl font-black text-white mb-2">{product.name}</h1>
      {product.description && <p className="text-sm mb-4" style={{color:'#7bafd4'}}>{product.description}</p>}

      {/* Tier badge */}
      <div className="rounded-xl p-3 mb-5 flex items-center gap-3" style={{background:'rgba(29,111,255,0.06)', border:'1px solid #0e2445'}}>
        <div className="flex-1">
          <p className="text-xs font-bold text-white">Harga kamu ({tInfo.label})</p>
          <p className="text-xs mt-0.5" style={{color:'#3d5a7a'}}>
            {disc > 0 ? `Kamu dapat diskon ${tInfo.disc}` : 'Belanja lebih banyak untuk dapatkan diskon!'}
          </p>
        </div>
        <span className="text-xs font-black px-2.5 py-1 rounded-full border" style={{color: tInfo.color, borderColor: tInfo.color}}>
          {tInfo.disc}
        </span>
      </div>

      {/* Variants */}
      <p className="text-sm font-bold text-white mb-3">Pilih Varian</p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {variants.map(v => {
          const vStock    = stockByVariant[v.id] ?? (isAuto ? 0 : 999);
          const noStock   = isAuto && vStock === 0;
          const dPrice    = Math.floor(v.price * (1 - disc));
          const showPrice = isAuto ? calculateFee(dPrice).total : dPrice;
          return (
            <button key={v.id} onClick={() => !noStock && setSelected(v.id)}
              className="rounded-xl p-3 text-left border transition-all"
              style={{
                borderColor: selected === v.id ? '#1d6fff' : '#0e2445',
                background: selected === v.id ? 'rgba(29,111,255,0.12)' : '#091828',
                opacity: noStock ? 0.4 : 1,
                cursor: noStock ? 'not-allowed' : 'pointer',
              }}>
              <p className="text-sm font-bold text-white">{v.name}</p>
              {disc > 0 && (
                <p className="text-xs line-through mt-0.5" style={{color:'#3d5a7a'}}>
                  {formatIDR(isAuto ? calculateFee(v.price).total : v.price)}
                </p>
              )}
              <p className="font-black text-sm mt-0.5" style={{color:'#60a5fa'}}>{formatIDR(showPrice)}</p>
              {isAuto && (
                <p className="text-xs mt-1" style={{color: noStock ? '#ef4444' : '#10b981'}}>
                  {noStock ? 'Stok habis' : `${vStock > 99 ? '99+' : vStock} tersedia`}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Price summary */}
      {pricing && (
        <div className="rounded-xl p-4 mb-5" style={{background:'#091828', border:'1px solid #0e2445'}}>
          {disc > 0 && (
            <div className="flex justify-between text-xs mb-1" style={{color:'#3d5a7a'}}>
              <span>Harga Normal</span>
              <span className="line-through">{formatIDR(selVariant?.price || 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs mb-1" style={{color:'#7bafd4'}}>
            <span>Harga {tInfo.label}</span>
            <span>{formatIDR(discountedPrice)}</span>
          </div>
          {isAuto && pricing.fee > 0 && (
            <div className="flex justify-between text-xs mb-2" style={{color:'#7bafd4'}}>
              <span>Biaya QRIS</span>
              <span>+{formatIDR(pricing.fee)}</span>
            </div>
          )}
          {!isAuto && (
            <div className="text-xs mb-2 px-2 py-1 rounded-lg text-center" style={{color:'#10b981', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)'}}>
              ✓ Produk manual tidak dikenakan biaya QRIS
            </div>
          )}
          <div className="flex justify-between font-black text-sm pt-2" style={{borderTop:'1px solid #0e2445', color:'#e8f4ff'}}>
            <span>Total Bayar</span>
            <span style={{color:'#60a5fa'}}>{formatIDR(pricing.total)}</span>
          </div>
        </div>
      )}

      {/* Custom form fields */}
      {formFields.length > 0 && (
        <div className="space-y-3 mb-5">
          {formFields.map(field => (
            <div key={field.label}>
              <label className="text-sm font-bold text-white block mb-1.5">
                {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <input
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                style={{background:'#091828', border:'1px solid #0e2445', color:'#e8f4ff'}}
                placeholder={field.placeholder || field.label}
                value={formData[field.label] || ''}
                onChange={e => setFormData(f => ({...f, [field.label]: e.target.value}))}
              />
            </div>
          ))}
        </div>
      )}

      {/* Manual fields */}
      {!isAuto && (
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-sm font-bold text-white block mb-1.5">Nama <span className="text-red-400">*</span></label>
            <input className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{background:'#091828', border:'1px solid #0e2445', color:'#e8f4ff'}}
              placeholder="Nama kamu" value={formData.name || ''}
              onChange={e => setFormData(f => ({...f, name: e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-bold text-white block mb-1.5">WhatsApp <span className="text-red-400">*</span></label>
            <input className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{background:'#091828', border:'1px solid #0e2445', color:'#e8f4ff'}}
              placeholder="08xxxxxxxxxx" value={formData.whatsapp || ''}
              onChange={e => setFormData(f => ({...f, whatsapp: e.target.value}))} />
          </div>
        </div>
      )}

      {/* Delivery notice */}
      <div className="rounded-xl p-3 mb-5 text-xs"
        style={{background: isAuto ? 'rgba(29,111,255,0.07)' : 'rgba(245,158,11,0.07)', border:`1px solid ${isAuto ? '#1d4ed8' : 'rgba(245,158,11,0.3)'}`}}>
        <span style={{color: isAuto ? '#60a5fa' : '#fbbf24'}}>
          {isAuto ? '⚡ Otomatis — dikirim via Discord DM setelah bayar. Wajib login Discord.' : '👤 Manual — admin proses dalam 1×24 jam.'}
        </span>
      </div>

      {!session && isAuto && (
        <div className="rounded-xl p-3 mb-4 text-xs text-center"
          style={{background:'rgba(29,111,255,0.07)', border:'1px solid #1d4ed8', color:'#60a5fa'}}>
          Login Discord untuk harga GOLD/PLATINUM + proses otomatis
        </div>
      )}

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      <button onClick={handleOrder}
        disabled={loading || (isAuto && stock === 0)}
        className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all disabled:opacity-40"
        style={{background: loading || (isAuto && stock === 0) ? '#0e2445' : '#1d6fff'}}>
        {loading ? 'Memproses...' : isAuto && !session ? '🔐 Login Discord & Pesan' : 'Pesan Sekarang'}
      </button>
    </div>
  );
}
