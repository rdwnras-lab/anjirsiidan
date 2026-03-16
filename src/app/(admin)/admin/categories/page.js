'use client';
import { useEffect, useState } from 'react';

export default function CategoriesPage() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ name:'', slug:'', description:'', sort_order:0 });

  const load = () => {
    setLoading(true);
    fetch('/api/admin/categories').then(r => r.json()).then(d => { setCats(d || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const openNew  = () => { setEditing(null); setForm({ name:'', slug:'', description:'', sort_order: cats.length }); setModal(true); };
  const openEdit = c => { setEditing(c); setForm({ name:c.name, slug:c.slug, description:c.description||'', sort_order:c.sort_order||0 }); setModal(true); };
  const setF = k => e => setForm(f => ({
    ...f, [k]: e.target.value,
    ...(k === 'name' && !editing ? { slug: e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') } : {}),
  }));

  const save = async () => {
    if (!form.name) return alert('Nama wajib diisi');
    setSaving(true);
    const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories';
    await fetch(url, { method: editing ? 'PATCH' : 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setSaving(false); setModal(false); load();
  };

  const del    = async id => { if (!confirm('Hapus kategori ini? Semua produk di kategori ini tidak akan tampil.')) return; await fetch(`/api/admin/categories/${id}`, { method:'DELETE' }); load(); };
  const toggle = async (id, active) => { await fetch(`/api/admin/categories/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ is_active: !active }) }); load(); };

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kategori</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cats.length} kategori terdaftar</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          + Tambah Kategori
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat...</p>
          </div>
        ) : cats.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-600">
            <p className="text-3xl mb-2">📁</p>
            <p className="text-sm">Belum ada kategori</p>
            <button onClick={openNew} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Tambah sekarang</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {cats.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 dark:text-white">{c.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.is_active
                        ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
                    }`}>
                      {c.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">/{c.slug} {c.description && `· ${c.description}`}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(c)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => toggle(c.id, c.is_active)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 transition-colors">
                    {c.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button onClick={() => del(c.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-colors">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="w-full max-w-md rounded-2xl p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">{editing ? 'Edit' : 'Tambah'} Kategori</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Nama *</label>
                <input className={inputCls} value={form.name} onChange={setF('name')} placeholder="Game Top Up" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Slug (URL)</label>
                <input className={inputCls} value={form.slug} onChange={setF('slug')} placeholder="game-top-up" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Deskripsi</label>
                <input className={inputCls} value={form.description} onChange={setF('description')} placeholder="Opsional" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Urutan Tampil</label>
                <input type="number" className={inputCls} value={form.sort_order} onChange={setF('sort_order')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Batal
                </button>
                <button onClick={save} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
