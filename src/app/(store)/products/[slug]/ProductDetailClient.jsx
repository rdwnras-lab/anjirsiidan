'use client';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatIDR, calculateFee } from '@/lib/utils';

const tierDiscount = { platinum: 0.10, gold: 0.05, member: 0 };
const tierInfo = {
  platinum: { label: 'PLATINUM', color: '#e2e8f0', disc: '10% OFF' },
  gold:     { label: 'GOLD',     color: '#fbbf24', disc: '5% OFF' },
  member:   { label: 'MEMBER',   color: '#60a5fa', disc: 'Harga Normal' },
};

const IconBolt   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconHeadset = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>;
const IconGlobe  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconChevron = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconTag = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IconWallet = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

/* Step badge */
function StepBadge({ n }) {
  return (
    <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base"
      style={{ background: '#1d6fff' }}>
      {n}
    </div>
  );
}

/* Collapsible payment section */
function PaymentSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
        style={{ background: 'rgba(255,255,255,0.04)', color: '#fff' }}
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold text-sm">{title}</span>
        <IconChevron open={open} />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-2" style={{ background: 'rgba(0,0,0,0.15)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailClient({ product, variants, stockByVariant }) {
  const { data: session }       = useSession();
  const router                  = useRouter();
  const [selected, setSelected] = useState(variants[0]?.id || null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [waNumber, setWaNumber]   = useState('');
  const [payMethod, setPayMethod] = useState('');

  const tier       = (session?.user?.tier || 'member').toLowerCase();
  const isAuto     = product.delivery_type === 'auto';
  const disc       = tierDiscount[tier] || 0;
  const tInfo      = tierInfo[tier] || tierInfo.member;
  const formFields = product.form_fields || [];

  const selVariant      = variants.find(v => v.id === selected);
  const stock           = selected ? (stockByVariant[selected] ?? (isAuto ? 0 : 999)) : 0;
  const discountedPrice = selVariant ? Math.floor(selVariant.price * (1 - disc)) : 0;
  const pricing         = selVariant
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
    if (!isAuto && !formData.whatsapp && !waNumber) return setError('Nomor WhatsApp wajib diisi.');
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
          customerName: !isAuto ? (formData.name || session?.user?.name || '') : null,
          customerWhatsapp: !isAuto ? (waNumber || formData.whatsapp || '') : null,
          paymentMethod: payMethod || (isAuto ? 'qris' : 'manual'),
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

  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || '';

  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* ─── Banner + Icon overlay ─── */}
      <div className="relative" style={{ height: '200px' }}>
        {/* Banner background */}
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#091828' }}>
          {product.thumbnail && (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.55) blur(1px)', transform: 'scale(1.05)' }}
            />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0d1b30 0%, transparent 60%)' }} />
        </div>

        {/* Product icon + info — bottom left of banner */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end gap-3">
          <div className="rounded-2xl overflow-hidden flex-shrink-0"
            style={{ width: '80px', height: '80px', border: '2px solid rgba(255,165,0,0.5)', background: '#050f1e' }}>
            {product.thumbnail
              ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
            }
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-black text-white leading-tight">{product.name}</h1>
            <p className="text-sm font-bold mt-0.5" style={{ color: '#60a5fa' }}>
              {product.publisher || product.categories?.name || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Feature chips */}
      <div className="flex items-center gap-4 px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#fbbf24' }}>
          <IconBolt /> Fast Process
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#60a5fa' }}>
          <IconHeadset /> 24/7 Chat Support
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#34d399' }}>
          <IconGlobe /> Global Network
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="px-4 py-4 text-sm" style={{ color: '#94a3b8', lineHeight: '1.6' }}>
          {product.description}
        </div>
      )}

      <div className="px-4 space-y-6 mt-2">

        {/* ─── STEP 1: Account Information ─── */}
        {(formFields.length > 0 || !isAuto) && (
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <StepBadge n={1} />
              <span className="font-bold text-white text-base">Enter Your Account Information</span>
            </div>
            <div className="space-y-3">
              {formFields.map(field => (
                <div key={field.label}>
                  <label className="text-xs font-semibold text-white block mb-1.5">
                    {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f4ff' }}
                    placeholder={field.placeholder || field.label}
                    value={formData[field.label] || ''}
                    onChange={e => setFormData(f => ({ ...f, [field.label]: e.target.value }))}
                  />
                  {field.example && (
                    <p className="text-xs mt-1" style={{ color: '#64748b' }}>Contoh : {field.example}</p>
                  )}
                </div>
              ))}

              {/* Manual: name field optional, whatsapp in step 5 */}
              {!isAuto && formFields.length === 0 && (
                <div>
                  <input
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f4ff' }}
                    placeholder="Ketikan ID"
                    value={formData.game_id || ''}
                    onChange={e => setFormData(f => ({ ...f, game_id: e.target.value }))}
                  />
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>Contoh : 927375</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 2: Select Value ─── */}
        <div>
          <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <StepBadge n={formFields.length > 0 || !isAuto ? 2 : 1} />
            <span className="font-bold text-white text-base">Select Value</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {variants.map(v => {
              const vStock  = stockByVariant[v.id] ?? (isAuto ? 0 : 999);
              const noStock = isAuto && vStock === 0;
              const dPrice  = Math.floor(v.price * (1 - disc));
              const showPrice = isAuto ? calculateFee(dPrice).total : dPrice;
              return (
                <button key={v.id} onClick={() => !noStock && setSelected(v.id)}
                  className="rounded-xl p-3 text-left border transition-all"
                  style={{
                    borderColor: selected === v.id ? '#1d6fff' : 'rgba(255,255,255,0.08)',
                    background: selected === v.id ? 'rgba(29,111,255,0.12)' : 'rgba(255,255,255,0.03)',
                    opacity: noStock ? 0.4 : 1,
                    cursor: noStock ? 'not-allowed' : 'pointer',
                  }}>
                  <p className="text-sm font-bold text-white">{v.name}</p>
                  {disc > 0 && (
                    <p className="text-xs line-through mt-0.5" style={{ color: '#475569' }}>
                      {formatIDR(isAuto ? calculateFee(v.price).total : v.price)}
                    </p>
                  )}
                  <p className="font-black text-sm mt-0.5" style={{ color: '#60a5fa' }}>{formatIDR(showPrice)}</p>
                  {isAuto && (
                    <p className="text-xs mt-1" style={{ color: noStock ? '#ef4444' : '#10b981' }}>
                      {noStock ? 'Stok habis' : `${vStock > 99 ? '99+' : vStock} tersedia`}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Price summary */}
          {pricing && (
            <div className="rounded-xl p-4 mt-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {disc > 0 && (
                <div className="flex justify-between text-xs mb-1" style={{ color: '#475569' }}>
                  <span>Harga Normal</span>
                  <span className="line-through">{formatIDR(selVariant?.price || 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs mb-1" style={{ color: '#94a3b8' }}>
                <span>Harga {tInfo.label}</span>
                <span>{formatIDR(discountedPrice)}</span>
              </div>
              {isAuto && pricing.fee > 0 && (
                <div className="flex justify-between text-xs mb-2" style={{ color: '#94a3b8' }}>
                  <span>Biaya QRIS</span>
                  <span>+{formatIDR(pricing.fee)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: '#f1f5f9' }}>
                <span>Total Bayar</span>
                <span style={{ color: '#60a5fa' }}>{formatIDR(pricing.total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ─── STEP 3: Payment Method ─── */}
        <div>
          <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <StepBadge n={formFields.length > 0 || !isAuto ? 3 : 2} />
            <span className="font-bold text-white text-base">Select Payment Method</span>
          </div>

          {isAuto ? (
            /* Auto: QRIS only */
            <div>
              {/* Tokan Gaming Coin */}
              <div className="rounded-xl p-4 mb-2 relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', opacity: 0.6, cursor: 'not-allowed' }}>
                <div className="absolute top-0 right-0 px-3 py-1 font-black text-xs text-white"
                  style={{ background: '#1d6fff', borderRadius: '0 12px 0 12px' }}>BEST</div>
                <div className="flex items-center gap-3">
                  <IconWallet />
                  <div>
                    <p className="font-bold text-white text-sm">TOKAN GAMING COIN</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Login to view balance</p>
                  </div>
                </div>
              </div>

              {/* QRIS */}
              <button
                className="w-full rounded-xl p-4 text-left transition-all"
                style={{
                  background: payMethod === 'qris' ? 'rgba(29,111,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: payMethod === 'qris' ? '1px solid #1d6fff' : '1px solid rgba(255,255,255,0.07)',
                }}
                onClick={() => setPayMethod('qris')}
              >
                <p className="font-semibold text-white text-sm">QRIS</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Semua e-wallet & m-banking</p>
              </button>
            </div>
          ) : (
            /* Manual: multiple sections */
            <div className="space-y-2">
              {/* Tokan Gaming Coin */}
              <div className="rounded-xl p-4 relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', opacity: 0.6, cursor: 'not-allowed' }}>
                <div className="absolute top-0 right-0 px-3 py-1 font-black text-xs text-white"
                  style={{ background: '#1d6fff', borderRadius: '0 12px 0 12px' }}>BEST</div>
                <div className="flex items-center gap-3">
                  <IconWallet />
                  <div>
                    <p className="font-bold text-white text-sm">TOKAN GAMING COIN</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Login to view balance</p>
                  </div>
                </div>
              </div>

              <PaymentSection title="E-Wallet">
                <p className="text-xs py-2 text-center" style={{ color: '#64748b' }}>Segera hadir</p>
              </PaymentSection>

              <PaymentSection title="Virtual Account">
                <p className="text-xs py-2 text-center" style={{ color: '#64748b' }}>Segera hadir</p>
              </PaymentSection>

              <PaymentSection title="Convenience Store">
                <p className="text-xs py-2 text-center" style={{ color: '#64748b' }}>Segera hadir</p>
              </PaymentSection>

              <PaymentSection title="QRIS | E-Wallet | Bank Transfer" defaultOpen={true}>
                <button
                  className="w-full text-left rounded-xl p-3 mt-1 transition-all"
                  style={{
                    background: payMethod === 'manual_qr' ? 'rgba(29,111,255,0.12)' : 'rgba(255,255,255,0.06)',
                    border: payMethod === 'manual_qr' ? '1px solid #1d6fff' : '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={() => setPayMethod('manual_qr')}
                >
                  <p className="font-semibold text-white text-sm">DuitNow QR (Manual)</p>
                  <p className="text-xs italic mt-0.5" style={{ color: '#60a5fa' }}>Proses 1 - 10 Menit</p>
                </button>
              </PaymentSection>

              <PaymentSection title="Fiuu Payment">
                <p className="text-xs py-2 text-center" style={{ color: '#64748b' }}>Segera hadir</p>
              </PaymentSection>

              <PaymentSection title="Razorpay">
                <p className="text-xs py-2 text-center" style={{ color: '#64748b' }}>Segera hadir</p>
              </PaymentSection>
            </div>
          )}
        </div>

        {/* ─── STEP 4: Redeem Code ─── */}
        <div>
          <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <StepBadge n={formFields.length > 0 || !isAuto ? 4 : 3} />
            <span className="font-bold text-white text-base">Redeem Code</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-white block mb-2">Promo Code</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f4ff' }}
                placeholder="Enter your promo code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
              />
              <button
                className="px-5 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: '#1d6fff' }}
              >
                Use
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <IconTag />
              <p className="text-xs" style={{ color: '#64748b' }}>
                Follow us on Instagram and other social media for promo codes!
              </p>
            </div>
          </div>
        </div>

        {/* ─── STEP 5: Detail (WhatsApp) ─── */}
        <div>
          <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <StepBadge n={formFields.length > 0 || !isAuto ? 5 : 4} />
            <span className="font-bold text-white text-base">Detail</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-white block mb-2">No. WhatsApp</label>
            <div className="flex items-center rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center px-3 py-3 flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-lg">🇮🇩</span>
              </div>
              <input
                className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
                style={{ color: '#e8f4ff' }}
                placeholder="Masukkan Nomor WhatsApp Anda"
                value={waNumber}
                onChange={e => setWaNumber(e.target.value)}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: '#64748b' }}>
              **This number will be contacted if there is an issue**
            </p>
            <div className="flex items-start gap-2 mt-2 rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs mt-0.5" style={{ color: '#64748b' }}>ℹ</span>
              <p className="text-xs" style={{ color: '#64748b' }}>
                Transaction proof will be sent to the WhatsApp number you entered above.
              </p>
            </div>
          </div>
        </div>

        {/* Login notice (auto only) */}
        {!session && isAuto && (
          <div className="rounded-xl p-3 text-xs text-center"
            style={{ background: 'rgba(29,111,255,0.07)', border: '1px solid #1d4ed8', color: '#60a5fa' }}>
            Login Discord untuk harga GOLD/PLATINUM + proses otomatis
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* ─── Order Now ─── */}
        <button
          onClick={handleOrder}
          disabled={loading || (isAuto && stock === 0)}
          className="w-full py-4 rounded-2xl font-black text-base text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: loading || (isAuto && stock === 0) ? '#0e2445' : '#1d6fff' }}
        >
          🛒 {loading ? 'Memproses...' : isAuto && !session ? '🔐 Login Discord & Pesan' : 'Order Now!'}
        </button>

        {/* ─── Reviews ─── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1d6fff' }}>
              <IconStar />
            </div>
            <span className="font-bold text-white text-base">Reviews</span>
          </div>
          <div className="text-center py-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <IconStar />
              <span className="text-4xl font-black text-white">0</span>
              <span className="text-xl" style={{ color: '#64748b' }}>/5.0</span>
            </div>
            <p className="text-sm" style={{ color: '#64748b' }}>Belum ada ulasan untuk produk ini.</p>
          </div>
        </div>

      </div>
    </div>
  );
}