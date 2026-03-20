'use client';
import { useEffect, useState } from 'react';

const EWALLET_PROVIDERS = ['GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja', 'Lainnya'];
const BANK_PROVIDERS    = ['BCA', 'BNI', 'BRI', 'Mandiri', 'BSI', 'CIMB Niaga', 'SeaBank', 'Jago', 'Lainnya'];

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

export default function PaymentMethodsPage() {
  const [methods,  setMethods]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    type: 'ewallet', provider: 'GoPay', account_number: '',
    account_name: '', logo_url: '', is_active: true, sort_order: 0,
  });

  const load = () => {
    setLoading(true);
    fetch('/api/admin/payment-methods')
      .then(r => r.json())
      .then(d => { setMethods(d || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ type:'ewallet', provider:'GoPay', account_number:'', account_name:'', logo_url:'', is_active:true, sort_order:0 });
    setModal(true);
  };
  const openEdit = m => {
    setEditing(m);
    setForm({ type:m.type, provider:m.provider, account_number:m.account_number, account_name:m.account_name, logo_url:m.logo_url||'', is_active:m.is_active, sort_order:m.sort_order||0 });
    setModal(true);
  };
  const setF  = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setFB = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  const save = async () => {
    if (!form.account_number || !form.account_name) return alert('Nomor dan nama wajib diisi');
    setSaving(true);
    const url    = editing ? `/api/admin/payment-methods/${editing.id}` : '/api/admin/payment-methods';
    const method = editing ? 'PATCH' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setModal(false); load();
  };

  const del    = async id => { if (!confirm('Hapus metode ini?')) return; await fetch(`/api/admin/payment-methods/${id}`, { method:'DELETE' }); load(); };
  const toggle = async (id, cur) => { await fetch(`/api/admin/payment-methods/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ is_active: !cur }) }); load(); };

  const ewallets = methods.filter(m => m.type === 'ewallet');
  const banks    = methods.filter(m => m.type === 'bank');

  const providers = form.type === 'ewallet' ? EWALLET_PROVIDERS : BANK_PROVIDERS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Metode Pembayaran</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola rekening e-wallet dan bank transfer</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          + Tambah Rekening
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        </div>
      ) : (
        <div className="grid gap-6">

          {/* E-Wallet */}
          <Section title="E-Wallet" icon="📱" items={ewallets} onEdit={openEdit} onDelete={del} onToggle={toggle} />

          {/* Bank Transfer */}
          <Section title="Bank Transfer" icon="🏦" items={banks} onEdit={openEdit} onDelete={del} onToggle={toggle} />

        </div>
      )}

      {/* Modal */}
      {modal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => !saving && setModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {editing ? 'Edit Rekening' : 'Tambah Rekening'}
            </h2>

            {/* Tipe */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Tipe</label>
              <div className="flex gap-2">
                {['ewallet','bank'].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type:t, provider: t==='ewallet'?'GoPay':'BCA' }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${form.type===t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                    {t === 'ewallet' ? '📱 E-Wallet' : '🏦 Bank Transfer'}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Provider</label>
              <select value={form.provider} onChange={setF('provider')} className={inputCls}>
                {providers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Nomor Rekening */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                {form.type === 'ewallet' ? 'Nomor HP / ID' : 'Nomor Rekening'}
              </label>
              <input className={inputCls} placeholder={form.type==='ewallet'?'08xxxxxxxxxx':'1234567890'}
                value={form.account_number} onChange={setF('account_number')} />
            </div>

            {/* Atas Nama */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Atas Nama</label>
              <input className={inputCls} placeholder="Nama pemilik rekening"
                value={form.account_name} onChange={setF('account_name')} />
            </div>

            {/* Logo URL (opsional) */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Logo URL <span className="font-normal text-gray-400">(opsional)</span></label>
              <input className={inputCls} placeholder="https://..." value={form.logo_url} onChange={setF('logo_url')} />
            </div>

            {/* Active */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={setFB('is_active')} className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Aktif (tampil ke pembeli)</span>
            </label>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(false)} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
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

function Section({ title, icon, items, onEdit, onDelete, onToggle }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <span>{icon}</span>
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">{title}</h2>
        <span className="ml-auto text-xs text-gray-400">{items.length} rekening</span>
      </div>
      {items.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">Belum ada rekening {title}</div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {items.map(m => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4">
              {m.logo_url
                ? <img src={m.logo_url} alt={m.provider} className="w-9 h-9 rounded-lg object-contain border border-gray-100 dark:border-gray-700 bg-white p-0.5" />
                : <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 text-sm font-black">{m.provider.slice(0,2).toUpperCase()}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-white">{m.provider}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{m.account_number}</p>
                <p className="text-xs text-gray-400">{m.account_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onToggle(m.id, m.is_active)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${m.is_active ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                  {m.is_active ? 'Aktif' : 'Nonaktif'}
                </button>
                <button onClick={() => onEdit(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => onDelete(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
