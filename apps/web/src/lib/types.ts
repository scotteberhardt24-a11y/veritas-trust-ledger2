export interface ApiResponse<T> { status: 'ok' | 'error'; data?: T; error?: string; }
export interface User { user_id: string; name: string; email: string; role: 'worker' | 'client' | 'admin'; tier: string; truscore: number; serial: string; jobs_completed: number; success_rate: number; avg_rating: number; balance: number; total_earned: number; is_verified: boolean; avatar_url?: string; }
export interface TruScore { userId: string; truScore: number; tier: string; history: { date: string; score: number }[]; }
export interface Escrow { escrow_id: string; client_id: string; worker_id: string; title: string; amount: number; milestones: { title: string; amount: number }[]; status: string; dispute_reason?: string; released_at?: string; created_at: string; }
export type TruScoreTier = 'Starter' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export const TIER_CONFIG: Record<TruScoreTier, { color: string; bg: string; icon: string; border: string; barColor: string }> = {
  Starter:  { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: '🔹', border: 'rgba(148,163,184,0.3)', barColor: '#94a3b8' },
  Bronze:   { color: '#cd7f32', bg: 'rgba(205,127,50,0.1)',  icon: '🥉', border: 'rgba(205,127,50,0.3)',  barColor: '#cd7f32' },
  Silver:   { color: '#c0c0c0', bg: 'rgba(192,192,192,0.1)', icon: '🥈', border: 'rgba(192,192,192,0.3)', barColor: '#c0c0c0' },
  Gold:     { color: '#f0c040', bg: 'rgba(240,192,64,0.1)',  icon: '🥇', border: 'rgba(240,192,64,0.3)',  barColor: '#f0c040' },
  Platinum: { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  icon: '💎', border: 'rgba(34,211,238,0.3)',  barColor: '#22d3ee' },
  Diamond:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: '💠', border: 'rgba(167,139,250,0.3)', barColor: '#a78bfa' },
};
