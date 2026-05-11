'use client';
// Enhanced Auth Screens with Turnstile & Better Error Messages
// apps/web/src/app/auth-screens-ENHANCED.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiLogin, apiRegister } from '../lib/api';
import { useAuth } from './layout';

// Turnstile component (loads Cloudflare widget)
function TurnstileWidget({ onVerify }: { onVerify: (token: string) => void }) {
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    // Load Cloudflare Turnstile script
    if (!document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      script.onload = () => setLoaded(true);
    } else {
      setLoaded(true);
    }
  }, []);

  return (
    <div
      className="cf-turnstile"
      data-sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY}
      data-callback="onTurnstileSuccess"
      data-theme="light"
      data-size="normal"
    />
  );
}

// Password Strength Indicator
function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const getColor = () => {
    if (strength <= 1) return '#EF4444'; // Red
    if (strength === 2) return '#F59E0B'; // Orange
    if (strength === 3) return '#F59E0B'; // Orange
    if (strength === 4) return '#10B981'; // Green
    return '#10B981'; // Strong green
  };

  const getLabel = () => {
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    if (strength === 4) return 'Strong';
    return 'Very Strong';
  };

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= strength ? getColor() : '#E5E7EB',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color: getColor(), fontWeight: 500 }}>
        Password strength: {getLabel()}
      </div>
    </div>
  );
}

// Error Message Component
function ErrorMessage({ error, onAction }: { error: any; onAction?: (action: string) => void }) {
  if (!error) return null;

  const isString = typeof error === 'string';
  const message = isString ? error : error.error || error.message;
  const action = isString ? null : error.action;
  const field = isString ? null : error.field;

  return (
    <div
      style={{
        background: '#FEE2E2',
        border: '1px solid #FCA5A5',
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'start',
        gap: 12
      }}
    >
      <div style={{ fontSize: 18 }}>⚠️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: '#991B1B', fontWeight: 500, marginBottom: 4 }}>
          {message}
        </div>
        {action && onAction && (
          <button
            onClick={() => onAction(action)}
            style={{
              fontSize: 12,
              color: '#DC2626',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              marginTop: 4
            }}
          >
            {action === 'login' && '→ Go to login'}
            {action === 'register' && '→ Create an account'}
            {action === 'forgot_password' && '→ Reset password'}
            {action === 'resend_verification' && '→ Resend verification email'}
            {action === 'contact_support' && '→ Contact support'}
          </button>
        )}
      </div>
    </div>
  );
}

