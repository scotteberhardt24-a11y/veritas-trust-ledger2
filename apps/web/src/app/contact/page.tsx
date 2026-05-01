'use client';
import { useState, useEffect } from 'react';
export default function ContactPage() {
  const [vis, setVis] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  useEffect(() => { setVis(true); }, []);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 40px', borderBottom: '1px solid var(--border)', background: 'rgba(2,15,46,0.92)', backdropFilter: 'blur(20px)' }}>
        <a href="/" style={{ textDecoration: 'none' }}><img src="/images/veritas-logo-dark.webp" alt="Veritas" style={{ height: 32 }} /></a>
        <a href="/" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: 12 }}>Home</a>
      </nav>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px', opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(30px)', transition: 'all 1s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '0.3em', marginBottom: 12 }}>CONTACT US</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 12 }}>Get in <span style={{ color: 'var(--gold-2)' }}>Touch</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Questions, partnerships, or investment interest — we would love to hear from you.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card-gold" style={{ padding: 28, borderRadius: 16 }}>
            {!sent ? (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
                <div style={{ marginBottom: 14 }}><label className="v-label">Name</label><input className="v-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div style={{ marginBottom: 14 }}><label className="v-label">Email</label><input className="v-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                <div style={{ marginBottom: 14 }}><label className="v-label">Subject</label><select className="v-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}><option value="">Select</option><option>General</option><option>Partnership</option><option>Investment</option><option>Support</option></select></div>
                <div style={{ marginBottom: 20 }}><label className="v-label">Message</label><textarea className="v-input" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: 'vertical' }} required /></div>
                <button className="btn btn-gold" type="submit" style={{ width: '100%', padding: '12px 0' }}>Send Message</button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}><div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div><h3 style={{ fontSize: 18, marginBottom: 8 }}>Sent!</h3><p style={{ color: 'var(--muted)', fontSize: 13 }}>We will get back within 24 hours.</p></div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[{ icon: '📧', title: 'Email', value: 'hello@veritas-truscore.com' }, { icon: '💼', title: 'Investors', value: 'invest@veritas-truscore.com' }, { icon: '🤝', title: 'Partnerships', value: 'partners@veritas-truscore.com' }, { icon: '🌐', title: 'Website', value: 'veritas-truscore.com' }].map((c, i) => (
              <div key={i} className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}><span style={{ fontSize: 24 }}>{c.icon}</span><div><div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>{c.title.toUpperCase()}</div><div style={{ fontSize: 14, color: 'var(--cyan-2)', marginTop: 2 }}>{c.value}</div></div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
