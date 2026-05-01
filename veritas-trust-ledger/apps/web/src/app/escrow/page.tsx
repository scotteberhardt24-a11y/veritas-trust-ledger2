'use client';
import { useEffect, useState } from 'react';
import { apiGetUserEscrows } from '../../lib/api';
import type { Escrow } from '../../lib/types';
export default function EscrowPage() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  useEffect(() => { const userId = localStorage.getItem('veritas_user_id'); if (userId) { apiGetUserEscrows(userId).then((r) => { if (r.status === 'ok' && r.data) setEscrows(r.data); }); } }, []);
  const statusColor: Record<string, string> = { pending: 'text-yellow-400', funded: 'text-blue-400', released: 'text-green-400', disputed: 'text-red-400' };
  return (<div style={{ maxWidth: 1100 }}><div className="animate-fade-up" style={{ marginBottom: '1.5rem' }}><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>Escrow</h2></div>{escrows.length === 0 && <p style={{ color: 'var(--muted)' }}>No escrows yet.</p>}{escrows.map((e) => (<div key={e.escrow_id} className="card" style={{ marginBottom: '1rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><h3 style={{ fontWeight: 600 }}>{e.title}</h3><p style={{ fontSize: 13, color: 'var(--muted)' }}>${e.amount}</p></div><span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{e.status}</span></div></div>))}</div>);
}
