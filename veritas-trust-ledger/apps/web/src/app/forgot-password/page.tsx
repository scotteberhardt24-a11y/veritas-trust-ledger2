'use client';
import { useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch(API + '/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (res.ok) setSent(true); else { const d = await res.json(); setError(d.error || 'Failed'); }
    } catch { setError('Network error'); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/"><img src="/images/veritas-logo-dark.webp" alt="Veritas" style={{ height: 36, marginBottom: 16 }} /></a>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 4 }}>Reset Your Password</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Enter your email and we will send you a reset link.</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          {!sent ? (
            <form onSubmit={handleSubmit}>
              <label className="v-label">Email</label>
              <input className="v-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ marginBottom: 16 }} required />
              {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%', padding: '12px 0', fontSize: 14 }}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Check Your Email</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>If that email exists, a reset link has been sent.</p>
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 16 }}><a href="/login" style={{ color: 'var(--cyan)', fontSize: 13, textDecoration: 'none' }}>Back to Sign In</a></div>
        </div>
      </div>
    </div>
  );
}
