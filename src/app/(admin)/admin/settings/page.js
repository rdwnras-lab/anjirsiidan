'use client';
import { useEffect, useState } from 'react';

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";
const labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5";

const DEFAULT_COLORS = {
  primary:     '#1d6fff',
  primary_dark:'#1450cc',
  accent:      '#60a5fa',
  bg_body:     '#0a1628',
  bg_card:     '#091828',
  bg_header:   '#0a1628',
  bg_footer:   '#050f1e',
  text_main:   '#e8f4ff',
  text_muted:  '#7bafd4',
  border:      '#0e2445',
  success:     '#10b981',
  danger:      '#ef4444',
  warning:     '#fbbf24',
};

const COLOR_LABELS = {
  primary:      'Warna Utama (Button, Link)',
  primary_dark: 'Warna Utama Gelap (Hover)',
  accent:       'Warna Aksen (Harga, Badge)',
  bg_body:      'Background Body',
  bg_card:      'Background Card',
  bg_header:    'Background Header/Navbar',
  bg_footer:    'Background Footer',
  text_main:    'Teks Utama',
  text_muted:   'Teks Redup',
  border:       'Warna Border',
  success:      'Warna Sukses (Hijau)',
  danger:       'Warna Error (Merah)',
  warning:      'Warna Peringatan (Kuning)',
};

export default function SettingsPage() {
  const [pakasirSlug,  setPakasirSlug]  = useState('');
  const [pakasirKey,   setPakasirKey]   = useState('');
  const [qrisUrl,      setQrisUrl]      = useState('');
  const [colors,       setColors]       = useState(DEFAULT_COLORS);
  const [loading,      setLoading]      = useState(true);
  const [savingPay,    setSavingPay]    = useState(false);
  const [savingColors, setSavingColors] = useState(false);
  const [msgPay,       setMsgPay]       = useState('');
  const [msgColors,    setMsgColors]    = useState('');

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.pakasir_slug)  setPakasirSlug(d.pakasir_slug);
      if (d.pakasir_key)   setPakasirKey(d.pakasir_key);
      if (d.qris_url)      setQrisUrl(d.qris_url);
      if (d.colors)        setColors({ ...DEFAULT_COLORS, ...d.colors });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const savePayment = async () => {
    setSavingPay(true); setMsgPay('');
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pakasir_slug: pakasirSlug, pakasir_key: pakasirKey, qris_url: qrisUrl }),
    });
    const d = await res.json();
    setMsgPay(d.ok ? 'Tersimpan!' : ('Error: ' + d.error));
    setSavingPay(false);
    setTimeout(() => setMsgPay(''), 3000);
  };

  const saveColors = async () => {
    setSavingColors(true); setMsgColors('');
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colors }),
    });
    const d = await res.json();
    setMsgColors(d.ok ? 'Tersimpan!' : ('Error: ' + d.error));
    setSavingColors(false);
    setTimeout(() => setMsgColors(''), 3000);
  };

  const resetColors = () => setColors(DEFAULT_COLORS);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pengaturan Sistem</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Konfigurasi payment gateway, QRIS, dan tema warna toko</p>
      </div>

      {/* ── Payment Gateway ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Payment Gateway (Pakasir)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Ganti project Pakasir untuk menerima pembayaran QRIS otomatis</p>
        </div>
        <div>
          <label className={labelCls}>Project Slug</label>
          <input className={inputCls} placeholder="contoh: my-store-id" value={pakasirSlug} onChange={e => setPakasirSlug(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>API Key</label>
          <input className={inputCls} placeholder="pak_live_xxxxxxxxxxxx" type="password" value={pakasirKey} onChange={e => setPakasirKey(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">API key tidak akan ditampilkan setelah disimpan. Kosongkan jika tidak ingin mengubah.</p>
        </div>
        <div>
          <label className={labelCls}>URL QR Code Manual (QRIS Statis)</label>
          <input className={inputCls} placeholder="https://i.ibb.co/xxx/qr.png" value={qrisUrl} onChange={e => setQrisUrl(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">URL gambar QR yang ditampilkan saat pembeli memilih QRIS Manual</p>
          {qrisUrl && (
            <img src={qrisUrl} alt="Preview QR" onError={e => e.target.style.display='none'}
              className="mt-2 h-24 w-24 object-contain rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-white" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={savePayment} disabled={savingPay}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {savingPay ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
          {msgPay && <span className={`text-sm font-semibold ${msgPay.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{msgPay}</span>}
        </div>
      </div>

      {/* ── Theme Colors ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Tema Warna Toko</h2>
            <p className="text-xs text-gray-400 mt-0.5">Sesuaikan warna setiap elemen tampilan toko</p>
          </div>
          <button onClick={resetColors}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Reset Default
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(colors).map(([key, val]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <input type="color" value={val}
                  onChange={e => setColors(p => ({ ...p, [key]: e.target.value }))}
                  className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-800" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">{COLOR_LABELS[key]}</p>
                <input
                  value={val}
                  onChange={e => setColors(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full text-xs mt-0.5 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none font-mono"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button onClick={saveColors} disabled={savingColors}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {savingColors ? 'Menyimpan...' : 'Simpan Warna'}
          </button>
          {msgColors && <span className={`text-sm font-semibold ${msgColors.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{msgColors}</span>}
        </div>
      </div>
    </div>
  );
}