// Success Message Component
function SuccessMessage({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      style={{
        background: '#D1FAE5',
        border: '1px solid #6EE7B7',
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'start',
        gap: 12
      }}
    >
      <div style={{ fontSize: 18 }}>✓</div>
      <div style={{ fontSize: 14, color: '#065F46', fontWeight: 500 }}>
        {message}
      </div>
    </div>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'worker' | 'client'>('worker');
  
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  // Handle error action buttons
  const handleErrorAction = (action: string) => {
    setError(null);
    if (action === 'login') setMode('login');
    if (action === 'register') setMode('register');
    if (action === 'forgot_password') router.push('/forgot-password');
    if (action === 'resend_verification') {
      // TODO: Implement resend verification
      setMode('verify');
    }
    if (action === 'contact_support') {
      window.location.href = 'mailto:support@veritas-truscore.com';
    }
  };

  // Validate field and show inline errors
  const validateField = (field: string, value: any) => {
    const errors = { ...fieldErrors };
    
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errors.email = !emailRegex.test(value);
    }
    
    if (field === 'password') {
      errors.password = value.length < 8 || !/\d/.test(value) || !/[!@#$%^&*]/.test(value);
    }
    
    if (field === 'confirmPassword') {
      errors.confirmPassword = value !== password;
    }
    
    if (field === 'phone') {
      const phoneDigits = value.replace(/\D/g, '');
      errors.phone = phoneDigits.length < 10;
    }
    
    setFieldErrors(errors);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      if (mode === 'register') {
        // Client-side validation
        if (!name || !email || !password || !phone) {
          setError('Please fill out all required fields');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError({ error: 'Passwords do not match', field: 'confirmPassword' });
          setLoading(false);
          return;
        }

        const res = await apiRegister(name, email, password, role, phone, turnstileToken);
        setLoading(false);

        if (res.status === 'ok') {
          setSuccess(res.message || 'Account created! Check your email to verify.');
          setMode('verify');
          return;
        }
      }

      if (mode === 'login') {
        const res = await apiLogin(email, password);
        setLoading(false);

        if (res.status === 'ok' && res.data) {
          const d = res.data as any;
          login(d.token, {
            id: d.userId || d.user_id,
            name: d.name,
            email: d.email,
            truScore: Number(d.truscore || 0),
            tier: d.tier || 'Starter',
            role: d.role || 'worker',
          });
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => router.push('/dashboard'), 1000);
          return;
        }
      }

      // If we get here, something went wrong
      setError(res.error || 'Something went wrong. Please try again.');
      setLoading(false);

    } catch (err: any) {
      setLoading(false);
      
      // Parse error response
      if (err.response?.data) {
        setError(err.response.data);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '2.5rem',
        maxWidth: 480,
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🛡️</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            marginBottom: 4,
            color: '#0A2540'
          }}>
            {mode === 'verify' ? 'Check Your Email' : mode === 'register' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>
            {mode === 'verify' 
              ? 'We sent you a verification link' 
              : 'Veritas Trust Ledger'}
          </p>
        </div>

        {mode === 'verify' ? (
          // Verification Mode
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: 64, marginBottom: '1rem' }}>📧</div>
            <p style={{ fontSize: 15, color: '#374151', marginBottom: '1.5rem' }}>
              We sent a verification link to<br/>
              <strong>{email}</strong>
            </p>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: '1.5rem' }}>
              Click the link in the email to activate your account. 
              Don't forget to check your spam folder!
            </p>
            <button
              onClick={() => {/* TODO: Resend */}}
              className="btn btn-outline"
              style={{ width: '100%' }}
            >
              Resend Verification Email
            </button>
            <button
              onClick={() => setMode('login')}
              style={{
                width: '100%',
                marginTop: 12,
                background: 'none',
                border: 'none',
                color: '#00D4AA',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              ← Back to login
            </button>
          </div>
        ) : (
          // Login/Register Form
          <form onSubmit={handleSubmit}>
            <ErrorMessage error={error} onAction={handleErrorAction} />
            <SuccessMessage message={success} />

            {mode === 'register' && (
              <>
                {/* Name */}
                <div style={{ marginBottom: 16 }}>
                  <label className="v-label">Full Name *</label>
                  <input
                    className="v-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>

                {/* Role Selection */}
                <div style={{ marginBottom: 16 }}>
                  <label className="v-label">I am a... *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setRole('worker')}
                      style={{
                        padding: 16,
                        border: `2px solid ${role === 'worker' ? '#00D4AA' : '#E5E7EB'}`,
                        borderRadius: 8,
                        background: role === 'worker' ? '#ECFDF5' : 'white',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500
                      }}
                    >
                      👷 Service Provider
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      style={{
                        padding: 16,
                        border: `2px solid ${role === 'client' ? '#00D4AA' : '#E5E7EB'}`,
                        borderRadius: 8,
                        background: role === 'client' ? '#ECFDF5' : 'white',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500
                      }}
                    >
                      💼 Client
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="v-label">Email Address *</label>
              <input
                className="v-input"
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  validateField('email', e.target.value);
                }}
                onBlur={() => validateField('email', email)}
                placeholder="name@example.com"
                disabled={loading}
                style={{
                  borderColor: fieldErrors.email ? '#EF4444' : undefined
                }}
              />
              {fieldErrors.email && (
                <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>
                  Please enter a valid email address
                </div>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label className="v-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="v-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (mode === 'register') validateField('password', e.target.value);
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                  style={{
                    borderColor: fieldErrors.password ? '#EF4444' : undefined,
                    paddingRight: 40
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 18
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {mode === 'register' && password && (
                <PasswordStrength password={password} />
              )}
              {fieldErrors.password && (
                <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>
                  Password must be 8+ characters with a number and special character
                </div>
              )}
            </div>

            {mode === 'register' && (
              <>
                {/* Confirm Password */}
                <div style={{ marginBottom: 16 }}>
                  <label className="v-label">Confirm Password *</label>
                  <input
                    className="v-input"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      validateField('confirmPassword', e.target.value);
                    }}
                    placeholder="••••••••"
                    disabled={loading}
                    style={{
                      borderColor: fieldErrors.confirmPassword ? '#EF4444' : undefined
                    }}
                  />
                  {fieldErrors.confirmPassword && (
                    <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>
                      Passwords do not match
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div style={{ marginBottom: 16 }}>
                  <label className="v-label">Phone Number *</label>
                  <input
                    className="v-input"
                    type="tel"
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      validateField('phone', e.target.value);
                    }}
                    placeholder="(555) 123-4567"
                    disabled={loading}
                    style={{
                      borderColor: fieldErrors.phone ? '#EF4444' : undefined
                    }}
                  />
                </div>

                {/* Cloudflare Turnstile */}
                {process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY && (
                  <div style={{ marginBottom: 16 }}>
                    <TurnstileWidget onVerify={setTurnstileToken} />
                  </div>
                )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-gold"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '1rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? (
                <span>⏳ {mode === 'register' ? 'Creating Account...' : 'Logging In...'}</span>
              ) : (
                mode === 'register' ? 'Create Account' : 'Sign In'
              )}
            </button>

            {/* Mode Toggle */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                  setSuccess('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00D4AA',
                  fontSize: 13,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {mode === 'register' 
                  ? '← Already have an account? Sign in' 
                  : "Don't have an account? Sign up →"}
              </button>
            </div>

            {mode === 'login' && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    fontSize: 12,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
