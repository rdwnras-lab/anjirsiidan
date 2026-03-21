export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import TransactionSearch from './TransactionSearch';

export default async function OrdersPage() {
  // Ambil 10 transaksi completed terbaru (semua user, untuk realtime feed)
  const { data: recent } = await supabaseAdmin
    .from('orders')
    .select('id, product_name, variant_name, quantity, total_amount, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div style={{paddingBottom:'96px'}}>

      {/* Animated Banner */}
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

        {/* Search */}
        <TransactionSearch />

        {/* Tabel transaksi terbaru */}
        {recent && recent.length > 0 && (
          <div style={{borderRadius:'16px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.09)',background:'rgba(255,255,255,0.03)'}}>
            {/* Header tabel */}
            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr auto',
              padding:'8px 16px',
              background:'rgba(0,0,0,0.2)',
              borderBottom:'1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.08em'}}>TANGGAL</span>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.08em'}}>PRODUK</span>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.08em',textAlign:'right'}}>HARGA</span>
            </div>
            {/* Rows */}
            {recent.map((o, i) => {
              const date   = new Date(o.created_at);
              const label  = date.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
              const qty    = o.quantity || 1;
              const item   = qty > 1 ? `${o.variant_name} x${qty}` : o.variant_name;
              const harga  = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(o.total_amount);
              return (
                <div key={o.id} style={{
                  display:'grid', gridTemplateColumns:'1fr 1fr auto',
                  padding:'11px 16px',
                  borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  alignItems:'center',
                }}>
                  <span style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.5)'}}>{label}</span>
                  <span style={{fontSize:'0.82rem',fontWeight:600,color:'#e8f4ff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',paddingRight:'8px'}}>{item}</span>
                  <span style={{fontSize:'0.82rem',fontWeight:700,color:'#10b981',textAlign:'right',whiteSpace:'nowrap'}}>{harga}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}