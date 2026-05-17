'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiLogin, apiRegister } from '../lib/api';

export function LoginScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'worker' | 'client'>('worker');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        const res = await apiRegister(
          name,
          email,
          password,
          role,
          phone
        );

        if (res.status === 'ok') {
          setSuccess('Account created successfully');

          if ((res.data as any)?.token) {
            localStorage.setItem(
              'veritas_token',
              (res.data as any).token
            );
          }

          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          setError(res.error || 'Registration failed');
        }
      }

      if (mode === 'login') {
        const res = await apiLogin(email, password);

        if (res.status === 'ok') {
          if ((res.data as any)?.token) {
            localStorage.setItem(
              'veritas_token',
              (res.data as any).token
            );
          }

          setSuccess('Login successful');

          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          setError(res.error || 'Login failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f172a',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 16,
          padding: 32,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Veritas Trust Ledger
        </h1>

        <p
          style={{
            marginBottom: 24,
            color: '#666',
          }}
        >
          {mode === 'login'
            ? 'Sign into your account'
            : 'Create your account'}
        </p>

        {error && (
         <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as 'worker' | 'client')
                }
                style={inputStyle}
              >
                <option value="worker">Worker</option>
                <option value="client">Client</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() =>
            setMode(mode === 'login' ? 'register' : 'login')
          }
          style={{
            marginTop: 16,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#2563eb',
          }}
        >
          {mode === 'login'
            ? 'Need an account? Register'
            : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginBottom: 16,
  borderRadius: 8,
  border: '1px solid #d1d5db',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};
