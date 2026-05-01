'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../layout';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 180 }}>
      <div className="card-title"><span className="card-title-icon">{icon}</span>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || 'var(--white)', fontFamily: 'var(--font-mono)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const p = user || {};
  const score = Number(p.truScore || p.truscore || 0);
  const tier = p.tier || 'Starter';

  return (
    <div style={{ maxWidth: 1200 }} className="animate-fade-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 4 }}>Welcome back, {p.name || 'User'}</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Here is your Veritas overview</p>
      </div>

      <div className="card-gold" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontSize: 56, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--gold-2)' }}>{score}</div>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em' }}>{tier.toUpperCase()}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, background: 'var(--navy)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: Math.min(score / 10, 100) + '%', background: 'linear-gradient(90deg, var(--gold), var(--cyan))', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Serial: <span style={{ color: 'var(--cyan-2)', fontFamily: 'var(--font-mono)' }}>{p.serial || '—'}</span></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard icon="💼" label="Role" value={String(p.role || 'worker').toUpperCase()} color="var(--cyan-2)" />
        <StatCard icon="🛡" label="Tier" value={tier} color="var(--gold-2)" />
        <StatCard icon="✉️" label="Email Verified" value={p.emailVerified ? 'Yes' : 'Pending'} color={p.emailVerified ? 'var(--success)' : 'var(--warning)'} />
        <StatCard icon="🔗" label="Serial" value={p.serial ? p.serial.slice(0, 12) : '—'} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title"><span className="card-title-icon">📋</span>Getting Started</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
          {[
            { done: true, text: 'Account created' },
            { done: p.emailVerified, text: 'Verify your email' },
            { done: false, text: 'Complete your first job or post a gig' },
            { done: false, text: 'Build your TruScore to 100+' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 18 }}>{item.done ? '✅' : '⏳'}</span>
              <span style={{ fontSize: 13 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
