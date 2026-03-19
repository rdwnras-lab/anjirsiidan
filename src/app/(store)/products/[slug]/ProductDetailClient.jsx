'use client';
import { useState, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatIDR, calculateFee } from '@/lib/utils';

const tierDiscount = { platinum: 0.10, gold: 0.05, member: 0 };
const tierInfo = {
  platinum: { label: 'PLATINUM', color: '#e2e8f0', disc: '10% OFF' },
  gold:     { label: 'GOLD',     color: '#fbbf24', disc: '5% OFF' },
  member:   { label: 'MEMBER',   color: '#60a5fa', disc: 'Harga Normal' },
};

const IconBolt = () => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>;
const IconHeadset = () => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 18v-6a9 9 0 0 1 18 0v6'/><path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z'/><path d='M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'/></svg>;
const IconHeadsetLg = () => <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 18v-6a9 9 0 0 1 18 0v6'/><path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z'/><path d='M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'/></svg>;
const IconGlobe = () => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/></svg>;
const IconChevron = ({ open }) => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}><polyline points='6 9 12 15 18 9'/></svg>;
const IconDoc = () => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/></svg>;
const IconWallet = () => <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='2' y='5' width='20' height='14' rx='2'/><line x1='2' y1='10' x2='22' y2='10'/></svg>;
const IconBag = () => <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'/><line x1='3' y1='6' x2='21' y2='6'/><path d='M16 10a4 4 0 0 1-8 0'/></svg>;
const IconInfo = () => <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='12' y1='16' x2='12' y2='12'/><line x1='12' y1='8' x2='12.01' y2='8'/></svg>;
const IconX = () => <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>;

function StepBadge({ n }) {
  return (
    <div className='flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base'
      style={{ background: '#f59e0b' }}>
      {n}
    </div>
  );
}

function PaymentSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className='rounded-xl overflow-hidden' style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <button className='w-full flex items-center justify-between px-4 py-3.5 text-left'
        style={{ background: 'rgba(255,255,255,0.04)', color: '#fff' }}
        onClick={() => setOpen(o => !o)}>
        <span className='font-semibold text-sm'>{title}</span>
        <IconChevron open={open} />
      </button>
      {open && <div className='px-3 pb-3 pt-2' style={{ background: 'rgba(0,0,0,0.15)' }}>{children}</div>}
    </div>
  );
}

