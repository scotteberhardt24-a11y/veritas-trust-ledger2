'use client';

import { useState } from 'react';
import { TIER_CONFIG, type TruScoreTier } from '../types';
import { apiGetTruScore, apiVerifySerial } from '../api';

type Tab = 'lookup' | 'verify';

function ScoreRing({ score, tier }: { score: number; tier: TruScoreTier }) {
  const cfg = TIER_CONFIG[tier];
  const r = 70; const circ = 2 * Math.PI * r;
  const filled = (score / 1000) * circ;
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <defs>
        <linearGradient id="lookupGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cfg.barColor} />
          <stop offset="100%" stopColor={cfg.color} />
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(26,58,143,0.3)" strokeWidth="12" />
      <circle cx="90" cy="90" r={r} fill="none"
        stroke="url(#lookupGrad)" strokeWidth="12"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round" transform="rotate(-90 90 90)"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x="90" y="82" textAnchor="middle" fill={cfg.color}
        fontSize="40" fontWeight="700" fontFamily="'DM Mono',monospace">{score}</text>
      <text x="90" y="104" textAnchor="middle" fill="#6b8cce"
        fontSize="13" fontFamily="'DM Sans',sans-serif">out of 1000</text>
    </svg>
  );
}

export default function LookupPage() {
  const [tab, setTab] = useState<Tab>('lookup');
  const [userId, setUserId] = useState('');
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true); setError(''); setResult(null);
    const res = await apiGetTruScore(userId.trim());
    if (res.status === 'ok') {
      setResult({ ...res.data, type: 'truscore' });
    } else {
      setError(res.error ?? 'Could not fetch score');
    }
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!serial.trim()) return;
    setLoading(true); setError(''); setResult(null);
    const res = await apiVerifySerial(serial.trim());
    if (res.status === 'ok') {
      setResult({ ...res.data, type: 'verify' });
    } else {
      setError(res.error ?? 'Invalid serial');
    }
    setLoading(false);
  }

  const tierCfg = result?.tier ? TIER_CONFIG[result.tier as TruScoreTier] : TIER_CONFIG.Gold;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🛡</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>
          TruScore Lookup
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          Search any Veritas user by ID to view their TruScore and trust tier, or verify a badge serial number to confirm authenticity.
        </p>
      </div>

      {/* Tabs */}
      <div className="animate-fade-up-2" style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4 }}>
        {(['lookup', 'verify'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setResult(null); setError(''); }}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: tab === t ? 'rgba(201,168,76,0.12)' : 'transparent',
              border: tab === t ? '1px solid var(--border-gold)' : '1px solid transparent',
              color: tab === t ? 'var(--gold-2)' : 'var(--muted)',
              fontSize: 14, fontWeight: tab === t ? 500 : 400,
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
            }}>
            {t === 'lookup' ? '🔍 Score Lookup' : '🏷 Badge Verify'}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="card-gold animate-fade-up-2" style={{ marginBottom: '1.5rem' }}>
        {tab === 'lookup' ? (
          <form onSubmit={handleLookup}>
            <label className="v-label">User ID or Username</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="v-input" value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="e.g. emma-j or user-123"
                autoComplete="off" spellCheck={false} />
              <button type="submit" className="btn btn-gold" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                {loading ? '⏳' : '🔍 Look Up'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <label className="v-label">Badge Serial Number</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="v-input" value={serial}
                onChange={e => setSerial(e.target.value.toUpperCase())}
                placeholder="VTX-EMMAJ-912-D24A"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                autoComplete="off" spellCheck={false} />
              <button type="submit" className="btn btn-cyan" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                {loading ? '⏳' : '✓ Verify'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              Format: VTX-USERNAME-SCORE-ID · Found on any Veritas badge
            </div>
          </form>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="animate-fade-up" style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--radius-md)', padding: '1rem',
          fontFamily: 'var(--font-mono)', fontSize: 13, color: '#f87171',
          marginBottom: '1.5rem',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Score Lookup Result */}
      {result?.type === 'truscore' && (
        <div className="animate-fade-up" style={{
          background: 'linear-gradient(135deg, #010c26, #041650)',
          border: `1px solid ${tierCfg.border}`,
          borderRadius: 'var(--radius-xl)', padding: '2rem',
          textAlign: 'center', marginBottom: '1.5rem',
        }}>
          <div className="tier-pill" style={{ borderColor: tierCfg.color, color: tierCfg.color, background: tierCfg.bg, marginBottom: 20, display: 'inline-flex' }}>
            {tierCfg.icon} {result.tier}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <ScoreRing score={result.truScore} tier={result.tier as TruScoreTier} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4 }}>{result.user}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>Verified Veritas Member</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Jobs Done',     val: result.jobsCompleted ?? '—' },
              { label: 'Success Rate',  val: result.successRate ? `${result.successRate}%` : '—' },
              { label: 'Escrow Vol.',   val: result.escrowVolume ? `$${(result.escrowVolume/1000).toFixed(0)}K` : '—' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 8px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: tierCfg.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="serial-display" style={{ textAlign: 'left' }}>
            🏷 Badge Serial: <span className="serial-value">
              VTX-{String(result.user).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-{result.truScore}
            </span>
          </div>
        </div>
      )}

      {/* Badge Verify Result */}
      {result?.type === 'verify' && (
        <div className="animate-fade-up" style={{
          background: result.verified ? 'linear-gradient(135deg, #010c26, #022010)' : 'linear-gradient(135deg, #010c26, #200202)',
          border: `1px solid ${result.verified ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius: 'var(--radius-xl)', padding: '2rem',
          textAlign: 'center', marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{result.verified ? '✅' : '❌'}</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8,
            color: result.verified ? 'var(--success)' : 'var(--danger)' }}>
            {result.verified ? 'Badge Verified' : 'Badge Not Found'}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            {result.message}
          </p>
          {result.verified && (
            <div className="serial-display" style={{ textAlign: 'left' }}>
              🏷 Serial: <span className="serial-value">{result.serial}</span>
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="card animate-fade-up-3">
        <div className="card-title"><span className="card-title-icon">ℹ️</span> How TruScore Works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '🛡', title: 'Tamper-proof ledger',  desc: 'Every score event is cryptographically signed and stored on the Veritas event ledger — immutable and auditable.' },
            { icon: '🌐', title: 'Universal & portable', desc: 'Your TruScore works on Craigslist, Angi, Thumbtack, and any partner platform — one reputation across the internet.' },
            { icon: '🔍', title: 'Instant verification',  desc: 'Anyone can verify a Veritas badge serial in seconds. Fake badges return an instant fail.' },
            { icon: '📈', title: 'Real-time updates',    desc: 'Scores update automatically as jobs are completed, escrows released, and reviews submitted.' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
