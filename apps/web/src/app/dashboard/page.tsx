'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { apiGetMe } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('veritas_token');

      if (!token) {
        router.push('/auth');
        return;
      }

      const res = await apiGetMe();

      if (res.status !== 'ok') {
        localStorage.removeItem('veritas_token');
        router.push('/auth');
        return;
      }

      setUser(res.data);

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#020617',
          color: 'white',
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        Loading Dashboard...
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(to bottom right,#020617,#0f172a,#111827)',
        color: 'white',
        padding: 32,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 40,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 42,
              fontWeight: 900,
            }}
          >
            Veritas Command Center
          </h1>

          <p
            style={{
              opacity: 0.7,
              marginTop: 6,
            }}
          >
            Trust identity + blockchain reputation infrastructure
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >

          <button
            onClick={() => {
              localStorage.removeItem('veritas_token');
              router.push('/auth');
            }}
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              border: 'none',
              background: '#dc2626',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(260px,1fr))',
          gap: 20,
        }}
      >
        <Card
          title="User"
          value={user?.name || 'Unknown'}
        />

        <Card
          title="Role"
          value={user?.role || 'worker'}
        />

        <Card
          title="Tier"
          value={user?.tier || 'Starter'}
        />

        <Card
          title="TruScore"
          value={String(user?.truscore || 0)}
        />

        <Card
          title="Wallet Status"
          value="READY"
        />

        <Card
          title="Verification"
          value={user?.is_verified ? 'VERIFIED' : 'PENDING'}
        />
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: 18,
        padding: 24,
      }}
    >
      <div
        style={{
          fontSize: 14,
          opacity: 0.7,
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}
