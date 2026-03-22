‘use client’;
import { useEffect, useState } from ‘react’;

const fmt = n => new Intl.NumberFormat(‘id-ID’, { style:‘currency’, currency:‘IDR’, minimumFractionDigits:0 }).format(n);
const fmtDate = d => new Date(d).toLocaleDateString(‘id-ID’, { day:‘numeric’, month:‘long’, year:‘numeric’, hour:‘2-digit’, minute:‘2-digit’ });

const statusStyle = {
pending:  ‘bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400’,
approved: ‘bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400’,
rejected: ‘bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400’,
};
const statusLabel = { pending:‘Menunggu’, approved:‘Disetujui’, rejected:‘Ditolak’ };

export default function AdminTopupPage() {
const [requests, setRequests] = useState([]);
const [loading,  setLoading]  = useState(true);
const [modal,    setModal]    = useState(null); // { req, action }
const [notes,    setNotes]    = useState(’’);
const [saving,   setSaving]   = useState(false);

const load = () => {
setLoading(true);
fetch(’/api/admin/topup’).then(r => r.json())
.then(d => { setRequests(d || []); setLoading(false); });
};
useEffect(() => { load(); }, []);

const openModal = (req, action) => { setModal({ req, action }); setNotes(’’); };
const closeModal = () => { setModal(null); setNotes(’’); };

const submit = async () => {
if (!modal) return;
setSaving(true);
const res = await fetch(`/api/admin/topup/${modal.req.id}`, {
method: ‘PATCH’,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({ action: modal.action, admin_notes: notes }),
});
const data = await res.json();
if (data.error) { alert(’Error: ’ + data.error); }
setSaving(false);
closeModal();
load();
};

const pending  = requests.filter(r => r.status === ‘pending’);
const history  = requests.filter(r => r.status !== ‘pending’);

return (
<div className="space-y-6">
<div>
<h1 className="text-2xl font-bold text-gray-800 dark:text-white">Topup Saldo</h1>
<p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
{pending.length} request menunggu persetujuan
</p>
</div>

```
  {/* Pending */}
  {pending.length > 0 && (
    <div className="rounded-2xl border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-900/10 overflow-hidden">
      <div className="px-5 py-3 border-b border-yellow-200 dark:border-yellow-900/40">
        <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">⏳ Menunggu Persetujuan</p>
      </div>
      <div className="divide-y divide-yellow-100 dark:divide-yellow-900/30">
        {pending.map(r => (
          <div key={r.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-800 dark:text-white">{r.user_name || r.discord_id}</p>
                <span className="text-xs font-black text-green-600 dark:text-green-400">{fmt(r.amount)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(r.created_at)}</p>
              {r.payment_methods && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Via: {r.payment_methods.provider} ({r.payment_methods.account_number})</p>
              )}
              {r.notes && <p className="text-xs text-gray-400 dark:text-gray-500 italic">"{r.notes}"</p>}
              {r.proof_url && (
                <a href={r.proof_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Lihat Bukti Transfer
                </a>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openModal(r, 'approve')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 transition-colors">
                ✓ Setujui
              </button>
              <button onClick={() => openModal(r, 'reject')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-colors">
                ✗ Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* History */}
  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02]">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Riwayat</p>
    </div>
    {loading ? (
      <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/></div>
    ) : history.length === 0 ? (
      <div className="py-12 text-center text-gray-400 dark:text-gray-600">
        <p className="text-3xl mb-2">💳</p><p className="text-sm">Belum ada riwayat topup</p>
      </div>
    ) : (
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {history.map(r => (
          <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{r.user_name || r.discord_id}</p>
              <p className="text-xs text-gray-400 mt-0.5">{fmtDate(r.created_at)}</p>
              {r.admin_notes && <p className="text-xs text-gray-400 italic mt-0.5">"{r.admin_notes}"</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{fmt(r.amount)}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusStyle[r.status]}`}>
                {statusLabel[r.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Modal */}
  {modal && (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={closeModal}/>
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6">
        <h2 className="text-base font-bold text-gray-800 dark:text-white mb-1">
          {modal.action === 'approve' ? '✅ Setujui Topup' : '❌ Tolak Topup'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {modal.req.user_name} — <strong>{fmt(modal.req.amount)}</strong>
        </p>
        {modal.req.proof_url && (
          <img src={modal.req.proof_url} alt="Bukti" className="w-full rounded-xl mb-4 max-h-40 object-contain bg-gray-100 dark:bg-gray-800"/>
        )}
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          {modal.action === 'approve' ? 'Catatan (opsional)' : 'Alasan penolakan (opsional)'}
        </label>
        <textarea
          rows={2} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={modal.action === 'approve' ? 'Contoh: Sudah diverifikasi' : 'Contoh: Bukti tidak jelas'}
          className="w-full rounded-xl px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 mb-4 resize-none"
        />
        <div className="flex gap-3">
          <button onClick={closeModal} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
            Batal
          </button>
          <button onClick={submit} disabled={saving}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 ${modal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
            {saving ? 'Memproses...' : modal.action === 'approve' ? 'Setujui' : 'Tolak'}
          </button>
        </div>
      </div>
    </>
  )}
</div>
```

);
}