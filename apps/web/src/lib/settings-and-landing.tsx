'use client';

// ══════════════════════════════════════════════════════════════════════════════
// settings-page.tsx
// ══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';

export function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: 'Emma Johnson', email: 'emma@veritas.io',
    currentPass: '', newPass: '', confirmPass: '',
    notifEscrow: true, notifScore: true, notifDispute: true, notifPartner: false,
    twoFactor: false, publicProfile: true,
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <button onClick={onChange} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--cyan)' : 'var(--border-2)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, borderRadius: '50%',
          width: 18, height: 18, background: 'white',
          left: checked ? 23 : 3, transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="animate-fade-up" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>Settings</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Manage your profile, security, and notification preferences.</p>
      </div>

      <form onSubmit={handleSave}>

        <Section title="👤 Profile">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="v-label">Full Name</label>
              <input className="v-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="v-label">Email Address</label>
              <input className="v-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
        </Section>

        <Section title="🔐 Security">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="v-label">Current Password</label>
              <input className="v-input" type="password" value={form.currentPass} onChange={e => setForm(p => ({ ...p, currentPass: e.target.value }))} placeholder="••••••••" />
            </div>
            <div>
              <label className="v-label">New Password</label>
              <input className="v-input" type="password" value={form.newPass} onChange={e => setForm(p => ({ ...p, newPass: e.target.value }))} placeholder="••••••••" />
            </div>
            <div>
              <label className="v-label">Confirm Password</label>
              <input className="v-input" type="password" value={form.confirmPass} onChange={e => setForm(p => ({ ...p, confirmPass: e.target.value }))} placeholder="••••••••" />
            </div>
          </div>
          <Toggle label="Two-Factor Authentication" desc="Adds an extra layer of security to your account"
            checked={form.twoFactor} onChange={() => setForm(p => ({ ...p, twoFactor: !p.twoFactor }))} />
          <Toggle label="Public Profile" desc="Allow partner platforms to view your TruScore"
            checked={form.publicProfile} onChange={() => setForm(p => ({ ...p, publicProfile: !p.publicProfile }))} />
        </Section>

        <Section title="🔔 Notifications">
          <Toggle label="Escrow Updates" desc="Get notified when escrow status changes"
            checked={form.notifEscrow} onChange={() => setForm(p => ({ ...p, notifEscrow: !p.notifEscrow }))} />
          <Toggle label="Score Changes" desc="Get notified when your TruScore changes"
            checked={form.notifScore} onChange={() => setForm(p => ({ ...p, notifScore: !p.notifScore }))} />
          <Toggle label="Dispute Alerts" desc="Immediate alerts for any dispute activity"
            checked={form.notifDispute} onChange={() => setForm(p => ({ ...p, notifDispute: !p.notifDispute }))} />
          <Toggle label="Partner Updates" desc="News from Veritas partner platforms"
            checked={form.notifPartner} onChange={() => setForm(p => ({ ...p, notifPartner: !p.notifPartner }))} />
        </Section>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="submit" className="btn btn-gold">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>Changes saved successfully</span>}
        </div>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// landing-page.tsx  (shown at "/" — redirects logged-in users to /dashboard)
// ══════════════════════════════════════════════════════════════════════════════

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <style>{`
        @keyframes floatShield { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ animation: 'floatShield 4s ease-in-out infinite', fontSize: 64, marginBottom: 24 }}>🛡</div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.25em', color: 'var(--cyan)', marginBottom: 16, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 999, padding: '4px 18px' }}>
        VERITAS TRUST LEDGER
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--white)', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
        Truth Becomes Trust
      </h1>

      <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 520, lineHeight: 1.8, marginBottom: 40 }}>
        Portable reputation for gig workers and service buyers — cryptographically verified, tamper-proof, and accepted on every major platform.
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
        <a href="/dashboard" className="btn btn-gold" style={{ fontSize: 15, padding: '0.8rem 2rem' }}>
          Enter Dashboard →
        </a>
        <a href="/lookup" className="btn btn-outline" style={{ fontSize: 15, padding: '0.8rem 2rem' }}>
          Look Up a Score
        </a>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { val: '43,207', lbl: 'Verified Users' },
          { val: '$5.28M', lbl: 'Escrow Volume' },
          { val: '99.5%', lbl: 'Escrow Success' },
          { val: '17',    lbl: 'Partner Platforms' },
        ].map(s => (
          <div key={s.lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, color: 'var(--gold-2)', fontWeight: 500 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
