'use client';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatIDR, calculateFee } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function ProductDetailClient({ product, variants, stockByVariant }) {
  const { data: session }   = useSession();
  const router               = useRouter();
  const [selected, setSelected] = useState(variants[0]?.id || null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const isAuto     = product.delivery_type === 'auto';
  const selVariant = variants.find(v => v.id === selected);
  const stock      = selected ? (stockByVariant[selected] ?? (isAuto ? 0 : 999)) : 0;
  const pricing    = selVariant ? calculateFee(selVariant.price) : null;
  const formFields = product.form_fields || [];

  const handleOrder = async () => {
    if (!selected) return setError('Pilih varian terlebih dahulu.');
    if (isAuto && !session) return signIn('discord');
    if (isAuto && stock === 0) return setError('Stok habis untuk varian ini.');

    // Validate form fields
    for (const field of formFields) {
      if (field.required && !formData[field.label]) {
        return setError(`${field.label} wajib diisi.`);
      }
    }

    setLoading(true); setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId:   product.id,
          variantId:   selected,
          formData,
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Image */}
        <div>
          <div className="aspect-square bg-surface rounded-2xl border border-border overflow-hidden">
            {product.thumbnail
              ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-6xl">{product.icon || '📦'}</div>
            }
          </div>
          {/* Delivery type notice */}
          <div className={`mt-4 rounded-xl p-3 text-sm border ${isAuto ? 'bg-accent/10 border-accent/20 text-accent-light' : 'bg-gold/10 border-gold/20 text-gold'}`}>
            {isAuto
              ? '⚡ Produk otomatis — dikirim via Discord DM + tampil di halaman pesanan setelah bayar. Wajib login Discord.'
              : '👤 Produk manual — admin akan memproses pesanan kamu dalam 1×24 jam.'}
          </div>
        </div>

        {/* Right: Info + Order */}
        <div>
          {product.categories && (
            <p className="text-xs text-accent-light font-semibold mb-2">{product.categories.name}</p>
          )}
          <h1 className="text-2xl font-extrabold mb-2">{product.name}</h1>
          {product.description && <p className="text-dim text-sm leading-relaxed mb-6">{product.description}</p>}

          {/* Variants */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3">Pilih Varian</p>
            <div className="grid grid-cols-2 gap-2">
              {variants.map(v => {
                const vStock  = stockByVariant[v.id] ?? (isAuto ? 0 : 999);
                const noStock = isAuto && vStock === 0;
                const { total } = calculateFee(v.price);
                return (
                  <button key={v.id} onClick={() => !noStock && setSelected(v.id)}
                    className={`border rounded-xl p-3 text-left transition-all ${
                      selected === v.id
                        ? 'border-accent bg-accent/10'
                        : noStock
                          ? 'border-border opacity-40 cursor-not-allowed'
                          : 'border-border hover:border-accent/40'
                    }`}>
                    <div className="text-sm font-semibold text-text">{v.name}</div>
                    <div className="text-accent-light font-bold text-sm mt-0.5">{formatIDR(total)}</div>
                    {isAuto && (
                      <div className={`text-xs mt-1 ${noStock ? 'text-danger' : 'text-success'}`}>
                        {noStock ? 'Stok habis' : `${vStock > 99 ? '99+' : vStock} tersedia`}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price breakdown */}
          {pricing && (
            <div className="bg-card border border-border rounded-xl p-4 mb-5 text-sm">
              <div className="flex justify-between text-dim mb-1"><span>Harga</span><span>{formatIDR(pricing.base)}</span></div>
              <div className="flex justify-between text-dim mb-2"><span>Biaya QRIS</span><span>+{formatIDR(pricing.fee)}</span></div>
              <div className="flex justify-between font-bold text-text border-t border-border pt-2"><span>Total Bayar</span><span className="text-accent-light">{formatIDR(pricing.total)}</span></div>
            </div>
          )}

          {/* Custom form fields */}
          {formFields.length > 0 && (
            <div className="space-y-3 mb-5">
              {formFields.map(field => (
                <div key={field.label}>
                  <label className="text-sm text-dim block mb-1">{field.label}{field.required && <span className="text-danger ml-1">*</span>}</label>
                  <input
                    className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-accent/50 transition-all"
                    placeholder={field.placeholder || field.label}
                    value={formData[field.label] || ''}
                    onChange={e => setFormData(f => ({...f, [field.label]: e.target.value}))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Manual: name + whatsapp */}
          {!isAuto && (
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-sm text-dim block mb-1">Nama <span className="text-danger">*</span></label>
                <input className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-accent/50 transition-all"
                  placeholder="Nama kamu" value={formData.name || ''} onChange={e => setFormData(f => ({...f, name: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm text-dim block mb-1">WhatsApp <span className="text-danger">*</span></label>
                <input className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-accent/50 transition-all"
                  placeholder="08xxxxxxxxxx" value={formData.whatsapp || ''} onChange={e => setFormData(f => ({...f, whatsapp: e.target.value}))} />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-danger mb-3">{error}</p>}

          {isAuto && !session && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-sm text-accent-light mb-4">
              Produk otomatis memerlukan login Discord untuk pengiriman. Klik tombol di bawah.
            </div>
          )}

          <Button
            size="lg" className="w-full justify-center"
            onClick={handleOrder} disabled={loading || (isAuto && stock === 0)}
          >
            {loading ? 'Memproses...' : isAuto && !session ? '🔐 Login Discord & Pesan' : 'Pesan Sekarang'}
          </Button>
        </div>
      </div>
    </div>
  );
}
