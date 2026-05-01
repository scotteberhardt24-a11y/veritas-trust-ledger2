'use client';
import "./globals.css";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface AuthUser { id: string; name: string; email: string; truScore: number; tier: string; role: string; serial?: string; emailVerified?: boolean; avatar_url?: string; is_verified?: boolean; jobs_completed?: number; total_earned?: number; avg_rating?: number; }
interface AuthCtx { user: AuthUser | null; token: string | null; login: (t: string, u: AuthUser) => void; logout: () => void; }
const AuthContext = createContext<AuthCtx>({ user: null, token: null, login: () => {}, logout: () => {} });
export function useAuth() { return useContext(AuthContext); }

const NAV = [
  { l: 'Dashboard', h: '/dashboard', i: '📊' },
  { l: 'Marketplace', h: '/marketplace', i: '🏪' },
  { l: 'Jobs', h: '/jobs', i: '💼' },
  { l: 'Trust Ledger', h: '/trust', i: '🔗' },
  { l: 'Escrow', h: '/escrow', i: '🔒' },
  { l: 'Templates', h: '/templates', i: '📋' },
  { l: 'Disputes', h: '/disputes', i: '⚖️' },
  { l: 'Analytics', h: '/analytics', i: '📈' },
  { l: 'Leaderboard', h: '/leaderboard', i: '🏆' },
  { l: 'Referrals', h: '/referrals', i: '🔗' },
  { l: 'Messages', h: '/messages', i: '💬' },
  { l: 'Notifications', h: '/notifications', i: '🔔' },
  { l: 'Settings', h: '/settings', i: '⚙️' },
];
const PUB = ['/','/login','/auth','/about','/contact','/pre-seed','/pitch-deck','/waitlist','/network','/privacy','/partners','/lookup','/verify','/verify-email','/reset-password','/forgot-password','/forgot-username','/embed','/onboarding'];

