import { supabaseAdmin } from '@/lib/supabase';
import { formatIDR } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    const [ordersRes, productsRes, keysRes, categoriesRes] = await Promise.all([
      supabaseAdmin.from('orders').select('status,total_amount,created_at'),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('product_keys').select('is_used', { count: 'exact', head: true }).eq('is_used', false),
      supabaseAdmin.from('categories').select('id', { count: 'exact', head: true }),
    ]);

    const orders = ordersRes.data || [];
    const completed = orders.filter(o => o.status === 'completed');
    const pending = orders.filter(o => o.status === 'processing');
    const revenue = completed.reduce((s, o) => s + (o.total_amount || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayRevenue = completed.filter(o => o.created_at?.slice(0,10) === today).reduce((s,o)=>s+(o.total_amount||0),0);

    return {
      revenue, todayRevenue,
      totalOrders: orders.length,
      pendingOrders: pending.length,
      completedOrders: completed.length,
      products: productsRes.count || 0,
      freeKeys: keysRes.count || 0,
      categories: categoriesRes.count || 0,
      recentOrders: orders.slice(-6).reverse(),
    };
  } catch(e) {
    return { revenue:0, todayRevenue:0, totalOrders:0, pendingOrders:0, completedOrders:0, products:0, freeKeys:0, categories:0, recentOrders:[] };
  }
}

const Stat = ({ icon, label, value, sub, color = '#7c3aed' }) => (
  <div style={{ background:'#16161e', border:'1px solid #2a2a3a', borderRadius:16, padding:24 }}>
    <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
    <div style={{ fontSize:26, fontWeight:800, color:'#f1f0ff' }}>{value}</div>
    <div style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>{label}</div>
    {sub && <div style={{ fontSize:12, color:'#52526e', marginTop:4 }}>{sub}</div>}
  </div>
);

export default async function AdminDashboard() {
  const s = await getStats();
  return (
    <div style={{ padding:32, maxWidth:1100 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#f1f0ff', letterSpacing:'-0.5px' }}>Dashboard</h1>
        <p style={{ color:'#52526e', fontSize:14, marginTop:4 }}>Selamat datang di panel admin VECHNOST</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, marginBottom:32 }}>
        <Stat icon="💰" label="Total Revenue" value={formatIDR(s.revenue)} sub={`Hari ini: ${formatIDR(s.todayRevenue)}`} />
        <Stat icon="🧾" label="Total Pesanan" value={s.totalOrders} sub={`${s.completedOrders} selesai · ${s.pendingOrders} proses`} />
        <Stat icon="📦" label="Produk" value={s.products} sub={`${s.categories} kategori`} />
        <Stat icon="🔑" label="Stok Tersedia" value={s.freeKeys} sub="Key auto-delivery" />
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:15, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Aksi Cepat</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
          {[
            { label:'Tambah Produk',   href:'/admin/products/new', icon:'➕' },
            { label:'Kelola Kategori', href:'/admin/categories',   icon:'🏷️' },
            { label:'Lihat Pesanan',   href:'/admin/orders',       icon:'📋' },
            { label:'Tambah Stok',     href:'/admin/products',     icon:'🔑' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{
              background:'#16161e', border:'1px solid #2a2a3a',
              borderRadius:12, padding:16, textAlign:'center',
              textDecoration:'none', transition:'border-color 0.15s',
              display:'block'
            }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{a.icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#d1d5db' }}>{a.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      {s.recentOrders.length > 0 && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.1em' }}>Pesanan Terbaru</h2>
            <Link href="/admin/orders" style={{ fontSize:13, color:'#7c3aed', textDecoration:'none' }}>Lihat semua →</Link>
          </div>
          <div style={{ background:'#16161e', border:'1px solid #2a2a3a', borderRadius:16, overflow:'hidden' }}>
            {s.recentOrders.map((o, i) => (
              <div key={o.id || i} style={{ padding:'14px 20px', borderBottom: i < s.recentOrders.length-1 ? '1px solid #2a2a3a' : 'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#e5e7eb' }}>{o.product_name || '—'}</div>
                  <div style={{ fontSize:12, color:'#52526e', fontFamily:'monospace', marginTop:2 }}>{o.id}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#a78bfa' }}>{formatIDR(o.total_amount||0)}</div>
                  <div style={{ fontSize:11, marginTop:2, padding:'2px 8px', borderRadius:999, display:'inline-block',
                    background: o.status==='completed' ? 'rgba(16,185,129,0.15)' : o.status==='processing' ? 'rgba(124,58,237,0.15)' : 'rgba(245,158,11,0.15)',
                    color: o.status==='completed' ? '#34d399' : o.status==='processing' ? '#a78bfa' : '#fbbf24'
                  }}>{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
