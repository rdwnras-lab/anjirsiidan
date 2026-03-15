'use client';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CategoriesPage() {
  const [cats, setCats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({ name:'', slug:'', description:'', icon:'', sort_order:0 });
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/admin/categories').then(r=>r.json()).then(d=>{ setCats(d||[]); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openNew   = () => { setEditing(null); setForm({ name:'', slug:'', description:'', icon:'', sort_order:0 }); setModal(true); };
  const openEdit  = c => { setEditing(c); setForm({ name:c.name, slug:c.slug, description:c.description||'', icon:c.icon||'', sort_order:c.sort_order||0 }); setModal(true); };
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value, ...(k==='name' && !editing ? { slug: e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') } : {}) }));

  const save = async () => {
    setSaving(true);
    const url    = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories';
    const method = editing ? 'PATCH' : 'POST';
    await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setSaving(false); setModal(false); load();
  };
  const del = async id => {
    if (!confirm('Hapus kategori ini?')) return;
    await fetch(`/api/admin/categories/${id}`, { method:'DELETE' });
    load();
  };
  const toggle = async (id, active) => {
    await fetch(`/api/admin/categories/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ is_active: !active }) });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-extrabold">Kategori</h1>
        <Button onClick={openNew}>+ Tambah Kategori</Button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-3">
          {cats.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon || '📁'}</span>
                <div>
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-xs text-muted">/{c.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${c.is_active ? 'bg-success/15 text-success border-success/20' : 'bg-white/5 text-muted border-border'}`}>{c.is_active ? 'Aktif' : 'Nonaktif'}</span>
                <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => toggle(c.id, c.is_active)}>{c.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Button>
                <Button size="sm" variant="danger" onClick={() => del(c.id)}>Hapus</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori'}>
        <div className="space-y-4">
          <Input label="Nama" value={form.name} onChange={set('name')} placeholder="Game Top Up" />
          <Input label="Slug (URL)" value={form.slug} onChange={set('slug')} placeholder="game-topup" />
          <Input label="Icon (emoji)" value={form.icon} onChange={set('icon')} placeholder="🎮" />
          <Input label="Deskripsi" value={form.description} onChange={set('description')} placeholder="Deskripsi kategori..." />
          <Input label="Urutan" type="number" value={form.sort_order} onChange={set('sort_order')} />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModal(false)}>Batal</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
