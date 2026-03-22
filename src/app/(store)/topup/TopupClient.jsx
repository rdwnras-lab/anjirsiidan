'use client';
import { useState, useRef } from 'react';

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const statusInfo = {
  pending:  { label: 'Menunggu', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)'  },
  approved: { label: 'Disetujui', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  rejected: { label: 'Ditolak',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'  },
};

const AMOUNTS = [10000, 25000, 50000, 100000, 200000, 500000];

export default function TopupClient({ paymentMethods, currentBalance, history }) {
  const [amount,   setAmount]   = useState('');
  const [method,   setMethod]   = useState(null);
  const [file,     setFile]     = useState(null);      // File object
  const [preview,  setPreview]  = useState('');        // Preview URL (blob)
  const [notes,    setNotes]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const fileRef = useRef(null);

  const banks    = paymentMethods.filter(m => m.type === 'bank');
  const ewallets = paymentMethods.filter(m => m.type === 'ewallet');
  const allMethods = [...banks, ...ewallets];

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('Ukuran foto maksimal 5 MB.'); return; }
    if (!f.type.startsWith('image/')) { setError('File harus berupa gambar.'); return; }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < 5000) return setError('Nominal minimal Rp 5.000.');
    if (!method)            return setError('Pilih metode pembayaran.');
    if (!file)              return setError('Upload foto bukti transfer terlebih dahulu.');

    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('amount',            String(amt));
      formData.append('payment_method_id', method.id);
      formData.append('notes',             notes.trim());
      formData.append('proof',             file);

      const res  = await fetch('/api/topup', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Gagal mengirim request.');
      setSuccess(true);
      setAmount(''); setMethod(null); setFile(null); setPreview(''); setNotes('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '448px', margin: '0 auto', paddingBottom: '96px' }}>

      {/* Banner */}
      <div style={{ position:'relative',overflow:'hidden',background:'linear-gradient(135deg,#0a1a4a 0%,#0f2d6e 40%,#1a3fa3 70%,#0a1a4a 100%)',backgroundSize:'300% 300%',animation:'bannerShift 6s ease infinite',padding:'32px 20px 44px',textAlign:'center' }}>
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(29,111,255,0.25) 0%,transparent 50%,rgba(29,111,255,0.15) 100%)' }}/>
        {[{w:90,h:90,t:-20,l:-20,c:'rgba(29,111,255,0.18)'},{w:60,h:60,b:-10,r:-10,c:'rgba(96,165,250,0.12)'},{w:40,h:40,t:20,r:'25%',c:'rgba(29,111,255,0.1)'}].map((o,i)=>(
          <div key={i} style={{position:'absolute',width:o.w,height:o.h,borderRadius:'50%',background:o.c,top:o.t,left:o.l,right:o.r,bottom:o.b,filter:'blur(2px)',animation:`orb${i} ${4+i}s ease-in-out infinite`}}/>
        ))}
        <div style={{ position:'absolute',bottom:-2,left:0,right:0,height:'32px',background:'#0a1628',clipPath:'ellipse(60% 100% at 50% 100%)' }}/>
        <div style={{ position:'relative',zIndex:1,width:'60px',height:'60px',borderRadius:'50%',background:'rgba(29,111,255,0.2)',border:'1.5px solid rgba(96,165,250,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',animation:'iconPulse 2.5s ease-in-out infinite' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        </div>
        <h1 style={{ position:'relative',zIndex:1,margin:0,fontWeight:900,fontSize:'1.3rem',color:'#fff' }}>TOPUP SALDO</h1>
        <p style={{ position:'relative',zIndex:1,margin:'6px 0 0',fontSize:'0.8rem',color:'rgba(255,255,255,0.55)' }}>Tambah saldo untuk berbelanja lebih mudah</p>
        <style>{`
          @keyframes bannerShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
          @keyframes iconPulse{0%,100%{box-shadow:0 0 0 0 rgba(29,111,255,0.5)}50%{box-shadow:0 0 0 14px rgba(29,111,255,0)}}
          @keyframes orb0{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,8px)}}
          @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-6px)}}
          @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,10px)}}
        `}</style>
      </div>

      <div style={{ padding:'20px 16px 0', display:'flex', flexDirection:'column', gap:'12px' }}>

        {/* Saldo saat ini */}
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <p style={{ margin:0,fontSize:'0.78rem',color:'rgba(255,255,255,0.45)' }}>Saldo Kamu Saat Ini</p>
            <p style={{ margin:'4px 0 0',fontWeight:900,fontSize:'1.3rem',color:'#60a5fa' }}>{fmt(currentBalance)}</p>
          </div>
          <div style={{ width:'44px',height:'44px',borderRadius:'12px',background:'rgba(29,111,255,0.15)',border:'1px solid rgba(29,111,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
        </div>

        {/* Success */}
        {success && (
          <div style={{ background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'16px',padding:'16px',textAlign:'center' }}>
            <p style={{ margin:'0 0 4px',fontSize:'1.5rem' }}>✅</p>
            <p style={{ margin:0,fontWeight:800,color:'#4ade80',fontSize:'0.95rem' }}>Request Terkirim!</p>
            <p style={{ margin:'6px 0 0',fontSize:'0.8rem',color:'rgba(255,255,255,0.5)' }}>Admin akan memverifikasi dan menyetujui topup kamu segera.</p>
            <button onClick={() => setSuccess(false)} style={{ marginTop:'12px',padding:'8px 20px',borderRadius:'10px',background:'rgba(16,185,129,0.2)',border:'1px solid rgba(16,185,129,0.4)',color:'#4ade80',fontWeight:700,fontSize:'0.82rem',cursor:'pointer' }}>
              Topup Lagi
            </button>
          </div>
        )}

        {!success && (<>

          {/* Step 1: Nominal */}
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px' }}>
            <p style={{ margin:'0 0 12px',fontWeight:700,color:'#fff',fontSize:'0.88rem' }}>1. Pilih Nominal</p>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'12px' }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(String(a))}
                  style={{ padding:'8px 4px',borderRadius:'10px',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',transition:'all 0.15s',
                    background: amount === String(a) ? 'rgba(29,111,255,0.2)' : 'rgba(255,255,255,0.05)',
                    border: amount === String(a) ? '1.5px solid #1d6fff' : '1.5px solid rgba(255,255,255,0.1)',
                    color: amount === String(a) ? '#60a5fa' : '#e8f4ff',
                  }}>{fmt(a)}</button>
              ))}
            </div>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',fontSize:'0.85rem',fontWeight:600 }}>Rp</span>
              <input type="number" min="5000" placeholder="Atau ketik nominal lain..." value={amount} onChange={e => setAmount(e.target.value)}
                style={{ width:'100%',boxSizing:'border-box',paddingLeft:'36px',paddingRight:'12px',paddingTop:'10px',paddingBottom:'10px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.1)',color:'#e8f4ff',fontSize:'0.88rem',outline:'none' }}
              />
            </div>
            <p style={{ margin:'6px 0 0',fontSize:'0.73rem',color:'rgba(255,255,255,0.35)' }}>Minimal topup Rp 5.000</p>
          </div>

          {/* Step 2: Metode */}
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px' }}>
            <p style={{ margin:'0 0 12px',fontWeight:700,color:'#fff',fontSize:'0.88rem' }}>2. Pilih Metode Transfer</p>
            {allMethods.length === 0
              ? <p style={{ color:'rgba(255,255,255,0.35)',fontSize:'0.82rem' }}>Belum ada metode pembayaran aktif.</p>
              : (
                <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
                  {allMethods.map(m => (
                    <button key={m.id} onClick={() => setMethod(method?.id === m.id ? null : m)}
                      style={{ display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'12px',cursor:'pointer',transition:'all 0.15s',textAlign:'left',
                        background: method?.id === m.id ? 'rgba(29,111,255,0.12)' : 'rgba(255,255,255,0.04)',
                        border: method?.id === m.id ? '1.5px solid #1d6fff' : '1.5px solid rgba(255,255,255,0.08)',
                      }}>
                      <div style={{ width:'40px',height:'40px',borderRadius:'10px',background:'#fff',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'4px',overflow:'hidden' }}>
                        {m.logo_url ? <img src={m.logo_url} alt={m.provider} style={{ width:'100%',height:'100%',objectFit:'contain' }}/> : <span style={{ fontWeight:900,fontSize:'0.6rem',color:'#111',fontFamily:'monospace' }}>{m.provider.slice(0,6).toUpperCase()}</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0,fontWeight:700,color:'#fff',fontSize:'0.88rem' }}>{m.provider}</p>
                        <p style={{ margin:'2px 0 0',fontSize:'0.75rem',color:'rgba(255,255,255,0.45)' }}>{m.account_number} * {m.account_name}</p>
                      </div>
                      <span style={{ fontSize:'0.65rem',fontWeight:700,padding:'3px 8px',borderRadius:'6px',
                        background: m.type === 'bank' ? 'rgba(96,165,250,0.12)' : 'rgba(167,139,250,0.12)',
                        color: m.type === 'bank' ? '#60a5fa' : '#a78bfa',
                      }}>{m.type === 'bank' ? 'BANK' : 'E-WALLET'}</span>
                    </button>
                  ))}
                </div>
              )
            }
            {method && (
              <div style={{ marginTop:'12px',padding:'12px 14px',borderRadius:'12px',background:'rgba(29,111,255,0.08)',border:'1px solid rgba(29,111,255,0.2)' }}>
                <p style={{ margin:'0 0 6px',fontSize:'0.75rem',color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em' }}>Transfer ke</p>
                <p style={{ margin:'0 0 2px',fontWeight:700,color:'#fff',fontSize:'0.9rem' }}>{method.provider}</p>
                <p style={{ margin:'0 0 2px',fontFamily:'monospace',fontSize:'1rem',fontWeight:800,color:'#60a5fa',letterSpacing:'0.06em' }}>{method.account_number}</p>
                <p style={{ margin:0,fontSize:'0.8rem',color:'rgba(255,255,255,0.55)' }}>a.n. {method.account_name}</p>
                {amount && parseInt(amount) >= 5000 && (
                  <div style={{ marginTop:'10px',paddingTop:'10px',borderTop:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontSize:'0.8rem',color:'rgba(255,255,255,0.45)' }}>Nominal transfer</span>
                    <span style={{ fontWeight:900,color:'#4ade80',fontSize:'1rem' }}>{fmt(parseInt(amount))}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Upload foto */}
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px' }}>
            <p style={{ margin:'0 0 4px',fontWeight:700,color:'#fff',fontSize:'0.88rem' }}>3. Upload Bukti Transfer</p>
            <p style={{ margin:'0 0 12px',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)' }}>Foto struk/screenshot bukti transfer. Maks 5 MB.</p>

            {/* Hidden file input */}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display:'none' }} />

            {!file ? (
              <button onClick={() => fileRef.current?.click()}
                style={{ width:'100%',padding:'20px',borderRadius:'12px',border:'2px dashed rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.03)',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',transition:'all 0.2s' }}>
                <div style={{ width:'44px',height:'44px',borderRadius:'12px',background:'rgba(29,111,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p style={{ margin:0,fontWeight:700,color:'#60a5fa',fontSize:'0.88rem' }}>Pilih Foto dari Galeri</p>
                <p style={{ margin:0,fontSize:'0.73rem',color:'rgba(255,255,255,0.35)' }}>JPG, PNG, WEBP • Maks 5 MB</p>
              </button>
            ) : (
              <div style={{ position:'relative' }}>
                <img src={preview} alt="Bukti transfer"
                  style={{ width:'100%',borderRadius:'12px',objectFit:'contain',maxHeight:'220px',background:'rgba(0,0,0,0.3)' }}
                />
                <button onClick={removeFile}
                  style={{ position:'absolute',top:'8px',right:'8px',width:'32px',height:'32px',borderRadius:'50%',background:'rgba(0,0,0,0.7)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'1rem',lineHeight:1 }}>
                  ×
                </button>
                <button onClick={() => fileRef.current?.click()}
                  style={{ marginTop:'8px',width:'100%',padding:'8px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',fontSize:'0.78rem',cursor:'pointer',fontWeight:600 }}>
                  Ganti Foto
                </button>
              </div>
            )}
          </div>

          {/* Step 4: Catatan */}
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px' }}>
            <p style={{ margin:'0 0 8px',fontWeight:700,color:'#fff',fontSize:'0.88rem' }}>4. Catatan (opsional)</p>
            <textarea placeholder="Contoh: Transfer dari BCA atas nama Ridwan..." value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              style={{ width:'100%',boxSizing:'border-box',padding:'10px 12px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.1)',color:'#e8f4ff',fontSize:'0.85rem',outline:'none',resize:'vertical' }}
            />
          </div>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'12px',padding:'12px 14px' }}>
              <p style={{ margin:0,color:'#ef4444',fontSize:'0.82rem',fontWeight:600 }}>{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ padding:'14px',borderRadius:'14px',background: loading ? '#0e2445' : 'linear-gradient(135deg,#1d6fff,#1450cc)',color:'#fff',fontWeight:900,fontSize:'0.95rem',border:'none',cursor: loading ? 'not-allowed' : 'pointer',boxShadow: loading ? 'none' : '0 4px 20px rgba(29,111,255,0.4)',transition:'all 0.2s' }}>
            {loading ? 'Mengirim...' : '💳 Kirim Request Topup'}
          </button>

        </>)}

        {/* Riwayat */}
        {history.length > 0 && (
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'16px' }}>
            <p style={{ margin:'0 0 12px',fontWeight:700,color:'#fff',fontSize:'0.88rem' }}>Riwayat Topup</p>
            <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
              {history.map(h => {
                const s = statusInfo[h.status] || statusInfo.pending;
                const d = new Date(h.created_at).toLocaleDateString('id-ID', { day:'numeric',month:'long',year:'numeric' });
                return (
                  <div key={h.id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',borderRadius:'10px',background:'rgba(0,0,0,0.2)',border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p style={{ margin:0,fontWeight:700,color:'#e8f4ff',fontSize:'0.88rem' }}>{fmt(h.amount)}</p>
                      <p style={{ margin:'2px 0 0',fontSize:'0.73rem',color:'rgba(255,255,255,0.4)' }}>{d}</p>
                      {h.admin_notes && <p style={{ margin:'2px 0 0',fontSize:'0.73rem',color:'rgba(255,255,255,0.35)',fontStyle:'italic' }}>{h.admin_notes}</p>}
                    </div>
                    <span style={{ padding:'4px 12px',borderRadius:'20px',fontSize:'0.7rem',fontWeight:700,background:s.bg,color:s.color,border:`1px solid ${s.border}`,whiteSpace:'nowrap' }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}