'use client';

const fmt = n => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(n);
const mask = name => {
  if (!name || name.length <= 1) return '***';
  return name[0] + '*'.repeat(Math.min(name.length - 1, 4));
};

function Board({ data, title, sub }) {
  return (
    <div style={{marginBottom:'24px'}}>
      <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'8px',
          padding:'6px 20px', borderRadius:'999px',
          border:'1px solid rgba(245,158,11,0.4)', background:'rgba(245,158,11,0.06)',
        }}>
          <span style={{fontSize:'0.75rem',fontWeight:900,letterSpacing:'0.1em',color:'#f59e0b'}}>{title}</span>
        </div>
      </div>
      <div style={{borderRadius:'16px',overflow:'hidden',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)'}}>
        {!data || data.length === 0 ? (
          <div style={{padding:'40px 16px',textAlign:'center',fontSize:'0.85rem',color:'rgba(255,255,255,0.3)'}}>
            Belum ada data {sub}
          </div>
        ) : (
          <>
            <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px',background:'rgba(245,158,11,0.06)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',background:'rgba(245,158,11,0.12)',border:'2px solid rgba(245,158,11,0.35)'}}>🥇</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontWeight:900,color:'#fff',fontSize:'0.95rem'}}>{mask(data[0].name)}</p>
                <p style={{margin:'2px 0 0',fontSize:'0.72rem',color:'rgba(245,158,11,0.7)'}}>{data[0].count} transaksi</p>
              </div>
              <p style={{flexShrink:0,fontWeight:900,fontSize:'1rem',color:'#f59e0b',margin:0}}>{fmt(data[0].total)}</p>
            </div>
            {data.slice(1).map((u, i) => (
              <div key={u.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{width:'28px',textAlign:'center',flexShrink:0}}>
                  {i === 0 ? <span style={{fontSize:'1.2rem'}}>🥈</span>
                  : i === 1 ? <span style={{fontSize:'1.2rem'}}>🥉</span>
                  : <span style={{fontWeight:700,fontSize:'0.8rem',color:'rgba(255,255,255,0.35)'}}>#{i+2}</span>}
                </div>
                <p style={{flex:1,margin:0,fontWeight:600,fontSize:'0.85rem',color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{mask(u.name)}</p>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <p style={{margin:0,fontWeight:700,fontSize:'0.85rem',color:'#60a5fa'}}>{fmt(u.total)}</p>
                  <p style={{margin:'1px 0 0',fontSize:'0.7rem',color:'rgba(255,255,255,0.3)'}}>{u.count}x</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardClient({ daily, weekly, monthly }) {
  return (
    <div style={{paddingBottom:'96px'}}>
      {/* Animated banner */}
      <div style={{
        position:'relative',overflow:'hidden',
        background:'linear-gradient(135deg,#0a1a4a 0%,#0f2d6e 40%,#1a3fa3 70%,#0a1a4a 100%)',
        backgroundSize:'300% 300%', animation:'bannerShift 6s ease infinite',
        padding:'32px 20px 44px', textAlign:'center', marginBottom:'0',
      }}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(245,158,11,0.15) 0%,transparent 50%,rgba(245,158,11,0.1) 100%)'}}/>
        {[{w:90,h:90,t:-20,l:-20,c:'rgba(245,158,11,0.12)'},{w:60,h:60,b:-10,r:-10,c:'rgba(245,158,11,0.08)'},{w:40,h:40,t:20,r:'25%',c:'rgba(29,111,255,0.1)'}].map((o,i)=>(
          <div key={i} style={{position:'absolute',width:o.w,height:o.h,borderRadius:'50%',background:o.c,top:o.t,left:o.l,right:o.r,bottom:o.b,filter:'blur(2px)',animation:`orbL${i} ${4+i}s ease-in-out infinite`}}/>
        ))}
        <div style={{position:'absolute',bottom:-2,left:0,right:0,height:'32px',background:'#0a1628',clipPath:'ellipse(60% 100% at 50% 100%)'}}/>
        <div style={{position:'relative',zIndex:1,width:'60px',height:'60px',borderRadius:'50%',background:'rgba(245,158,11,0.15)',border:'1.5px solid rgba(245,158,11,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:'1.6rem'}}>🏆</div>
        <h1 style={{position:'relative',zIndex:1,margin:0,fontWeight:900,fontSize:'1.3rem',color:'#fff',letterSpacing:'0.05em'}}>LEADERBOARD</h1>
        <p style={{position:'relative',zIndex:1,margin:'6px 0 0',fontSize:'0.8rem',color:'rgba(255,255,255,0.55)'}}>Top 10 pembeli terbaik Vechnost</p>
        <style>{`
          @keyframes bannerShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
          @keyframes orbL0{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,8px)}}
          @keyframes orbL1{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-6px)}}
          @keyframes orbL2{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,10px)}}
        `}</style>
      </div>

      <div style={{padding:'20px 16px 0'}}>
        <Board data={daily}   title="SULTAN HARI INI"   sub="hari ini" />
        <Board data={weekly}  title="SULTAN MINGGU INI" sub="minggu ini" />
        <Board data={monthly} title="SULTAN BULAN INI"  sub="bulan ini" />
      </div>
    </div>
  );
}