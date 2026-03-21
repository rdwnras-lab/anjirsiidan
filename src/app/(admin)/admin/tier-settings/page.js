'use client';
import { useEffect, useState } from 'react';

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

const TIER_COLORS = {
  gold:     '#fbbf24',
  platinum: '#e2e8f0',
  member:   '#60a5fa',
  silver:   '#94a3b8',
  diamond:  '#67e8f9',
};

export default function TierSettingsPage() {
  const [tiers,   setTiers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({
    tier_name: '', min_spent: '', discount: '', color: '#fbbf24', is_active: true,
  });

  const load = () => {
    setLoading(true);
    fetch('/api/admin/tier-settings').then(r => r.json())
      .then(d => { setTiers(d || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ tier_name:'', min_spent:'', discount:'', color:'#fbbf24', is_active:true });
    setModal(true);
  };
  const openEdit = t => {
    setEditing(t);
    setForm({ tier_name:t.tier_name, min_spent:t.min_spent, discount:t.discount, color:t.color||'#fbbf24', is_active:t.is_active });
    setModal(true);
  };
  const setF  = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setFB = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  const save = async () => {
    if (!form.tier_name.trim()) return alert('Nama tier wajib diisi');
    const minSpent = parseInt(form.min_spent);
    const discount = parseFloat(form.discount);
    if (isNaN(minSpent) || minSpent < 0) return alert('Minimum belanja tidak valid');
    if (isNaN(discount) || discount < 0 || discount > 100) return alert('Diskon harus 0-100');
    setSaving(true);
    const body = { ...form, min_spent: minSpent, discount: discount / 100 };
    const url    = editing ? `/api/admin/tier-settings/${editing.id}` : '/api/admin/tier-settings';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.error) alert('Error: ' + data.error);
    setSaving(false); setModal(false); load();
  };

  const del = async id => {
    if (!confirm('Hapus tier ini?')) return;
    await fetch(`/api/admin/tier-settings/${id}`, { method:'DELETE' });
    load();
  };

  const toggle = async (id, cur) => {
    await fetch(`/api/admin/tier-settings/${id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ is_active: !cur }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pengaturan Tier</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Tier naik otomatis berdasarkan total belanja kumulatif user
          </p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          + Tambah Tier
        </button>
      </div>

      {/* Info box */}
      <div className="rounded-xl p-4 text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
        <strong>Cara kerja:</strong> Setiap order berhasil, total belanja user bertambah. Sistem otomatis upgrade tier jika sudah memenuhi minimum belanja. Tier <strong>member</strong> adalah default (min 0). Diskon diberikan ke user sesuai tier mereka.
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
          {tiers.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-3xl mb-2">🎖️</p>
              <p className="text-sm">Belum ada tier. Tambah tier sekarang.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Header */}
              <div className="grid grid-cols-5 px-5 py-3 bg-gray-50 dark:bg-white/[0.02] text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <span>Tier</span>
                <span>Min. Belanja</span>
                <span>Diskon</span>
                <span>Status</span>
                <span className="text-right">Aksi</span>
              </div>
              {tiers.map(t => (
                <div key={t.id} className="grid grid-cols-5 items-center px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  {/* Tier name */}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{background: t.color || '#fbbf24'}} />
                    <span className="font-bold text-sm" style={{color: t.color || '#fbbf24'}}>
                      {t.tier_name.toUpperCase()}
                    </span>
                  </div>
                  {/* Min spent */}
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Rp {parseInt(t.min_spent).toLocaleString('id-ID')}
                  </span>
                  {/* Discount */}
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {(parseFloat(t.discount) * 100).toFixed(0)}%
                  </span>
                  {/* Status */}
                  <button onClick={() => toggle(t.id, t.is_active)}
                    className={`inline-flex w-fit px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      t.is_active
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                    }`}>
                    {t.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(t)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => del(t.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => !saving && setModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {editing ? 'Edit Tier' : 'Tambah Tier'}
            </h2>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Nama Tier</label>
              <input className={inputCls} placeholder="contoh: gold, platinum, vip"
                value={form.tier_name} onChange={setF('tier_name')} />
              <p className="text-xs text-gray-400 mt-1">Gunakan huruf kecil, tanpa spasi</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Minimum Total Belanja (Rp)</label>
              <input className={inputCls} type="number" placeholder="1000000"
                value={form.min_spent} onChange={setF('min_spent')} />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Diskon (%)</label>
              <input className={inputCls} type="number" placeholder="5" min="0" max="100"
                value={form.discount} onChange={setF('discount')} />
              <p className="text-xs text-gray-400 mt-1">0 = tidak ada diskon, 10 = 10% off</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Warna</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.color} onChange={setF('color')}
                  className="w-12 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                <input className={inputCls} placeholder="#fbbf24"
                  value={form.color} onChange={setF('color')} />
              </div>
              <div className="flex gap-2 mt-2">
                {Object.entries(TIER_COLORS).map(([name, hex]) => (
                  <button key={name} onClick={() => setForm(f => ({...f, color: hex}))}
                    className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                    style={{background: hex, borderColor: form.color === hex ? '#1d4ed8' : 'transparent'}}
                    title={name} />
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={setFB('is_active')} className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
            </label>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(false)} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                Batal
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}