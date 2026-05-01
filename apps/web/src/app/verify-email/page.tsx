'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token.'); return; }
    fetch(API + '/api/auth/verify-email?token=' + token).then(r => r.json()).then(d => {
      if (d.success) { setStatus('success'); setMessage('Email verified!'); } else { setStatus('error'); setMessage(d.error || 'Failed.'); }
    }).catch(() => { setStatus('error'); setMessage('Network error.'); });
  }, [token]);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <a href="/"><img src="/images/veritas-logo-dark.webp" alt="Veritas" style={{ height: 36, marginBottom: 24 }} /></a>
        {status === 'loading' && <p style={{ color: 'var(--muted)' }}>Verifying...</p>}
        {status === 'success' && (<><div style={{ fontSize: 48 }}>✅</div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginTop: 12, marginBottom: 20 }}>{message}</h2><a href="/login" className="btn btn-gold" style={{ textDecoration: 'none', padding: '12px 28px' }}>Sign In</a></>)}
        {status === 'error' && (<><div style={{ fontSize: 48 }}>❌</div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginTop: 12, color: 'var(--danger)', marginBottom: 20 }}>{message}</h2><a href="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Back to Sign In</a></>)}
      </div>
    </div>
  );
}
export default function VerifyEmailPage() { return <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--navy)' }} />}><VerifyContent /></Suspense>; }
