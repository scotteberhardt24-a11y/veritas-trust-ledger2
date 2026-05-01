'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function ResetContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (!token) return <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 48 }}>❌</div><p style={{ color: 'var(--muted)', marginTop: 12 }}>Invalid reset link.</p><a href="/forgot-password" className="btn btn-outline" style={{ textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>Request New Link</a></div></div>;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Min 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(API + '/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const d = await res.json();
      if (d.success) setDone(true); else setError(d.error || 'Failed');
    } catch { setError('Network error'); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}><a href="/"><img src="/images/veritas-logo-dark.webp" alt="Veritas" style={{ height: 36, marginBottom: 16 }} /></a><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Set New Password</h1></div>
        <div className="card" style={{ padding: '2rem' }}>
          {!done ? (
            <form onSubmit={handleSubmit}>
              <label className="v-label">New Password</label>
              <input className="v-input" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ marginBottom: 14 }} required />
              <label className="v-label">Confirm Password</label>
              <input className="v-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ marginBottom: 14 }} required />
              {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%', padding: '12px 0' }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}><div style={{ fontSize: 48, marginBottom: 12 }}>✅</div><h3 style={{ fontSize: 18, marginBottom: 20 }}>Password Reset!</h3><a href="/login" className="btn btn-gold" style={{ textDecoration: 'none', padding: '12px 28px' }}>Sign In</a></div>
          )}
        </div>
      </div>
    </div>
  );
}
export default function ResetPasswordPage() { return <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--navy)' }} />}><ResetContent /></Suspense>; }
