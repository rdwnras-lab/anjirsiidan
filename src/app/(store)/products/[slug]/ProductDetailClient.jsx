'use client';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatIDR, calculateFee } from '@/lib/utils';

const tierDiscount = { platinum:0.10, gold:0.05, member:0 };
const tierInfo = {
  platinum:{ label:'PLATINUM', color:'#e2e8f0', disc:'10% OFF' },
  gold:    { label:'GOLD',     color:'#fbbf24', disc:'5% OFF' },
  member:  { label:'MEMBER',   color:'#60a5fa', disc:'Harga Normal' },
};

/* ── Icons ── */
const IBolt   = () => <svg width='12' height='12' viewBox='0 0 24 24' fill='currentColor'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>;
const IHS     = () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 18v-6a9 9 0 0 1 18 0v6'/><path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z'/><path d='M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'/></svg>;
const IHSLg   = () => <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{opacity:0.75}}><path d='M3 18v-6a9 9 0 0 1 18 0v6'/><path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z'/><path d='M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'/></svg>;
const IGlobe  = () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/></svg>;
const IDoc    = () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/></svg>;
const IChev   = ({open}) => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' style={{transform:open?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s'}}><polyline points='6 9 12 15 18 9'/></svg>;
const IInfo   = () => <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='12' y1='16' x2='12' y2='12'/><line x1='12' y1='8' x2='12.01' y2='8'/></svg>;
const IWallet = () => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='2' y='5' width='20' height='14' rx='2'/><line x1='2' y1='10' x2='22' y2='10'/></svg>;
const IBag    = () => <svg width='19' height='19' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'/><line x1='3' y1='6' x2='21' y2='6'/><path d='M16 10a4 4 0 0 1-8 0'/></svg>;
const IX      = () => <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>;

/* ─── Step section header: [num badge] | divider | title ─── */
function StepRow({ n, title, children }) {
  return (
    <div className='rounded-2xl overflow-hidden' style={{ border:'1px solid rgba(255,255,255,0.09)', background:'rgba(255,255,255,0.04)' }}>
      {/* header strip */}
      <div className='flex items-stretch' style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        {/* number badge */}
        <div className='flex items-center justify-center font-black text-white text-base'
          style={{ minWidth:'52px', background:'#1d6fff', borderRadius:'0' }}>
          {n}
        </div>
        {/* divider line */}
        <div style={{ width:'3px', background:'rgba(29,111,255,0.35)' }} />
        {/* title */}
        <div className='flex items-center px-4 py-3.5'>
          <span className='font-bold text-white text-base'>{title}</span>
        </div>
      </div>
      {/* content */}
      <div className='p-4'>{children}</div>
    </div>
  );
}

/* ─── Guide bottom sheet ─── */
function GuideModal({ title, text, onClose }) {
  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/60' onClick={onClose} />
      <div className='fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 py-6'
        style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.1)' }}>
        <div className='w-10 h-1 rounded-full mx-auto mb-5' style={{ background:'rgba(255,255,255,0.25)' }} />
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-black text-white text-base'>{title}</h3>
          <button onClick={onClose} style={{ color:'#94a3b8' }}><IX /></button>
        </div>
        <p className='text-sm leading-relaxed' style={{ color:'#cbd5e1' }}>{text}</p>
      </div>
    </>
  );
}

