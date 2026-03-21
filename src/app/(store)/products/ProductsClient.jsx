'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

const fmt = n => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(n);

export default function ProductsClient({ prods, tierSettings, currentTier }) {
  const [selected, setSelected] = useState('');
  const [open, setOpen]         = useState(false);

  // Bangun map diskon per tier dari DB
  const tierMap = useMemo(() => {
    const map = {};
    for (const t of tierSettings) {
      map[t.tier_name.toLowerCase()] = {
        name:     t.tier_name.toUpperCase(),
        discount: parseFloat(t.discount || 0),
        color:    t.color || '#60a5fa',
      };
    }
    // Pastikan member selalu ada
    if (!map.member) map.member = { name:'MEMBER', discount:0, color:'#60a5fa' };
    return map;
  }, [tierSettings]);

  // Tier kolom: urutkan dari terkecil diskon ke terbesar, max 3 kolom
  const tierCols = useMemo(() => {
    const sorted = tierSettings
      .filter(t => t.is_active)
      .sort((a, b) => a.min_spent - b.min_spent)
      .map(t => ({
        key:      t.tier_name.toLowerCase(),
        name:     t.tier_name.toUpperCase(),
        discount: parseFloat(t.discount || 0),
        color:    t.color || '#60a5fa',
      }));
    // Pastikan member selalu ada di kolom pertama
    const hasMember = sorted.some(t => t.key === 'member');
    if (!hasMember) {
      sorted.unshift({ key:'member', name:'MEMBER', discount:0, color:'#60a5fa' });
    }
    return sorted;
  }, [tierSettings]);

  const selectedProd = prods.find(p => p.id === selected);
  const sortedVars   = selectedProd
    ? [...(selectedProd.product_variants || [])].sort((a,b) => (a.sort_order||0) - (b.sort_order||0))
    : [];

  const priceFor = (basePrice, discount) =>
    fmt(Math.floor(basePrice * (1 - discount)));

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
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <h1 style={{position:'relative',zIndex:1,margin:0,fontWeight:900,fontSize:'1.3rem',color:'#fff',letterSpacing:'0.03em'}}>DAFTAR LAYANAN</h1>
        <p style={{position:'relative',zIndex:1,margin:'6px 0 0',fontSize:'0.8rem',color:'rgba(255,255,255,0.55)'}}>Pilih produk untuk melihat daftar harga</p>
        <style>{`
          @keyframes bannerShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
          @keyframes iconPulse{0%,100%{box-shadow:0 0 0 0 rgba(29,111,255,0.5)}50%{box-shadow:0 0 0 14px rgba(29,111,255,0)}}
          @keyframes orb0{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,8px)}}
          @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-6px)}}
          @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,10px)}}
        `}</style>
      </div>

      <div style={{padding:'20px 16px 0'}}>

        {/* Dropdown pilih produk */}
        <div style={{position:'relative',marginBottom:'20px'}}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              width:'100%', padding:'12px 16px',
              background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.12)',
              borderRadius:'14px', color: selected ? '#fff' : 'rgba(255,255,255,0.45)',
              fontWeight: selected ? 700 : 400, fontSize:'0.9rem',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              cursor:'pointer', transition:'border-color 0.2s',
            }}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              {selectedProd?.thumbnail && (
                <img src={selectedProd.thumbnail} alt="" style={{width:'24px',height:'24px',borderRadius:'6px',objectFit:'cover'}}/>
              )}
              <span>{selectedProd ? selectedProd.name : 'Pilih Produk...'}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" style={{transform:open?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s'}}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {open && (
            <>
              <div style={{position:'fixed',inset:0,zIndex:40}} onClick={()=>setOpen(false)}/>
              <div style={{
                position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:50,
                background:'#0d1e3d', border:'1.5px solid rgba(255,255,255,0.12)',
                borderRadius:'14px', overflow:'hidden',
                boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
                maxHeight:'280px', overflowY:'auto',
              }}>
                {prods.map(p => (
                  <button key={p.id}
                    onClick={()=>{ setSelected(p.id); setOpen(false); }}
                    style={{
                      width:'100%', padding:'11px 16px',
                      display:'flex', alignItems:'center', gap:'10px',
                      background: selected===p.id ? 'rgba(29,111,255,0.15)' : 'transparent',
                      border:'none', borderBottom:'1px solid rgba(255,255,255,0.06)',
                      color:'#fff', fontSize:'0.88rem', fontWeight: selected===p.id ? 700 : 400,
                      cursor:'pointer', textAlign:'left', transition:'background 0.15s',
                    }}>
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt="" style={{width:'28px',height:'28px',borderRadius:'7px',objectFit:'cover',flexShrink:0}}/>
                      : <div style={{width:'28px',height:'28px',borderRadius:'7px',background:'rgba(29,111,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'0.9rem'}}>📦</div>
                    }
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
                    {selected===p.id && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tabel harga — hanya tampil jika produk dipilih */}
        {selectedProd && sortedVars.length > 0 && (
          <div style={{borderRadius:'16px',border:'1px solid rgba(255,255,255,0.09)',background:'rgba(255,255,255,0.03)',overflow:'visible'}}>

            {/* Product header */}
            <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',background:'rgba(29,111,255,0.08)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
              {selectedProd.thumbnail
                ? <img src={selectedProd.thumbnail} alt={selectedProd.name} style={{width:'40px',height:'40px',borderRadius:'10px',objectFit:'cover',flexShrink:0}}/>
                : <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(29,111,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'1.2rem'}}>📦</div>
              }
              <div style={{flex:1}}>
                <p style={{margin:0,fontWeight:800,color:'#fff',fontSize:'0.95rem'}}>{selectedProd.name}</p>
                <Link href={`/products/${selectedProd.slug}`} style={{fontSize:'0.75rem',color:'#60a5fa',textDecoration:'none',fontWeight:600}}>
                  Beli Sekarang →
                </Link>
              </div>
            </div>

            {/* Scrollable table — geser kiri/kanan jika banyak tier */}
            {/* padding-right 16px di wrapper biar kolom terakhir tidak terpotong */}
            <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch',borderBottomLeftRadius:'16px',borderBottomRightRadius:'16px',overflow:'auto'}}>
              <div style={{minWidth:`${Math.max(340, 160 + tierCols.length * 95)}px`, paddingRight:'1px'}}>
                {/* Header */}
                <div style={{
                  display:'grid',
                  gridTemplateColumns:`minmax(140px,1fr) ${tierCols.map(()=>'95px').join(' ')}`,
                  padding:'8px 0 8px 16px',
                  background:'rgba(0,0,0,0.25)',
                  borderBottom:'1px solid rgba(255,255,255,0.09)',
                }}>
                  <div style={{fontSize:'0.65rem',fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.08em'}}>NAMA PRODUK</div>
                  {tierCols.map(t => (
                    <div key={t.key} style={{
                      fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase',
                      letterSpacing:'0.06em',textAlign:'right',
                      color: t.key===currentTier ? t.color : 'rgba(255,255,255,0.4)',
                      paddingRight:'8px',
                    }}>{t.name}</div>
                  ))}
                </div>
                {/* Rows — separator border-bottom per baris */}
                {sortedVars.map((v) => (
                  <Link key={v.id} href={`/products/${selectedProd.slug}`}
                    style={{
                      display:'grid',
                      gridTemplateColumns:`minmax(140px,1fr) ${tierCols.map(()=>'95px').join(' ')}`,
                      padding:'12px 0 12px 16px',
                      borderBottom:'1px solid rgba(255,255,255,0.07)',
                      textDecoration:'none',
                      background:'transparent',
                    }}>
                    <div style={{fontSize:'0.82rem',fontWeight:600,color:'#e8f4ff',paddingRight:'12px',display:'flex',alignItems:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.name}</div>
                    {tierCols.map(t => (
                      <div key={t.key} style={{
                        textAlign:'right',fontSize:'0.82rem',whiteSpace:'nowrap',paddingRight:'8px',
                        fontWeight: t.key===currentTier ? 800 : 500,
                        color: t.key===currentTier ? t.color : 'rgba(255,255,255,0.45)',
                        display:'flex',alignItems:'center',justifyContent:'flex-end',
                      }}>{priceFor(v.price, t.discount)}</div>
                    ))}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state kalau belum pilih produk */}
        {!selected && (
          <div style={{textAlign:'center',padding:'48px 16px',color:'rgba(255,255,255,0.25)',fontSize:'0.85rem'}}>
            Pilih produk di atas untuk melihat daftar harga
          </div>
        )}

        {/* Produk dipilih tapi tidak ada variant */}
        {selectedProd && sortedVars.length === 0 && (
          <div style={{textAlign:'center',padding:'48px 16px',color:'rgba(255,255,255,0.25)',fontSize:'0.85rem'}}>
            Produk ini belum memiliki varian harga
          </div>
        )}
      </div>
    </div>
  );
}