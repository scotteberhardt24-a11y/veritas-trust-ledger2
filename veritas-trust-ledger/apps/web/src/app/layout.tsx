'use client';
import "./globals.css";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface AuthUser { id: string; name: string; email: string; truScore: number; tier: string; role: string; serial?: string; emailVerified?: boolean; }
interface AuthCtx { user: AuthUser | null; token: string | null; login: (t: string, u: AuthUser) => void; logout: () => void; }
const AuthContext = createContext<AuthCtx>({ user: null, token: null, login: () => {}, logout: () => {} });
export function useAuth() { return useContext(AuthContext); }

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Jobs', href: '/jobs', icon: '💼' },
  { label: 'Trust Ledger', href: '/trust', icon: '🔗' },
  { label: 'Escrow', href: '/escrow', icon: '🔒' },
  { label: 'Disputes', href: '/disputes', icon: '⚖️' },
  { label: 'Analytics', href: '/analytics', icon: '📈' },
  { label: 'Messages', href: '/messages', icon: '💬' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

const PUBLIC_PAGES = ['/', '/login', '/auth', '/about', '/contact', '/pre-seed', '/pitch-deck', '/waitlist', '/privacy', '/partners', '/lookup', '/verify', '/verify-email', '/reset-password', '/forgot-password', '/forgot-username'];

export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('veritas_token');
    const u = localStorage.getItem('veritas_user');
    if (t && u) { try { setToken(t); setUser(JSON.parse(u)); } catch {} }
    setMounted(true);
  }, []);

  function login(tok: string, u: AuthUser) {
    localStorage.setItem('veritas_token', tok);
    localStorage.setItem('veritas_user', JSON.stringify(u));
    setToken(tok); setUser(u);
  }
  function logout() {
    localStorage.removeItem('veritas_token');
    localStorage.removeItem('veritas_user');
    setToken(null); setUser(null); router.push('/');
  }

  const isPublic = PUBLIC_PAGES.includes(pathname);
  const isAuth = pathname === '/login' || pathname === '/auth';
  const showShell = mounted && !isPublic && user;

  return (
    <html lang="en"><head><link rel="icon" href="/images/vault-icon.png" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
    <body style={{ background: '#020f2e', minHeight: '100vh', margin: 0 }}>
      <AuthContext.Provider value={{ user, token, login, logout }}>
        {isAuth || isPublic ? children : !mounted ? null : !user ? (() => { router.push('/login'); return null; })() : (
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* SIDEBAR */}
            <aside style={{ width: 240, background: 'linear-gradient(180deg, #040d24, #071435)', borderRight: '1px solid rgba(201,168,76,0.15)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, zIndex: 50 }}>
              <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                <img src="/images/veritas-badge-gold.png" alt="Veritas" style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: 8, objectFit: 'cover', objectPosition: 'top left' }} />
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#c9a84c', fontWeight: 700, letterSpacing: '0.1em' }}>VERITAS</div>
                <div style={{ fontSize: 10, color: '#4a5a80', letterSpacing: '0.15em' }}>TRUST LEDGER</div>
              </div>
              <nav style={{ flex: 1, padding: '12px 8px' }}>
                {NAV_ITEMS.map(item => {
                  const active = pathname === item.href;
                  return (
                    <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 2, textDecoration: 'none', fontSize: 13, color: active ? '#c9a84c' : '#8a9ac0', background: active ? 'rgba(201,168,76,0.08)' : 'transparent', borderLeft: active ? '2px solid #c9a84c' : '2px solid transparent', fontWeight: active ? 600 : 400, transition: 'all 0.2s' }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#4a5a80' }}>›</span>
                    </a>
                  );
                })}
                {user?.role === 'admin' && (
                  <a href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 13, color: pathname === '/admin' ? '#c9a84c' : '#8a9ac0', background: pathname === '/admin' ? 'rgba(201,168,76,0.08)' : 'transparent', borderLeft: pathname === '/admin' ? '2px solid #c9a84c' : '2px solid transparent' }}>
                    <span style={{ fontSize: 16 }}>🛡</span>Admin<span style={{ marginLeft: 'auto', fontSize: 10, color: '#4a5a80' }}>›</span>
                  </a>
                )}
              </nav>
              <div style={{ padding: 16, borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                <div style={{ fontSize: 11, color: '#4a5a80', marginBottom: 4 }}>PostgreSQL · Redis · AES-256</div>
                <div style={{ fontSize: 10, color: '#2a3a60' }}>v1.0.0 · ES512</div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              {/* TOP HEADER */}
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', height: 60, borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(4,13,36,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img src="/images/veritas-logo-light.png" alt="Veritas" style={{ height: 32 }} />
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#4a5a80' }}>{NAV_ITEMS.find(n => n.href === pathname)?.label || 'Dashboard'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input placeholder="Search Veritas..." style={{ background: '#071435', border: '1px solid #0e2050', borderRadius: 8, padding: '6px 14px', color: '#e8eaf6', fontSize: 12, width: 200, outline: 'none' }} />
                  <span style={{ fontSize: 18, cursor: 'pointer' }}>🔔</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/settings')}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #d4af37)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#020f2e' }}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e8eaf6' }}>{user?.name || 'User'}</div>
                      <div style={{ fontSize: 9, color: '#c9a84c', fontFamily: 'monospace' }}>{user?.tier || 'Starter'} · {Number(user?.truScore || 0)}</div>
                    </div>
                  </div>
                </div>
              </header>

              {/* PAGE CONTENT */}
              <main style={{ flex: 1, padding: 32 }}>{children}</main>

              {/* FOOTER */}
              <footer style={{ borderTop: '1px solid rgba(201,168,76,0.1)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src="/images/veritas-logo-dark.webp" alt="" style={{ height: 20, opacity: 0.5 }} />
                  <span style={{ fontSize: 10, color: '#2a3a60' }}>© 2025 Veritas Network. All rights reserved.</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#2a3a60' }}>
                  <a href="/privacy" style={{ color: '#2a3a60', textDecoration: 'none' }}>Privacy Policy</a>
                  <a href="/about" style={{ color: '#2a3a60', textDecoration: 'none' }}>Terms of Service</a>
                  <a href="/contact" style={{ color: '#2a3a60', textDecoration: 'none' }}>Contact</a>
                  <span>veritas-truscore.com</span>
                </div>
              </footer>
            </div>
          </div>
        )}
      </AuthContext.Provider>
    </body></html>
  );
}
