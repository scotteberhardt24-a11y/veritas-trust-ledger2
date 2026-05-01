export const Colors = {
  navy: '#020f2e', navyLight: '#051a4a', navyMid: '#0a2560',
  gold: '#c9a84c', goldLight: '#e8c96d', goldDim: '#8a6f2e',
  cyan: '#00d4ff', cyanDim: '#00a3c4', white: '#ffffff', offWhite: '#f0f4ff',
  text: '#e8eaf6', textMuted: '#8a9ac0', textDim: '#4a5a80',
  green: '#00c896', greenDim: '#007a5a', red: '#ff4d6a', redDim: '#8a1a2a', orange: '#ff9f1c',
  card: '#071435', cardBorder: '#0e2050', divider: '#0c1e45',
};
export const Fonts = { display: 'serif', body: 'System' };
export const Radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };
export const Shadow = {
  gold: { shadowColor: '#c9a84c', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
};
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export const COLORS = {
  bg: '#020f2e', panel: '#050e24', card: '#071228', navy2: '#0a1933', navy3: '#0e1f3d',
  gold: '#c9a84c', gold2: '#f0c040', cyan: '#06b6d4', cyan2: '#22d3ee',
  success: '#22c55e', warning: '#f59e0b', danger: '#ef4444',
  white: '#e8f0ff', muted: '#6b8cce', muted2: '#3a5080',
  border: 'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.1)', borderGold: 'rgba(201,168,76,0.3)',
};
export const TIER_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  Starter: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: '🔹' },
  Bronze: { color: '#cd7f32', bg: 'rgba(205,127,50,0.1)', icon: '🥉' },
  Silver: { color: '#c0c0c0', bg: 'rgba(192,192,192,0.1)', icon: '🥈' },
  Gold: { color: '#f0c040', bg: 'rgba(240,192,64,0.1)', icon: '🥇' },
  Platinum: { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', icon: '💎' },
  Diamond: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: '💠' },
};
export function getTierColor(tier: string): string { return TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.color ?? COLORS.muted; }
