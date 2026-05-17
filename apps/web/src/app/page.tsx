'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(to bottom right,#020617,#0f172a,#111827)',
        color: 'white',
        padding: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginTop: 100,
          }}
        >
          <div style={{ fontSize: 72 }}>
            🛡️
          </div>

          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              marginBottom: 20,
            }}
          >
            Veritas Trust Ledger
          </h1>

          <p
            style={{
              fontSize: 22,
              opacity: 0.8,
              maxWidth: 800,
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            Decentralized trust verification, escrow protection,
            TruScore reputation, NFT credentials, and fraud-resistant
            digital identity infrastructure.
          </p>

          <div
            style={{
              marginTop: 40,
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
            }}
          >
            <Link href="/auth">
              <button style={primaryButton}>
                Launch Platform
              </button>
            </Link>

            <Link href="/dashboard">
              <button style={secondaryButton}>
                Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const primaryButton: React.CSSProperties = {
  padding: '16px 28px',
  borderRadius: 12,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 16,
};

const secondaryButton: React.CSSProperties = {
  padding: '16px 28px',
  borderRadius: 12,
  border: '1px solid #374151',
  background: 'transparent',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 16,
};