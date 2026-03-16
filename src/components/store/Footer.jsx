export default function Footer() {
  const name = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';
  return (
    <footer style={{borderTop:'1px solid #1e1e2e',padding:'32px 20px',marginTop:20}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontWeight:900,fontSize:16,color:'#a78bfa',marginBottom:4}}>{name}</div>
          <p style={{fontSize:12,color:'#52526e'}}>© {new Date().getFullYear()} {name}. Pembayaran aman via QRIS Pakasir.</p>
        </div>
        <div style={{display:'flex',gap:16}}>
          <a href="/orders" style={{fontSize:13,color:'#6b7280',textDecoration:'none'}}>Pesanan Saya</a>
          {process.env.NEXT_PUBLIC_WHATSAPP && <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`} target="_blank" rel="noreferrer" style={{fontSize:13,color:'#6b7280',textDecoration:'none'}}>WhatsApp</a>}
        </div>
      </div>
    </footer>
  );
}
