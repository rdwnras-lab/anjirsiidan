export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import TransactionSearch from './TransactionSearch';

export default async function OrdersPage() {
  const { data: recent } = await supabaseAdmin
    .from('orders')
    .select('id, variant_name, quantity, total_amount, created_at, customer_whatsapp, status')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);

  // Helper: mask invoice → VECH...xx (max 9 char, selalu muat)
  const maskInvoice = (id) => {
    if (!id) return '—';
    // Format: 4 char awal + "..." + 2 char terakhir = 9 char fix
    return id.slice(0, 4) + '...' + id.slice(-2);
  };

  // Helper: mask WA → +62 + 3 digit terakhir
  const maskWA = (wa) => {
    const s = wa ? String(wa).trim() : '';
    return s.length >= 4 ? '+62' + s.slice(-3) : '—';
  };

  const fmt = (n) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n);

  const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const badgeStyle = (status) => {
    if (status === 'completed') return { bg:'rgba(16,185,129,0.18)', color:'#10b981', border:'rgba(16,185,129,0.4)', label:'Success' };
    if (status === 'processing') return { bg:'rgba(96,165,250,0.18)', color:'#60a5fa', border:'rgba(96,165,250,0.4)', label:'Processing' };
    if (status === 'paid')       return { bg:'rgba(96,165,250,0.18)', color:'#60a5fa', border:'rgba(96,165,250,0.4)', label:'Paid' };
    if (status === 'pending')    return { bg:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'rgba(251,191,36,0.35)', label:'Pending' };
    return { bg:'rgba(107,114,128,0.15)', color:'#9ca3af', border:'rgba(107,114,128,0.3)', label: status || '—' };
  };

  // Grid: TANGGAL 105px | INVOICE 80px | WA 120px | HARGA 85px | STATUS 90px = 480px + 32px padding
  const COLS = '105px 80px 120px 85px 90px';
  const HEADERS = ['TANGGAL', 'INVOICE', 'WHATSAPP', 'HARGA', 'STATUS'];

  return (
    <div style={{paddingBottom:'96px'}}>

      {/* ── Animated Banner */}
      <div style={{
        position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg,#0a1a4a 0%,#0f2d6e 40%,#1a3fa3 70%,#0a1a4a 100%)',
        backgroundSize:'300% 300%', animation:'bannerShift 6s ease infinite',
        padding:'32px 20px 44px', textAlign:'center',
      }}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(29,111,255,0.25) 0%,transparent 50%,rgba(29,111,255,0.15) 100%)'}}/>
        {[{w:90,h:90,t:-20,l:-20,c:'rgba(29,111,255,0.18)'},{w:60,h:60,b:-10,r:-10,c:'rgba(96,165,250,0.12)'},{w:40,h:40,t:20,r:'25%',c:'rgba(29,111,255,0.1)'}].map((o,i)=>(
          <div key={i} style={{position:'absolute',width:o.w,height:o.h,borderRadius:'50%',background:o.c,top:o.t,left:o.l,right:o.r,bottom:o.b,filter:'blur(2px)',animation:`orb${i} ${4+i}s ease-in-out infinite`}}/>
        ))}
        <div style={{position:'absolute',bottom:-2,left:0,right:0,height:'32px',background:'#0a1628',clipPath:'ellipse(60% 100% at 50% 100%)'}}/>
        <div style={{position:'relative',zIndex:1,width:'60px',height:'60px',borderRadius:'50%',background:'rgba(29,111,255,0.2)',border:'1.5px solid rgba(96,165,250,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',animation:'iconPulse 2.5s ease-in-out infinite'}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h1 style={{position:'relative',zIndex:1,margin:0,fontWeight:900,fontSize:'1.3rem',color:'#fff',letterSpacing:'0.03em'}}>TRANSAKSI</h1>
        <p style={{position:'relative',zIndex:1,margin:'6px 0 0',fontSize:'0.8rem',color:'rgba(255,255,255,0.55)'}}>Lacak transaksimu dengan nomor invoice</p>
        <style>{`
          @keyframes bannerShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
          @keyframes iconPulse{0%,100%{box-shadow:0 0 0 0 rgba(29,111,255,0.5)}50%{box-shadow:0 0 0 14px rgba(29,111,255,0)}}
          @keyframes orb0{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,8px)}}
          @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-6px)}}
          @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,10px)}}
        `}</style>
      </div>

      <div style={{padding:'20px 16px 0', display:'flex', flexDirection:'column', gap:'16px'}}>

        {/* ── Search */}
        <TransactionSearch />

        {/* ── Container Transaksi Real-Time — persis seperti referensi */}
        {recent && recent.length > 0 && (
          <div style={{
            borderRadius:'16px',
            overflow:'hidden',
            background:'rgba(10,14,35,0.92)',
            border:'1px solid rgba(255,255,255,0.09)',
          }}>

            {/* Title header dalam container */}
            <div style={{
              padding:'20px 16px 16px',
              textAlign:'center',
              borderBottom:'1px solid rgba(255,255,255,0.07)',
            }}>
              <p style={{margin:0, fontWeight:800, fontSize:'1.05rem', color:'#fff', letterSpacing:'0.01em'}}>
                Transaksi Real-Time
              </p>
              <p style={{margin:'5px 0 0', fontSize:'0.75rem', color:'rgba(255,255,255,0.45)', lineHeight:1.5}}>
                Berikut ini 10 transaksi terakhir yang baru saja masuk.
              </p>
            </div>

            {/* Scrollable table */}
            <div style={{overflowX:'auto', WebkitOverflowScrolling:'touch'}}>
              <div style={{minWidth:'512px'}}>

                {/* Header kolom */}
                <div style={{
                  display:'grid', gridTemplateColumns: COLS,
                  padding:'8px 16px',
                  background:'rgba(255,255,255,0.04)',
                  borderBottom:'1px solid rgba(255,255,255,0.07)',
                }}>
                  {HEADERS.map(h => (
                    <span key={h} style={{
                      fontSize:'0.62rem', fontWeight:800, letterSpacing:'0.09em',
                      color:'rgba(255,255,255,0.5)', textTransform:'uppercase',
                    }}>{h}</span>
                  ))}
                </div>

                {/* Rows */}
                {(recent || []).map((o, i) => {
                  const badge = badgeStyle(o.status);
                  return (
                    <div key={o.id} style={{
                      display:'grid', gridTemplateColumns: COLS,
                      padding:'11px 16px', alignItems:'center',
                      borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      {/* Tanggal */}
                      <span style={{fontSize:'0.73rem', color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', paddingRight:'4px'}}>
                        {fmtDate(o.created_at)}
                      </span>
                      {/* Invoice — pendek & pasti muat */}
                      <span style={{fontSize:'0.73rem', fontWeight:700, color:'#e8f4ff', fontFamily:'monospace', whiteSpace:'nowrap', paddingRight:'4px'}}>
                        {maskInvoice(o.id)}
                      </span>
                      {/* WhatsApp */}
                      <span style={{fontSize:'0.73rem', color:'rgba(255,255,255,0.55)', fontFamily:'monospace', whiteSpace:'nowrap', paddingRight:'4px'}}>
                        {maskWA(o.customer_whatsapp)}
                      </span>
                      {/* Harga */}
                      <span style={{fontSize:'0.73rem', fontWeight:700, color:'#10b981', whiteSpace:'nowrap', paddingRight:'4px'}}>
                        {fmt(o.total_amount)}
                      </span>
                      {/* Status badge — fixed width agar tidak terpotong */}
                      <span style={{
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                        padding:'4px 8px', borderRadius:'20px',
                        fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.02em',
                        background: badge.bg, color: badge.color,
                        border:`1px solid ${badge.border}`,
                        whiteSpace:'nowrap', width:'82px', boxSizing:'border-box',
                      }}>{badge.label}</span>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}