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
        <p className='font-semibold text-white text-sm'>{label}</p>
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
  const logoUrl   = process.env.NEXT_PUBLIC_LOGO_URL || '';
  const userBalance = session?.user?.balance || 0;
  const formatIDRBal = (n) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(n);
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
    if (isAuto && !session) return setError('Login Discord diperlukan untuk produk otomatis. Silakan login terlebih dahulu.');
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
      {/* Floating error toast — top right */}
      {error && (
        <div className='fixed top-16 right-4 z-50 flex items-start gap-2 px-4 py-3 rounded-2xl shadow-xl max-w-xs'
          style={{ background:'#1a1a2e', border:'1.5px solid #ef4444', color:'#fca5a5', fontSize:'0.8rem', lineHeight:1.4 }}
          onClick={() => setError('')}>
          <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#ef4444' strokeWidth='2.5' strokeLinecap='round' style={{flexShrink:0,marginTop:'1px'}}><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>
          <span>{error}</span>
        </div>
      )}
      <div className='max-w-2xl mx-auto pb-36'>

        {/* ── BANNER: identical to Tokan Gaming layout ── */}
        <div style={{ position:'relative', marginBottom:'0' }}>

          {/* Full-width background image */}
          <div style={{ height:'210px', overflow:'hidden', position:'relative', background:'#0d1b30' }}>
            {(product.banner_image || product.thumbnail) && (
              <img src={product.banner_image || product.thumbnail} alt=''
                style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', filter:'brightness(0.65)', display:'block' }} />
            )}
            {/* Bottom fade so card merges seamlessly */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'80px',
              background:'linear-gradient(to top, #1d3080 0%, transparent 100%)' }} />
          </div>

          {/* Blue info card — seamlessly connected to banner, NO gap */}
          <div style={{
            position:'relative',
            background:'linear-gradient(160deg, #1e3a9e 0%, #1a2f88 60%, #152370 100%)',
            paddingTop:'0', paddingBottom:'14px',
            paddingLeft:'16px', paddingRight:'16px',
            overflow:'hidden',
          }}>
            {/* Multi-layer diagonal stripes — futuristic effect */}
            {[{r:'8%',w:'3px',o:0.07},{r:'14%',w:'2px',o:0.05},{r:'22%',w:'6px',o:0.04},
              {r:'30%',w:'2px',o:0.06},{r:'40%',w:'4px',o:0.03},{r:'50%',w:'2px',o:0.05},
              {r:'60%',w:'8px',o:0.04},{r:'72%',w:'2px',o:0.05},{r:'80%',w:'4px',o:0.04}
            ].map((s,i) => (
              <div key={i} aria-hidden='true' style={{
                position:'absolute', top:'-20%', right:s.r, bottom:'-20%', width:s.w,
                background:`rgba(255,255,255,${s.o})`,
                transform:'skewX(-22deg)', pointerEvents:'none',
              }} />
            ))}

            {/* Flex row: 3D icon left + text right */}
            <div style={{ display:'flex', alignItems:'flex-end', gap:'14px' }}>

              {/* 3D icon — negative margin top, sticks out above container */}
              <div style={{ flexShrink:0, marginTop:'-70px', perspective:'800px', zIndex:2 }}>
                <div style={{
                  width:'130px', height:'130px',
                  borderRadius:'18px', overflow:'hidden',
                  transform:'rotateY(12deg) rotateX(-2deg)',
                  transformStyle:'preserve-3d',
                  boxShadow:'6px 10px 28px rgba(0,0,0,0.75), -3px -2px 12px rgba(29,111,255,0.25)',
                  border:'2px solid rgba(255,255,255,0.2)',
                  background:'#0a1628',
                  position:'relative', zIndex:2,
                }}>
                  {product.thumbnail
                    ? <img src={product.thumbnail} alt={product.name}
                        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:'3rem', background:'rgba(29,111,255,0.15)' }}>📦</div>
                  }
                </div>
              </div>

              {/* Right: name + publisher + feature grid */}
              <div style={{ flex:1, paddingTop:'6px', paddingBottom:'2px', zIndex:1 }}>
                <h1 style={{ margin:0, fontWeight:900, fontSize:'1.1rem', color:'#fff',
                  lineHeight:1.25, letterSpacing:'0.01em' }}>
                  {product.name}
                </h1>
                <p style={{ margin:'3px 0 0', fontWeight:600, fontSize:'0.82rem', color:'#60a5fa' }}>
                  {product.publisher || product.categories?.name || ''}
                </p>

                {/* Feature row — 1 grid, icons + text, 11-12px */}
                <div style={{ marginTop:'10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px 8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px', color:'#fbbf24', fontSize:'11px', fontWeight:600 }}>
                    <IBolt /> Fast Process
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px', color:'#60a5fa', fontSize:'11px', fontWeight:600 }}>
                    <IHS /> 24/7 Chat Support
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px', color:'#34d399', fontSize:'11px', fontWeight:600 }}>
                    <IGlobe /> Global Network
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                    <div className='px-3 pt-3 pb-1'>
                      <p className='font-bold text-white text-sm leading-tight'>{v.name}</p>
                    </div>
                    {/* Price */}
                    <div className='px-3 pb-2'>
                      <p className='font-semibold text-sm' style={{ color:'rgba(255,255,255,0.8)' }}>{formatIDR(showPrc)}</p>
                    </div>
                    {/* Divider — BELOW price */}
                    <div style={{ height:'1px', background:'rgba(255,255,255,0.1)', margin:'0 12px' }} />
                    {/* Bottom: INSTAN badge — smaller + bolt icon */}
                    <div className='px-3 py-2 flex justify-end'>
                      <div className='inline-flex flex-row items-center gap-1 rounded-lg px-2 py-1'
                        style={{ background:'#fff' }}>
                        <svg width='9' height='9' viewBox='0 0 24 24' fill='#111827'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>
                        <div>
                          <p style={{ fontSize:'0.5rem', color:'#6b7280', fontWeight:400, lineHeight:1.1 }}>Pengiriman</p>
                          <p style={{ fontSize:'0.58rem', color:'#111827', fontWeight:800, lineHeight:1.1 }}>INSTAN</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </StepRow>

          {/* ── STEP 3: Pilih Pembayaran ── */}
          <StepRow n={step3} title='Pilih Pembayaran'>
            <div className='space-y-2'>
              {/* VECHNOST PAYMENT */}
              {(() => {
                const canUse = !!session && userBalance >= (pricing?.total || 0) && (pricing?.total || 0) > 0;
                const sel = payMethod === 'coins';
                return (
                  <button
                    onClick={() => canUse && setPayMethod('coins')}
                    className='w-full rounded-xl p-4 flex items-center gap-3 relative overflow-hidden transition-all text-left'
                    style={{
                      background: sel ? 'rgba(29,111,255,0.12)' : 'rgba(255,255,255,0.05)',
                      border: sel ? '1.5px solid #1d6fff' : '1.5px solid rgba(255,255,255,0.09)',
                      opacity: canUse ? 1 : 0.5,
                      cursor: canUse ? 'pointer' : 'not-allowed',
                    }}>
                    <div className='absolute top-0 right-0 font-black text-white px-2.5 py-1'
                      style={{ background:'#1d6fff', borderRadius:'0 10px 0 10px', fontSize:'0.55rem' }}>BEST</div>
                    {/* Store logo */}
                    {logoUrl
                      ? <img src={logoUrl} alt='logo' style={{ width:'24px', height:'24px', objectFit:'contain', borderRadius:'5px', flexShrink:0 }} />
                      : <IWallet />
                    }
                    <div>
                      <p className='font-bold text-white text-sm'>VECHNOST PAYMENT</p>
                      {!session
                        ? <p className='text-xs mt-0.5' style={{ color:'#64748b' }}>Login untuk melihat saldo</p>
                        : <p className='text-xs mt-0.5' style={{ color: userBalance >= (pricing?.total||0) && (pricing?.total||0)>0 ? '#10b981' : '#ef4444' }}>
                            Saldo: {formatIDRBal(userBalance)}
                            {pricing && userBalance < pricing.total ? ' (tidak cukup)' : ''}
                          </p>
                      }
                    </div>
                  </button>
                );
              })()}

              {/* QRIS dropdown */}
              <PayOpt label='QRIS' value='qris' payMethod={payMethod} setPayMethod={setPayMethod} disabled={false} noSelect={true}>
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
              <PayOpt label='E-Wallet' value='ewallet' payMethod={payMethod} setPayMethod={setPayMethod} disabled={isAuto}>
                <p className='text-xs py-2 text-center' style={{ color:'#64748b' }}>Segera hadir</p>
              </PayOpt>

              {/* Bank Transfer — hanya aktif jika manual */}
              <PayOpt label='Bank Transfer' value='bank' payMethod={payMethod} setPayMethod={setPayMethod} disabled={isAuto}>
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


        </div>
      </div>

      {/* ── FLOATING ORDER BUTTON ── */}
      <div className='fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-3'
        style={{ background:'linear-gradient(to top, rgba(10,22,48,0.98) 60%, transparent 100%)' }}>
        <div className='max-w-2xl mx-auto'>
          <div className='relative'>
            <button
              onClick={handleOrder}
              disabled={loading || (isAuto && stock === 0)}
              className='w-full py-4 rounded-2xl font-black text-base text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2'
              style={{ background: loading ? '#0e2445' : '#1d6fff' }}>
              <IBag />
              {loading ? 'Memproses...' : 'Pesan Sekarang!'}
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