/* Info guide modal (bottom sheet) */
function GuideModal({ title, text, onClose }) {
  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/60' onClick={onClose} />
      <div className='fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 py-6'
        style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className='w-10 h-1 rounded-full mx-auto mb-5' style={{ background: 'rgba(255,255,255,0.2)' }} />
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-black text-white text-base'>{title}</h3>
          <button onClick={onClose} className='p-1' style={{ color: '#94a3b8' }}><IconX /></button>
        </div>
        <p className='text-sm leading-relaxed' style={{ color: '#cbd5e1' }}>{text}</p>
      </div>
    </>
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
  const [descOpen, setDescOpen]   = useState(true);
  const [guideModal, setGuideModal] = useState(null);

  const tier  = (session?.user?.tier || 'member').toLowerCase();
  const isAuto = product.delivery_type === 'auto';
  const disc   = tierDiscount[tier] || 0;
  const tInfo  = tierInfo[tier] || tierInfo.member;
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
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id, variantId: selected, formData,
          tierPrice: discountedPrice,
          customerName: !isAuto ? (formData.name || session?.user?.name || '') : null,
          customerWhatsapp: !isAuto ? (waNumber || '') : null,
          paymentMethod: payMethod || (isAuto ? 'qris' : 'manual'),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Gagal membuat pesanan');
      router.push(`/checkout/${data.orderId}`);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const stepBase = 1;
  const stepVal  = formFields.length > 0 ? 2 : 1;
  const stepPay  = stepVal + 1;

  return (
    <>
      {/* Guide modal */}
      {guideModal && <GuideModal title={guideModal.title} text={guideModal.text} onClose={() => setGuideModal(null)} />}

      <div className='max-w-2xl mx-auto pb-32'>

        {/* Banner + product overlay */}
        <div className='relative' style={{ height: '200px' }}>
          <div className='absolute inset-0 overflow-hidden' style={{ background: '#091828' }}>
            {product.thumbnail && (
              <img src={product.thumbnail} alt={product.name} className='w-full h-full object-cover'
                style={{ filter: 'brightness(0.5) blur(1px)', transform: 'scale(1.05)' }} />
            )}
            <div className='absolute inset-0' style={{ background: 'linear-gradient(to top, #0d1b30 0%, transparent 60%)' }} />
          </div>
          <div className='absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end gap-3'>
            <div className='rounded-2xl overflow-hidden flex-shrink-0'
              style={{ width:'80px', height:'80px', border:'2px solid rgba(255,165,0,0.5)', background:'#050f1e' }}>
              {product.thumbnail
                ? <img src={product.thumbnail} alt={product.name} className='w-full h-full object-cover' />
                : <div className='w-full h-full flex items-center justify-center text-3xl'>📦</div>
              }
            </div>
            <div className='pb-1'>
              <h1 className='text-xl font-black text-white leading-tight'>{product.name}</h1>
              <p className='text-sm font-bold mt-0.5' style={{ color: '#93c5fd' }}>
                {product.publisher || product.categories?.name || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Feature chips */}
        <div className='flex items-center gap-5 px-4 py-3' style={{ background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div className='flex items-center gap-1.5 text-xs font-semibold' style={{ color:'#fbbf24' }}><IconBolt /> Fast Process</div>
          <div className='flex items-center gap-1.5 text-xs font-semibold' style={{ color:'#60a5fa' }}><IconHeadset /> 24/7 Chat Support</div>
          <div className='flex items-center gap-1.5 text-xs font-semibold' style={{ color:'#34d399' }}><IconGlobe /> Global Network</div>
        </div>

        <div className='px-4 mt-4 space-y-5'>

          {/* Deskripsi collapsible */}
          {product.description && (
            <div className='rounded-2xl overflow-hidden' style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <button className='w-full flex items-center justify-between px-4 py-3.5'
                onClick={() => setDescOpen(o => !o)}>
                <div className='flex items-center gap-2 text-white font-semibold text-sm'>
                  <IconDoc /> Deskripsi
                </div>
                <IconChevron open={descOpen} />
              </button>
              {descOpen && (
                <div className='px-4 pb-4 text-sm leading-relaxed' style={{ color:'#94a3b8' }}>
                  {product.description}
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Account info */}
          {formFields.length > 0 && (
            <div>
              <div className='flex items-center gap-3 mb-4 pb-3' style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                <StepBadge n={stepBase} />
                <span className='font-bold text-white text-base'>Masukkan Data Akun</span>
                {formFields.some(f => f.guide) && (
                  <button className='ml-auto' style={{ color:'#93c5fd' }}
                    onClick={() => setGuideModal({ title: 'Panduan', text: formFields.find(f=>f.guide)?.guide || '' })}>
                    <IconInfo />
                  </button>
                )}
              </div>
              {/* Render as 2-col grid if even count, else single */}
              <div className={formFields.length >= 2 ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                {formFields.map(field => (
                  <div key={field.label}>
                    <div className='flex items-center gap-1 mb-1.5'>
                      <label className='text-xs font-semibold text-white'>
                        {field.label}{field.required && <span className='text-red-400 ml-0.5'>*</span>}
                      </label>
                      {field.guide && (
                        <button style={{ color:'#93c5fd' }} onClick={() => setGuideModal({ title: `Panduan ${field.label}`, text: field.guide })}>
                          <IconInfo />
                        </button>
                      )}
                    </div>
                    <input
                      className='w-full rounded-xl px-3 py-2.5 text-sm outline-none'
                      style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', color:'#e8f4ff' }}
                      placeholder={field.placeholder || field.label}
                      value={formData[field.label] || ''}
                      onChange={e => setFormData(f => ({ ...f, [field.label]: e.target.value }))}
                    />
                    {field.example && (
                      <p className='text-xs mt-1' style={{ color:'#64748b' }}>Contoh: {field.example}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Pilih Nominal */}
          <div>
            <div className='flex items-center gap-3 mb-4 pb-3' style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <StepBadge n={stepVal} />
              <span className='font-bold text-white text-base'>Pilih Nominal</span>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              {variants.map(v => {
                const vStock  = stockByVariant[v.id] ?? (isAuto ? 0 : 999);
                const noStock = isAuto && vStock === 0;
                const dPrice  = Math.floor(v.price * (1 - disc));
                const showPrice = isAuto ? calculateFee(dPrice).total : dPrice;
                return (
                  <button key={v.id} onClick={() => !noStock && setSelected(v.id)}
                    className='rounded-2xl p-3 text-left relative overflow-hidden transition-all'
                    style={{
                      borderWidth:'2px', borderStyle:'solid',
                      borderColor: selected === v.id ? '#1d6fff' : 'rgba(255,255,255,0.09)',
                      background: selected === v.id ? 'rgba(29,111,255,0.12)' : 'rgba(255,255,255,0.04)',
                      opacity: noStock ? 0.4 : 1,
                      cursor: noStock ? 'not-allowed' : 'pointer',
                    }}>
                    <p className='text-sm font-semibold text-white leading-tight mb-1'>{v.name}</p>
                    <p className='font-black text-lg text-white'>{formatIDR(showPrice)}</p>
                    {disc > 0 && (
                      <p className='text-xs line-through mt-0.5' style={{ color:'#475569' }}>
                        {formatIDR(isAuto ? calculateFee(v.price).total : v.price)}
                      </p>
                    )}
                    <div className='mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold'
                      style={{ background: isAuto ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                               color: isAuto ? '#10b981' : '#fbbf24',
                               border: isAuto ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)' }}>
                      {isAuto ? 'Pengiriman INSTAN' : 'Manual'}
                    </div>
                    {isAuto && noStock && <p className='text-xs text-red-400 mt-1'>Stok habis</p>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Pilih Pembayaran */}
          <div>
            <div className='flex items-center gap-3 mb-4 pb-3' style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <StepBadge n={stepPay} />
              <span className='font-bold text-white text-base'>Pilih Pembayaran</span>
            </div>
            <div className='space-y-2'>
              {/* Coin — disabled */}
              <div className='rounded-xl p-4 relative overflow-hidden flex items-center gap-3'
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', opacity:0.6 }}>
                <div className='absolute top-0 right-0 px-3 py-1 font-black text-xs text-white'
                  style={{ background:'#1d6fff', borderRadius:'0 12px 0 12px' }}>BEST</div>
                <IconWallet />
                <div>
                  <p className='font-bold text-white text-sm'>Credits</p>
                  <p className='text-xs' style={{ color:'#64748b' }}>Login to view balance</p>
                </div>
              </div>

              {isAuto ? (
                <button className='w-full rounded-xl p-4 text-left transition-all'
                  style={{
                    background: payMethod === 'qris' ? 'rgba(29,111,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: payMethod === 'qris' ? '1px solid #1d6fff' : '1px solid rgba(255,255,255,0.07)',
                  }}
                  onClick={() => setPayMethod('qris')}>
                  <p className='font-semibold text-white text-sm'>QRIS</p>
                  <p className='text-xs mt-0.5' style={{ color:'#64748b' }}>Semua e-wallet &amp; m-banking</p>
                </button>
              ) : (
                <>
                  <PaymentSection title='E-Wallet'>
                    <p className='text-xs py-2 text-center' style={{ color:'#64748b' }}>Segera hadir</p>
                  </PaymentSection>
                  <PaymentSection title='Virtual Account'>
                    <p className='text-xs py-2 text-center' style={{ color:'#64748b' }}>Segera hadir</p>
                  </PaymentSection>
                  <PaymentSection title='Convenience Store'>
                    <p className='text-xs py-2 text-center' style={{ color:'#64748b' }}>Segera hadir</p>
                  </PaymentSection>
                  <PaymentSection title='QRIS | E-Wallet | Bank Transfer' defaultOpen={true}>
                    <button className='w-full text-left rounded-xl p-3 mt-1 transition-all'
                      style={{
                        background: payMethod === 'manual_qr' ? 'rgba(29,111,255,0.12)' : 'rgba(255,255,255,0.06)',
                        border: payMethod === 'manual_qr' ? '1px solid #1d6fff' : '1px solid rgba(255,255,255,0.08)',
                      }}
                      onClick={() => setPayMethod('manual_qr')}>
                      <p className='font-semibold text-white text-sm'>DuitNow QR (Manual)</p>
                      <p className='text-xs italic mt-0.5' style={{ color:'#fbbf24' }}>Proses 1 - 10 Menit</p>
                    </button>
                  </PaymentSection>
                  <PaymentSection title='Fiuu Payment'>
                    <p className='text-xs py-2 text-center' style={{ color:'#64748b' }}>Segera hadir</p>
                  </PaymentSection>
                  <PaymentSection title='Razorpay'>
                    <p className='text-xs py-2 text-center' style={{ color:'#64748b' }}>Segera hadir</p>
                  </PaymentSection>
                </>
              )}
            </div>
          </div>

          {/* WhatsApp field */}
          <div>
            <div className='flex items-center gap-3 mb-4 pb-3' style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <StepBadge n={stepPay + 1} />
              <span className='font-bold text-white text-base'>Detail</span>
            </div>
            <label className='text-xs font-semibold text-white block mb-2'>No. WhatsApp</label>
            <div className='flex items-center rounded-xl overflow-hidden'
              style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div className='flex items-center px-3 py-3 flex-shrink-0'
                style={{ background:'rgba(255,255,255,0.05)', borderRight:'1px solid rgba(255,255,255,0.08)' }}>
                <span className='text-lg'>🇮🇩</span>
              </div>
              <input className='flex-1 px-3 py-3 text-sm outline-none bg-transparent'
                style={{ color:'#e8f4ff' }}
                placeholder='Masukkan Nomor WhatsApp Anda'
                value={waNumber} onChange={e => setWaNumber(e.target.value)} />
            </div>
            <p className='text-xs mt-1.5' style={{ color:'#64748b' }}>**This number will be contacted if there is an issue**</p>
          </div>

          {/* Promo code */}
          <div>
            <div className='flex items-center gap-3 mb-4 pb-3' style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <StepBadge n={stepPay + 2} />
              <span className='font-bold text-white text-base'>Redeem Code</span>
            </div>
            <div className='flex gap-2'>
              <input className='flex-1 rounded-xl px-4 py-3 text-sm outline-none'
                style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#e8f4ff' }}
                placeholder='Enter your promo code'
                value={promoCode} onChange={e => setPromoCode(e.target.value)} />
              <button className='px-5 py-3 rounded-xl font-bold text-white text-sm'
                style={{ background:'#1d6fff' }}>Use</button>
            </div>
          </div>

          {!session && isAuto && (
            <div className='rounded-xl p-3 text-xs text-center'
              style={{ background:'rgba(29,111,255,0.07)', border:'1px solid #1d4ed8', color:'#60a5fa' }}>
              Login Discord untuk harga GOLD/PLATINUM + proses otomatis
            </div>
          )}
          {error && <p className='text-sm text-red-400'>{error}</p>}

        </div>
      </div>

      {/* FLOATING STICKY ORDER BUTTON */}
      <div className='fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3'
        style={{ background:'linear-gradient(to top, rgba(13,27,48,0.98) 60%, transparent 100%)' }}>
        <div className='max-w-2xl mx-auto relative'>
          <button
            onClick={handleOrder}
            disabled={loading || (isAuto && stock === 0)}
            className='w-full py-4 rounded-2xl font-black text-base text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2'
            style={{ background: loading || (isAuto && stock === 0) ? '#1e3a5f' : '#1d6fff' }}>
            <IconBag />
            {loading ? 'Memproses...' : isAuto && !session ? 'Login Discord & Pesan' : 'Pesan Sekarang!'}
          </button>
          {/* CS icon on right */}
          <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'
            style={{ color:'rgba(255,255,255,0.6)' }}>
            <IconHeadsetLg />
          </div>
        </div>
      </div>
    </>
  );
}