export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [m, setM] = useState(false);
  const [sb, setSb] = useState(false);
  const [um, setUm] = useState(false);
  const p = usePathname();
  const r = useRouter();
  useEffect(() => { const t = localStorage.getItem('veritas_token'); const u = localStorage.getItem('veritas_user'); if (t && u) { try { setToken(t); setUser(JSON.parse(u)); } catch {} } setM(true); }, []);
  useEffect(() => { setSb(false); setUm(false); }, [p]);
  function login(tok: string, u: AuthUser) { localStorage.setItem('veritas_token', tok); localStorage.setItem('veritas_user', JSON.stringify(u)); setToken(tok); setUser(u); }
  function logout() { localStorage.removeItem('veritas_token'); localStorage.removeItem('veritas_user'); setToken(null); setUser(null); r.push('/'); }
  const isPub = PUB.includes(p) || p.startsWith('/u/');
  const isAuth = p === '/login' || p === '/auth';
  const tc = (t: string) => ({ Starter:'#94a3b8', Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#ffd700', Platinum:'#e5e4e2', Diamond:'#b9f2ff' }[t] || '#94a3b8');
  return (
    <html lang="en"><head><link rel="icon" href="/images/vault-icon.png"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
    <body style={{ background:'#020f2e', minHeight:'100vh', margin:0 }}>
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {isAuth || isPub ? children : !m ? null : !user ? (() => { r.push('/login'); return null; })() : (
        <div style={{ display:'flex', minHeight:'100vh' }}>
          {sb && <div onClick={() => setSb(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:49 }} />}
          <aside className="sb" style={{ width:240, background:'linear-gradient(180deg,#040d24,#071435)', borderRight:'1px solid rgba(201,168,76,0.15)', display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, zIndex:50, transition:'transform 0.3s' }}>
            <div style={{ padding:'20px 16px 12px', borderBottom:'1px solid rgba(201,168,76,0.1)' }}><div style={{ fontFamily:'Georgia,serif', fontSize:18, color:'#c9a84c', fontWeight:700, letterSpacing:'0.1em' }}>VERITAS</div><div style={{ fontSize:10, color:'#4a5a80', letterSpacing:'0.15em' }}>TRUST LEDGER</div></div>
            <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
              {NAV.map(n => { const a = p === n.h; return <a key={n.h} href={n.h} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, marginBottom:1, textDecoration:'none', fontSize:13, color: a?'#c9a84c':'#8a9ac0', background: a?'rgba(201,168,76,0.08)':'transparent', borderLeft: a?'2px solid #c9a84c':'2px solid transparent', fontWeight: a?600:400 }}><span style={{ fontSize:15 }}>{n.i}</span>{n.l}</a>; })}
              {user?.role === 'admin' && (<>
                <div style={{ fontSize:9, fontFamily:'monospace', color:'#2a3a60', letterSpacing:'0.15em', padding:'12px 12px 4px', textTransform:'uppercase' }}>Admin</div>
                {[{l:'Admin Panel',h:'/admin',i:'🛡'},{l:'Badge Minting',h:'/badges',i:'🎖'}].map(n => <a key={n.h} href={n.h} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, textDecoration:'none', fontSize:13, color: p===n.h?'#c9a84c':'#8a9ac0', background: p===n.h?'rgba(201,168,76,0.08)':'transparent', borderLeft: p===n.h?'2px solid #c9a84c':'2px solid transparent' }}><span style={{ fontSize:15 }}>{n.i}</span>{n.l}</a>)}
              </>)}
            </nav>
            <div style={{ padding:16, borderTop:'1px solid rgba(201,168,76,0.1)' }}><div style={{ fontSize:11, color:'#4a5a80', marginBottom:4 }}>PostgreSQL · Redis · AES-256</div><div style={{ fontSize:10, color:'#2a3a60' }}>v2.0.0 · ES512</div></div>
          </aside>
          <div className="mn" style={{ flex:1, marginLeft:240, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
            <header style={{ borderBottom:'1px solid rgba(201,168,76,0.1)', background:'rgba(4,13,36,0.95)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:40 }}>
              <div style={{ height:2, background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 24px', height:56 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <button onClick={() => setSb(!sb)} className="hb" style={{ display:'none', background:'none', border:'none', color:'#c9a84c', fontSize:22, cursor:'pointer' }}>☰</button>
                  <div><div style={{ fontFamily:'Georgia,serif', fontSize:15, color:'#c9a84c', letterSpacing:'0.1em', fontWeight:700 }}>VERITAS</div><div style={{ fontSize:9, color:'#4a5a80', letterSpacing:'0.15em' }}>TRUTH BECOMES TRUST</div></div>
                  <span className="bc" style={{ fontSize:12, color:'#4a5a80', fontFamily:'monospace' }}>/ {NAV.find(n => n.h === p)?.l || 'Dashboard'}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <input placeholder="Search..." className="si" style={{ background:'#071435', border:'1px solid #0e2050', borderRadius:8, padding:'5px 12px', color:'#e8eaf6', fontSize:12, width:160, outline:'none' }} />
                  <a href="/notifications" style={{ fontSize:18, textDecoration:'none' }}>🔔</a>
                  <div style={{ position:'relative' }}>
                    <button onClick={() => setUm(!um)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', background:'none', border:'none', padding:0 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', overflow:'hidden', background: user.avatar_url?'none':`linear-gradient(135deg,${tc(user.tier)},#020f2e)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#020f2e', border:`2px solid ${tc(user.tier)}`, boxShadow:`0 0 12px ${tc(user.tier)}33` }}>
                        {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (user.name?.charAt(0)?.toUpperCase() || 'U')}
                      </div>
                      <div className="ui"><div style={{ fontSize:12, fontWeight:600, color:'#e8eaf6' }}>{user.name}</div><div style={{ fontSize:9, color:'#c9a84c', fontFamily:'monospace' }}>{user.tier} · {Number(user.truScore||0)}</div></div>
                    </button>
                    {um && (<div style={{ position:'absolute', top:'100%', right:0, marginTop:8, width:220, background:'linear-gradient(135deg,#071435,#0a1933)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:12, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.5)', zIndex:100 }}>
                      <div style={{ padding:16, borderBottom:'1px solid rgba(255,255,255,0.06)' }}><div style={{ fontSize:14, fontWeight:600 }}>{user.name}</div><div style={{ fontSize:10, color:'#6b8cce', fontFamily:'monospace', marginTop:2 }}>@{user.name?.toLowerCase().replace(/\s/g,'_')}</div><div style={{ fontSize:10, color: tc(user.tier), marginTop:4 }}>🛡 {user.tier} · Score: {Number(user.truScore||0)}</div></div>
                      {[{l:'📸 Upload Avatar',h:'/settings'},{l:'👤 My Passport',h:`/u/${user.name?.toLowerCase().replace(/\s/g,'_')}`},{l:'⚙️ Settings',h:'/settings'},{l:'🏆 Leaderboard',h:'/leaderboard'}].map(x => <a key={x.l} href={x.h} style={{ display:'block', padding:'10px 16px', fontSize:12, color:'#8a9ac0', textDecoration:'none', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>{x.l}</a>)}
                      <button onClick={logout} style={{ display:'block', width:'100%', padding:'10px 16px', fontSize:12, color:'#ef4444', background:'none', border:'none', textAlign:'left', cursor:'pointer' }}>🚪 Log Out</button>
                    </div>)}
                  </div>
                </div>
              </div>
            </header>
            <main style={{ flex:1, padding:'24px 32px' }} className="mp">{children}</main>
            <footer style={{ borderTop:'1px solid rgba(201,168,76,0.1)', padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:14, color:'#c9a84c' }}>🛡</span><span style={{ fontSize:10, color:'#2a3a60' }}>© 2026 Veritas Network</span></div>
              <div style={{ display:'flex', gap:16, fontSize:10, color:'#2a3a60' }}><a href="/privacy" style={{ color:'#2a3a60', textDecoration:'none' }}>Privacy</a><a href="/about" style={{ color:'#2a3a60', textDecoration:'none' }}>About</a><a href="/network" style={{ color:'#2a3a60', textDecoration:'none' }}>Network</a></div>
            </footer>
          </div>
        </div>
      )}
    </AuthContext.Provider>
    <style>{`@media(max-width:768px){.sb{transform:translateX(-100%)!important}.mn{margin-left:0!important}.hb{display:block!important}.si,.bc{display:none!important}.ui{display:none!important}.mp{padding:16px!important}}`}</style>
    </body></html>
  );
}
