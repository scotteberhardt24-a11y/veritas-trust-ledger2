'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiLogin, apiRegister } from '../lib/api';
import { useAuth } from './layout';

const GIG_TYPES = [
  'Plumbing', 'Electrical', 'HVAC', 'Landscaping', 'Painting', 'Carpentry',
  'Cleaning', 'Moving', 'Handyman', 'Roofing', 'Flooring', 'Web Development',
  'Graphic Design', 'Writing', 'Marketing', 'Photography', 'Auto Repair',
  'Personal Training', 'Tutoring', 'Pet Care', 'Delivery', 'Other'
];

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'worker' | 'client'>('worker');
  const [gigTypes, setGigTypes] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const toggleGigType = (t: string) => {
    setGigTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'register') {
      if (!name || !email || !password || !phone) { setError('Please fill out all required fields'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    }

    const res = mode === 'login'
      ? await apiLogin(email, password)
      : await apiRegister(name, email, password, role, phone);

    setLoading(false);

    if (res.status === 'ok' && res.data) {
      const d = res.data as any;
      if (mode === 'register') {
        setSuccess('Account created! Check your email to verify, then sign in.');
        setMode('login');
        return;
      }
      login(d.token, {
        id: d.userId || d.user_id,
        name: d.name,
        email: d.email,
        truScore: Number(d.truscore || 0),
        tier: d.tier || 'Starter',
        role: d.role || 'worker',
      });
      router.push('/dashboard');
    } else {
      setError(res.error || 'Authentication failed');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: mode === 'register' ? 560 : 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/"><img src="/images/veritas-logo-dark.webp" alt="Veritas" style={{ height: 40, marginBottom: 16 }} /></a>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>
            {mode === 'login' ? 'Sign In' : 'Create Your Account'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            {mode === 'login' ? 'Welcome back to Veritas Network' : 'Join the transparent trust network'}
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: 12, marginBottom: 16, color: '#22c55e', fontSize: 13, textAlign: 'center' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label className="v-label">I am a...</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setRole('worker')}
                      style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: '2px solid ' + (role === 'worker' ? 'var(--gold)' : 'var(--border)'), background: role === 'worker' ? 'rgba(201,168,76,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>🔧</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: role === 'worker' ? 'var(--gold)' : 'var(--white)' }}>Gig Worker</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>I provide services</div>
                    </button>
                    <button type="button" onClick={() => setRole('client')}
                      style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: '2px solid ' + (role === 'client' ? 'var(--cyan)' : 'var(--border)'), background: role === 'client' ? 'rgba(6,182,212,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>💼</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: role === 'client' ? 'var(--cyan)' : 'var(--white)' }}>Customer</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>I hire for jobs</div>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div><label className="v-label">Full Name *</label><input className="v-input" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required /></div>
                  <div><label className="v-label">Phone Number *</label><input className="v-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(206) 555-1234" required /></div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="v-label">{role === 'worker' ? 'What services do you offer?' : 'What services do you need?'}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {GIG_TYPES.map(t => (
                      <button key={t} type="button" onClick={() => toggleGigType(t)}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, border: '1px solid ' + (gigTypes.includes(t) ? 'var(--gold)' : 'var(--border)'), background: gigTypes.includes(t) ? 'rgba(201,168,76,0.1)' : 'transparent', color: gigTypes.includes(t) ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="v-label">Address</label>
                  <input className="v-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" style={{ marginBottom: 8 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                    <input className="v-input" value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                    <input className="v-input" value={state} onChange={e => setState(e.target.value)} placeholder="State" />
                    <input className="v-input" value={zip} onChange={e => setZip(e.target.value)} placeholder="ZIP" />
                  </div>
                </div>
              </>
            )}

            <div style={{ marginBottom: 14 }}>
              <label className="v-label">Email *</label>
              <input className="v-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            <div style={{ marginBottom: mode === 'register' ? 14 : 8 }}>
              <label className="v-label">Password *</label>
              <input className="v-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required />
            </div>

            {mode === 'register' && (
              <div style={{ marginBottom: 14 }}>
                <label className="v-label">Confirm Password *</label>
                <input className="v-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
              </div>
            )}

            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12 }}>
                <a href="/forgot-password" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Forgot password?</a>
                <a href="/forgot-username" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Forgot username?</a>
              </div>
            )}

            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>{error}</p>}

            <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 800 }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
            {mode === 'login' ? (
              <>No account? <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>Register</button></>
            ) : (
              <>Have an account? <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>Sign In</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