/* ─── Collapsible payment option ─── */
function PayOpt({ label, subtitle, value, payMethod, setPayMethod, disabled, children, noSelect }) {
  const [open, setOpen] = useState(false);
  const sel = noSelect
    ? (payMethod === value + '_auto' || payMethod === value + '_manual')
    : payMethod === value;
  const handleClick = () => {
    if (disabled) return;
    if (!noSelect) setPayMethod(value);
    setOpen(o => !o);
  };
  return (
    <div className='rounded-xl overflow-hidden' style={{
      border: sel ? '1.5px solid #1d6fff' : '1.5px solid rgba(255,255,255,0.09)',
      opacity: disabled ? 0.38 : 1,
    }}>
      <button className='w-full flex items-center justify-between px-4 py-3.5 text-left'
        style={{ background: sel ? 'rgba(29,111,255,0.08)' : 'rgba(255,255,255,0.04)', cursor: disabled ? 'not-allowed' : 'pointer' }}
        onClick={handleClick}>
        <div>
          <p className='font-semibold text-white text-sm'>{label}</p>
          {subtitle && <p className='text-xs mt-0.5' style={{ color:'#64748b' }}>{subtitle}</p>}
        </div>
        {!disabled && <IChev open={open} />}
      </button>
      {open && children && (
        <div className='px-4 pb-4 pt-2' style={{ background:'rgba(0,0,0,0.2)', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─── */
export default function ProductDetailClient({ product, variants, stockByVariant }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selected,  setSelected]  = useState(null);
  const [formData,  setFormData]  = useState({});
  const [waNumber,  setWaNumber]  = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [descOpen,  setDescOpen]  = useState(false);
  const [guideModal,setGuideModal]= useState(null);

  const tier    = (session?.user?.tier || 'member').toLowerCase();
  const isAuto  = product.delivery_type === 'auto';
  const disc    = tierDiscount[tier] || 0;
  const formFields = product.form_fields || [];

  const selVariant = variants.find(v => v.id === selected);
  const stock      = selected ? (stockByVariant[selected] ?? (isAuto ? 0 : 999)) : 0;
  const discPrc    = selVariant ? Math.floor(selVariant.price * (1 - disc)) : 0;
  const pricing    = selVariant ? (isAuto ? calculateFee(discPrc) : { base:discPrc, fee:0, total:discPrc }) : null;

  const step1 = formFields.length > 0 ? 1 : null;
  const step2 = step1 ? 2 : 1;
  const step3 = step2 + 1;
  const step4 = step3 + 1;

  const handleOrder = async () => {
    if (!selected) return setError('Pilih nominal terlebih dahulu.');
    if (isAuto && !session) return signIn('discord');
    if (isAuto && stock === 0) return setError('Stok habis.');
    for (const f of formFields) {
      if (f.required && !formData[f.label]) return setError(f.label + ' wajib diisi.');
    }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/orders', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ productId:product.id, variantId:selected, formData,
          tierPrice:discPrc, customerName:!isAuto?(session?.user?.name||''):null,
          customerWhatsapp:!isAuto?waNumber:null, paymentMethod: payMethod === 'qris_auto' || payMethod === 'qris_manual' ? 'qris' : payMethod }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Gagal membuat pesanan');
      router.push('/checkout/' + data.orderId);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      {guideModal && <GuideModal title={guideModal.title} text={guideModal.text} onClose={() => setGuideModal(null)} />}
      <div className='max-w-2xl mx-auto pb-36'>

        {/* ── BANNER ── */}
        <div className='relative' style={{ height:'200px' }}>
          <div className='absolute inset-0 overflow-hidden' style={{ background:'#091828' }}>
            {product.thumbnail && (
              <img src={product.thumbnail} alt={product.name} className='w-full h-full object-cover'
                style={{ filter:'brightness(0.45) blur(1px)', transform:'scale(1.06)' }} />
            )}
            <div className='absolute inset-0' style={{ background:'linear-gradient(to top, #0d1b30 0%, transparent 60%)' }} />
          </div>
          <div className='absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end gap-3'>
            <div className='rounded-2xl overflow-hidden flex-shrink-0'
              style={{ width:'80px', height:'80px', border:'2px solid rgba(29,111,255,0.5)', background:'#050f1e' }}>
              {product.thumbnail
                ? <img src={product.thumbnail} alt={product.name} className='w-full h-full object-cover' />
                : <div className='w-full h-full flex items-center justify-center text-3xl'>📦</div>
              }
            </div>
            <div className='pb-1'>
              <h1 className='text-xl font-black text-white leading-tight'>{product.name}</h1>
              <p className='text-sm font-bold mt-0.5' style={{ color:'#93c5fd' }}>
                {product.publisher || product.categories?.name || ''}
              </p>
            </div>
          </div>
        </div>

        {/* ── Feature chips ── */}
        <div className='flex items-center gap-5 px-4 py-3' style={{ background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div className='flex items-center gap-1.5 text-xs font-semibold' style={{ color:'#fbbf24' }}><IBolt /> Fast Process</div>
          <div className='flex items-center gap-1.5 text-xs font-semibold' style={{ color:'#60a5fa' }}><IHS /> 24/7 Chat Support</div>
          <div className='flex items-center gap-1.5 text-xs font-semibold' style={{ color:'#34d399' }}><IGlobe /> Global Network</div>
        </div>

        <div className='px-4 mt-4 space-y-4'>

          {/* ── Deskripsi ── */}
          {product.description && (
            <div className='rounded-2xl overflow-hidden' style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <button className='w-full flex items-center justify-between px-4 py-3.5' onClick={() => setDescOpen(o => !o)}>
                <div className='flex items-center gap-2 text-white font-semibold text-sm'><IDoc /> Deskripsi</div>
                <IChev open={descOpen} />
              </button>
              {descOpen && <div className='px-4 pb-4 text-sm leading-relaxed' style={{ color:'#94a3b8' }}>{product.description}</div>}
            </div>
          )}

          {/* ── STEP 1: Data Akun (kondisional) ── */}
          {step1 && (
            <StepRow n={step1} title='Masukkan Data Akun'>
              {formFields.some(f => f.guide) && (
                <div className='flex justify-end mb-3'>
                  <button className='flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full'
                    style={{ background:'rgba(29,111,255,0.15)', color:'#93c5fd', border:'1px solid rgba(29,111,255,0.3)' }}
                    onClick={() => { const f=formFields.find(x=>x.guide); if(f) setGuideModal({ title:'Panduan '+f.label, text:f.guide }); }}>
                    <IInfo /> Panduan</button>
                </div>
              )}
              <div className={formFields.length >= 2 ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                {formFields.map(field => (
                  <div key={field.label}>
                    <div className='flex items-center gap-1 mb-1.5'>
                      <label className='text-xs font-semibold text-white'>
                        {field.label}{field.required && <span className='text-red-400 ml-0.5'>*</span>}
                      </label>
                      {field.guide && (
                        <button style={{ color:'#93c5fd' }} onClick={() => setGuideModal({ title:'Panduan '+field.label, text:field.guide })}><IInfo /></button>
                      )}
                    </div>
                    <input className='w-full rounded-xl px-3 py-2.5 text-sm outline-none'
                      style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', color:'#e8f4ff' }}
                      placeholder={field.placeholder || field.label}
                      value={formData[field.label] || ''}
                      onChange={e => setFormData(f => ({ ...f, [field.label]: e.target.value }))} />
                    {field.example && <p className='text-xs mt-1' style={{ color:'#64748b' }}>Contoh: {field.example}</p>}
                  </div>
                ))}
              </div>
            </StepRow>
          )}

          {/* ── STEP 2: Pilih Nominal ── */}
          <StepRow n={step2} title='Pilih Nominal'>
            <div className='grid grid-cols-2 gap-3'>
              {variants.map(v => {
                const vStock  = stockByVariant[v.id] ?? (isAuto ? 0 : 999);
                const noStock = isAuto && vStock === 0;
                const dPrice  = Math.floor(v.price * (1 - disc));
                const showPrc = isAuto ? calculateFee(dPrice).total : dPrice;
                const isAct   = selected === v.id;
                return (
                  <button key={v.id} onClick={() => !noStock && setSelected(v.id)}
                    className='rounded-2xl text-left relative transition-all overflow-hidden flex flex-col'
                    style={{
                      borderWidth:'2px', borderStyle:'solid',
                      borderColor: isAct ? '#1d6fff' : 'rgba(255,255,255,0.1)',
                      background: isAct ? 'rgba(29,111,255,0.1)' : 'rgba(255,255,255,0.04)',
                      opacity: noStock ? 0.45 : 1,
                      cursor: noStock ? 'not-allowed' : 'pointer',
                    }}>
                    {/* Top: name */}
                    <div className='px-3 pt-3 pb-2'>
                      <p className='font-bold text-white text-sm leading-tight'>{v.name}</p>
                    </div>
                    {/* Divider */}
                    <div style={{ height:'1px', background:'rgba(255,255,255,0.1)', margin:'0 12px' }} />
                    {/* Middle: price */}
                    <div className='px-3 py-2'>
                      <p className='font-semibold text-sm' style={{ color:'rgba(255,255,255,0.8)' }}>{formatIDR(showPrc)}</p>
                    </div>
                    {/* Bottom: INSTAN badge */}
                    <div className='px-3 pb-3 flex justify-end'>
                      <div className='inline-flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5'
                        style={{ background:'#fff', minWidth:'70px' }}>
                        <p style={{ fontSize:'0.55rem', color:'#6b7280', fontWeight:400, lineHeight:1.2 }}>Pengiriman</p>
                        <p style={{ fontSize:'0.65rem', color:'#111827', fontWeight:800, letterSpacing:'0.02em', lineHeight:1.2 }}>INSTAN</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* price summary */}
            {pricing && (
              <div className='mt-3 rounded-xl p-3 flex justify-between items-center'
                style={{ background:'rgba(29,111,255,0.08)', border:'1px solid rgba(29,111,255,0.2)' }}>
                <span className='text-xs' style={{ color:'#93c5fd' }}>{selVariant?.name}</span>
                <span className='font-black text-sm text-white'>{formatIDR(pricing.total)}</span>
              </div>
            )}
          </StepRow>

          {/* ── STEP 3: Pilih Pembayaran ── */}
          <StepRow n={step3} title='Pilih Pembayaran'>
            <div className='space-y-2'>
              {/* Credits — always disabled */}
              <div className='rounded-xl p-4 flex items-center gap-3 relative overflow-hidden'
                style={{ background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.09)', opacity:0.45, cursor:'not-allowed' }}>
                <div className='absolute top-0 right-0 font-black text-xs text-white px-2.5 py-1'
                  style={{ background:'#1d6fff', borderRadius:'0 10px 0 10px', fontSize:'0.6rem' }}>BEST</div>
                <IWallet />
                <div>
                  <p className='font-bold text-white text-sm'>Credits</p>
                  <p className='text-xs' style={{ color:'#64748b' }}>Login to view balance</p>
                </div>
              </div>

              {/* QRIS dropdown */}
              <PayOpt label='QRIS'
                subtitle='Pilih metode QRIS'
                value='qris' payMethod={payMethod} setPayMethod={setPayMethod}
                disabled={false} noSelect={true}>
                <div className='grid grid-cols-2 gap-2 mt-1'>
                  {/* QRIS OTOMATIS — hanya aktif jika isAuto */}
                  <button
                    onClick={() => isAuto && setPayMethod('qris_auto')}
                    className='flex flex-col items-start p-3 rounded-xl transition-all'
                    style={{
                      background: payMethod==='qris_auto' ? 'rgba(29,111,255,0.15)' : 'rgba(255,255,255,0.05)',
                      border: payMethod==='qris_auto' ? '1.5px solid #1d6fff' : '1.5px solid rgba(255,255,255,0.08)',
                      opacity: !isAuto ? 0.38 : 1,
                      cursor: !isAuto ? 'not-allowed' : 'pointer',
                    }}>
                    <div className='rounded-md px-2 py-1 mb-2 font-black text-xs tracking-widest'
                      style={{ background:'#fff', color:'#111', fontFamily:'monospace' }}>QRIS</div>
                    <p className='font-bold text-white text-xs'>QRIS</p>
                    <p className='text-xs mt-0.5' style={{ color:'#64748b' }}>OTOMATIS</p>
                  </button>
                  {/* QRIS MANUAL — hanya aktif jika !isAuto */}
                  <button
                    onClick={() => !isAuto && setPayMethod('qris_manual')}
                    className='flex flex-col items-start p-3 rounded-xl transition-all'
                    style={{
                      background: payMethod==='qris_manual' ? 'rgba(29,111,255,0.15)' : 'rgba(255,255,255,0.05)',
                      border: payMethod==='qris_manual' ? '1.5px solid #1d6fff' : '1.5px solid rgba(255,255,255,0.08)',
                      opacity: isAuto ? 0.38 : 1,
                      cursor: isAuto ? 'not-allowed' : 'pointer',
                    }}>
                    <div className='rounded-md px-2 py-1 mb-2 font-black text-xs tracking-widest'
                      style={{ background:'#fff', color:'#111', fontFamily:'monospace' }}>QRIS</div>
                    <p className='font-bold text-white text-xs'>QRIS</p>
                    <p className='text-xs mt-0.5' style={{ color:'#64748b' }}>MANUAL</p>
                  </button>
                </div>
              </PayOpt>

              {/* E-Wallet — hanya aktif jika manual */}
              <PayOpt label='E-Wallet'
                subtitle='GoPay, OVO, DANA, ShopeePay'
                value='ewallet' payMethod={payMethod} setPayMethod={setPayMethod}
                disabled={isAuto}>
                <p className='text-xs py-2 text-center' style={{ color:'#64748b' }}>Segera hadir</p>
              </PayOpt>

              {/* Bank Transfer — hanya aktif jika manual */}
              <PayOpt label='Bank Transfer'
                subtitle='Transfer ke rekening bank'
                value='bank' payMethod={payMethod} setPayMethod={setPayMethod}
                disabled={isAuto}>
                <p className='text-xs py-2 text-center' style={{ color:'#64748b' }}>Segera hadir</p>
              </PayOpt>
            </div>
          </StepRow>

          {/* ── STEP 4: Detail Kontak ── */}
          <StepRow n={step4} title='Detail Kontak'>
            <label className='text-xs font-semibold text-white block mb-2'>No. WhatsApp</label>
            <div className='flex items-center rounded-xl overflow-hidden'
              style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div className='flex items-center px-3 py-3 flex-shrink-0'
                style={{ background:'rgba(255,255,255,0.05)', borderRight:'1px solid rgba(255,255,255,0.08)' }}>
                <span className='text-lg'>🇮🇩</span>
              </div>
              <input className='flex-1 px-3 py-3 text-sm outline-none bg-transparent'
                style={{ color:'#e8f4ff' }}
                placeholder='628XXXXXXXX'
                value={waNumber} onChange={e => setWaNumber(e.target.value)} />
            </div>
            <p className='text-xs mt-1.5' style={{ color:'#64748b' }}>**Nomor ini akan dihubungi jika terjadi masalah**</p>
          </StepRow>

          {!session && isAuto && (
            <div className='rounded-xl p-3 text-xs text-center'
              style={{ background:'rgba(29,111,255,0.07)', border:'1px solid #1d4ed8', color:'#60a5fa' }}>
              Login Discord untuk harga GOLD/PLATINUM + proses otomatis
            </div>
          )}
          {error && <p className='text-sm text-red-400 mt-1'>{error}</p>}
        </div>
      </div>

      {/* ── FLOATING ORDER BUTTON ── */}
      <div className='fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-3'
        style={{ background:'linear-gradient(to top, rgba(10,22,48,0.98) 60%, transparent 100%)' }}>
        <div className='max-w-2xl mx-auto'>
          {!selected && (
            <div className='mb-2 px-4 py-2.5 rounded-xl text-center text-sm'
              style={{ border:'1.5px dashed rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.45)' }}>
              Belum ada item produk yang dipilih.
            </div>
          )}
          {selected && pricing && (
            <div className='mb-2 px-4 py-2 rounded-xl flex justify-between items-center'
              style={{ background:'rgba(29,111,255,0.1)', border:'1px solid rgba(29,111,255,0.25)' }}>
              <span className='text-xs text-white'>{selVariant?.name}</span>
              <span className='font-black text-sm' style={{ color:'#60a5fa' }}>{formatIDR(pricing.total)}</span>
            </div>
          )}
          <div className='relative'>
            <button
              onClick={handleOrder}
              disabled={loading || (isAuto && stock === 0)}
              className='w-full py-4 rounded-2xl font-black text-base text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2'
              style={{ background: loading ? '#0e2445' : '#1d6fff' }}>
              <IBag />
              {loading ? 'Memproses...' : isAuto && !session ? 'Login Discord' : 'Pesan Sekarang!'}
            </button>
            <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none'>
              <IHSLg />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}