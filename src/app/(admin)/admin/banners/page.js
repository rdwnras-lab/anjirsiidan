'use client';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', sort_order: 0, is_active: true });

  const load = () => fetch('/api/admin/banners').then(r => r.json()).then(d => { setBanners(d || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openNew  = () => { setEditing(null); setForm({ title: '', subtitle: '', image: '', link: '', sort_order: 0, is_active: true }); setModal(true); };
  const openEdit = b => { setEditing(b); setForm({ title: b.title || '', subtitle: b.subtitle || '', image: b.image || '', link: b.link || '', sort_order: b.sort_order || 0, is_active: b.is_active ?? true }); setModal(true); };
  const set      = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setB     = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  const save = async () => {
    setSaving(true);
    const url    = editing ? `/api/admin/banners/${editing.id}` : '/api/admin/banners';
    const method = editing ? 'PATCH' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setModal(false); load();
  };

  const del    = async id => { if (!confirm('Hapus banner ini?')) return; await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' }); load(); };
  const toggle = async (id, active) => { await fetch(`/api/admin/banners/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !active }) }); load(); };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Banner Slider</h1>
          <p className="text-xs text-muted mt-1">Maksimal 3 banner tampil di halaman utama</p>
        </div>
        <Button onClick={openNew}>+ Tambah Banner</Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-3">
          {banners.length === 0 && (
            <div className="text-center py-16 text-muted border border-border rounded-2xl">
              <p className="text-4xl mb-3">🖼️</p>
              <p className="font-semibold">Belum ada banner</p>
              <button onClick={openNew} className="text-sm text-accent-light mt-2">+ Tambah banner pertama</button>
            </div>
          )}
          {banners.map(b => (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
              {/* Preview */}
              <div className="w-24 h-14 rounded-xl overflow-hidden bg-surface flex-shrink-0 border border-border">
                {b.image
                  ? <img src={b.image} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
                }
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{b.title || 'Tanpa Judul'}</p>
                {b.subtitle && <p className="text-xs text-muted mt-0.5">{b.subtitle}</p>}
                {b.link && <p className="text-xs text-accent-light mt-0.5 truncate">{b.link}</p>}
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${b.is_active ? 'bg-success/15 text-success border-success/20' : 'bg-white/5 text-muted border-border'}`}>
                  {b.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
                <button onClick={() => openEdit(b)} className="text-xs bg-white/5 text-dim border border-border px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors">Edit</button>
                <button onClick={() => toggle(b.id, b.is_active)} className="text-xs bg-white/5 text-dim border border-border px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors">
                  {b.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button onClick={() => del(b.id)} className="text-xs bg-danger/10 text-danger border border-danger/20 px-3 py-1.5 rounded-xl hover:bg-danger/20 transition-colors">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Banner' : 'Tambah Banner'}>
        <div className="space-y-4">
          <Input label="Judul Banner" value={form.title} onChange={set('title')} placeholder="PROMO SPESIAL" />
          <Input label="Subjudul" value={form.subtitle} onChange={set('subtitle')} placeholder="Dapatkan harga terbaik" />
          <Input label="URL Gambar" value={form.image} onChange={set('image')} placeholder="https://i.imgur.com/xxx.jpg" />
          {form.image && <img src={form.image} alt="preview" className="w-full h-28 rounded-xl object-cover border border-border" />}
          <Input label="Link (klik banner)" value={form.link} onChange={set('link')} placeholder="https://discord.gg/..." />
          <Input label="Urutan (0 = pertama)" type="number" value={form.sort_order} onChange={set('sort_order')} />
          <label className="flex items-center gap-2 text-sm text-dim cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={setB('is_active')} className="w-4 h-4" />
            Aktif (tampil di toko)
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Batal</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
