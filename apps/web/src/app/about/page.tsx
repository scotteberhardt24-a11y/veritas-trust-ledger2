'use client';
import { useEffect, useState } from 'react';
export default function AboutPage() {
  const [vis, setVis] = useState(false);
  useEffect(() => { setVis(true); }, []);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 40px', borderBottom: '1px solid var(--border)', background: 'rgba(2,15,46,0.92)', backdropFilter: 'blur(20px)' }}>
        <a href="/" style={{ textDecoration: 'none' }}><img src="/images/veritas-logo-dark.webp" alt="Veritas" style={{ height: 32 }} /></a>
        <a href="/" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: 12 }}>Home</a>
      </nav>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(30px)', transition: 'all 1s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '0.3em', marginBottom: 12 }}>ABOUT US</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 16 }}>Building the <span style={{ color: 'var(--gold-2)' }}>Trust Layer</span> for the Gig Economy</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>Veritas Network exists because trust should not start at zero every time you join a new platform. We are building the infrastructure that makes reputation portable, verified, and permanent.</p>
        </div>
        <div className="card-gold" style={{ padding: 32, marginBottom: 32, borderRadius: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Our Mission</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.9 }}>Every day, millions of gig workers lose their hard-earned reputation when they switch platforms. Veritas changes this with the TruScore — a universal reputation metric from 0 to 1000 that follows you everywhere. Backed by a tamper-proof hash-chain ledger, secured with escrow payments, and verified with cryptographic badges.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          {[{ icon: '🔍', title: 'Transparency', desc: 'Every transaction on an open, verifiable ledger.' }, { icon: '🛡', title: 'Trust', desc: 'Reputation earned through real work, portable across platforms.' }, { icon: '⚖️', title: 'Fairness', desc: 'Consensus-based dispute resolution for all parties.' }, { icon: '🔒', title: 'Security', desc: 'AES-256 encryption. Hash-chain integrity. Your data is yours.' }].map((v, i) => (
            <div key={i} className="card" style={{ padding: 24 }}><div style={{ fontSize: 28, marginBottom: 10 }}>{v.icon}</div><h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{v.title}</h3><p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>{v.desc}</p></div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}><a href="/#waitlist" className="btn btn-gold" style={{ textDecoration: 'none', fontSize: 15, padding: '14px 32px' }}>Join the Waitlist</a></div>
      </div>
    </div>
  );
}
