'use client';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// This page is intentionally NOT linked anywhere on the store
// Access: yourdomain.com/admin/login (keep this URL secret)
export default function AdminLoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'admin') router.push('/admin');
  }, [session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('admin-login', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Email atau password salah.');
    else router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-xl mx-auto mb-3">🔐</div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-dim block mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-accent/50 transition-all" />
          </div>
          <div>
            <label className="text-sm text-dim block mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-accent/50 transition-all" />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-h text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
