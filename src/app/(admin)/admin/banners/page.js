'use client';
import { useEffect, useState } from 'react';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ title:'', subtitle:'', image:'', link:'', sort_order:0, is_active:true });

  const load = () => {
    setLoading(true);
    fetch('/api/admin/banners').then(r => r.json()).then(d => { setBanners(d || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const openNew  = () => { setEditing(null); setForm({ title:'', subtitle:'', image:'', link:'', sort_order:0, is_active:true }); setModal(true); };
  const openEdit = b => { setEditing(b); setForm({ title:b.title||'', subtitle:b.subtitle||'', image:b.image||'', link:b.link||'', sort_order:b.sort_order||0, is_active:b.is_active??true }); setModal(true); };
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setFB = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  const save = async () => {
    setSaving(true);
    const url = editing ? `/api/admin/banners/${editing.id}` : '/api/admin/banners';
    await fetch(url, { method: editing ? 'PATCH' : 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setSaving(false); setModal(false); load();
  };
  const del    = async id => { if (!confirm('Hapus banner ini?')) return; await fetch(`/api/admin/banners/${id}`, { method:'DELETE' }); load(); };
  const toggle = async (id, active) => { await fetch(`/api/admin/banners/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ is_active: !active }) }); load(); };

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Banner Slider</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Maksimal 3 banner aktif di halaman toko</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          + Tambah Banner
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-600">
            <p className="text-3xl mb-2">🖼️</p>
            <p className="text-sm">Belum ada banner</p>
            <button onClick={openNew} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Tambah sekarang</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-28 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  {b.image
                    ? <img src={b.image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">{b.title || 'Tanpa Judul'}</p>
                  {b.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{b.subtitle}</p>}
                  {b.link && <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 truncate max-w-xs">{b.link}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.is_active ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'}`}>
                    {b.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button onClick={() => openEdit(b)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 transition-colors">Edit</button>
                  <button onClick={() => toggle(b.id, b.is_active)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 transition-colors">{b.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                  <button onClick={() => del(b.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-colors">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="w-full max-w-md rounded-2xl p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">{editing ? 'Edit' : 'Tambah'} Banner</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Judul Banner</label>
                <input className={inputCls} value={form.title} onChange={setF('title')} placeholder="PROMO SPESIAL" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Subjudul</label>
                <input className={inputCls} value={form.subtitle} onChange={setF('subtitle')} placeholder="Dapatkan harga terbaik" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">URL Gambar</label>
                <input className={inputCls} value={form.image} onChange={setF('image')} placeholder="https://i.imgur.com/xxx.jpg" />
                {form.image && <img src={form.image} alt="preview" className="mt-2 w-full h-24 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Link (saat diklik)</label>
                <input className={inputCls} value={form.link} onChange={setF('link')} placeholder="https://discord.gg/..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Urutan (0 = pertama)</label>
                <input type="number" className={inputCls} value={form.sort_order} onChange={setF('sort_order')} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={setFB('is_active')} className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Tampilkan di toko</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
                <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
