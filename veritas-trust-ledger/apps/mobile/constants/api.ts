import { API_URL } from './theme';
async function request(path: string, opts: RequestInit = {}) {
  try { const res = await fetch(API_URL + path, { ...opts, headers: { 'Content-Type': 'application/json', ...opts.headers } }); return res.json(); } catch { return null; }
}
export const api = {
  login: (email: string, password: string) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: { name: string; email: string; password: string; role: string }) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  health: () => request('/api/health'),
};
export { Colors } from './theme';
export const Radius = { sm: 8, md: 12, lg: 16, full: 999 };
