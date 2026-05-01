'use client';
import { useState } from 'react';
import { apiVerifySerial } from '../../lib/api';
export default function VerifyPage() {
  const [serial, setSerial] = useState(''); const [result, setResult] = useState<{verified:boolean;message:string}|null>(null); const [loading, setLoading] = useState(false);
  async function handleVerify() { if (!serial.trim()) return; setLoading(true); const res = await apiVerifySerial(serial.trim()); setLoading(false); if (res.status === 'ok' && res.data) setResult(res.data); else setResult({ verified: false, message: res.error || 'Verification failed' }); }
  return (<div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Verify Badge</h1><p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Enter a Veritas serial number.</p><div style={{ display: 'flex', gap: 10 }}><input className="v-input" value={serial} onChange={e => setSerial(e.target.value)} placeholder="VTL-a1b2c3d4e5f6" style={{ fontFamily: 'var(--font-mono)' }} /><button className="btn btn-gold" onClick={handleVerify} disabled={loading}>{loading ? '...' : 'Verify'}</button></div>{result && <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 12, border: '1px solid', borderColor: result.verified ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)', color: result.verified ? '#22c55e' : '#ef4444' }}><p style={{ fontWeight: 600, fontSize: 18 }}>{result.verified ? '✓ Verified' : '✗ Not Found'}</p><p style={{ fontSize: 13, opacity: 0.8 }}>{result.message}</p></div>}</div>);
}
