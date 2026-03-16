'use client';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.role === 'admin') router.replace('/admin');
  }, [session, status, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('admin-login', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Email atau password salah.');
    else router.replace('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#030a16'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-black text-2xl tracking-[0.3em] text-white" style={{fontFamily:'Rajdhani,sans-serif'}}>VECHNOST</p>
          <p className="text-sm mt-1" style={{color:'#60a5fa'}}>Admin Panel</p>
        </div>
        <div className="rounded-2xl p-8" style={{background:'#091828', border:'1px solid #0e2445'}}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm block mb-1.5" style={{color:'#7bafd4'}}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                style={{background:'#050f1e', border:'1px solid #0e2445', color:'#e8f4ff'}} />
            </div>
            <div>
              <label className="text-sm block mb-1.5" style={{color:'#7bafd4'}}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                style={{background:'#050f1e', border:'1px solid #0e2445', color:'#e8f4ff'}} />
            </div>
            {error && <p className="text-sm" style={{color:'#ef4444'}}>{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
              style={{background:'#1d6fff', color:'#fff'}}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
