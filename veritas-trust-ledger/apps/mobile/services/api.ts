import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/theme';

export async function getToken(): Promise<string | null> { try { return await SecureStore.getItemAsync('veritas_token'); } catch { return null; } }
export async function setToken(token: string): Promise<void> { await SecureStore.setItemAsync('veritas_token', token); }
export async function clearToken(): Promise<void> { await SecureStore.deleteItemAsync('veritas_token'); await SecureStore.deleteItemAsync('veritas_user_id'); await SecureStore.deleteItemAsync('veritas_user_name'); }
export async function getUserId(): Promise<string | null> { try { return await SecureStore.getItemAsync('veritas_user_id'); } catch { return null; } }

async function apiFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...opts.headers };
  return fetch(API_URL + path, { ...opts, headers });
}
async function apiJSON<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, opts); const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error ' + res.status); return data as T;
}

export interface AuthResult { token: string; userId: string; name: string; email: string; role: string; tier: string; serial?: string; }
export async function login(email: string, password: string): Promise<AuthResult> { const data = await apiJSON<AuthResult>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); await SecureStore.setItemAsync('veritas_token', data.token); await SecureStore.setItemAsync('veritas_user_id', data.userId); await SecureStore.setItemAsync('veritas_user_name', data.name); return data; }
export async function register(name: string, email: string, password: string): Promise<AuthResult> { const data = await apiJSON<AuthResult>('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }); await SecureStore.setItemAsync('veritas_token', data.token); await SecureStore.setItemAsync('veritas_user_id', data.userId); await SecureStore.setItemAsync('veritas_user_name', data.name); return data; }
export async function getMe() { return apiJSON<any>('/api/auth/me'); }
export async function getTruScore(userId: string) { return apiJSON<any>('/api/trust/truscore/' + userId); }
export async function verifySerial(serial: string) { return apiJSON<any>('/api/trust/verify/' + serial); }
export async function getEscrows(userId: string) { return apiJSON<any[]>('/api/escrow/user/' + userId); }
export async function createEscrow(data: { worker_id: string; title: string; amount: number }) { return apiJSON<any>('/api/escrow/create', { method: 'POST', body: JSON.stringify(data) }); }
export async function fundEscrow(escrowId: string) { return apiJSON<any>('/api/stripe/create-payment-intent', { method: 'POST', body: JSON.stringify({ escrow_id: escrowId }) }); }
export async function releaseEscrow(escrowId: string) { return apiJSON<any>('/api/stripe/release/' + escrowId, { method: 'POST' }); }
export async function getJobs(params?: { category?: string; search?: string }) { const qs = new URLSearchParams(params as Record<string,string>).toString(); return apiJSON<any[]>('/api/jobs' + (qs ? '?' + qs : '')); }
export async function applyToJob(jobId: string, coverNote?: string) { return apiJSON<any>('/api/jobs/' + jobId + '/apply', { method: 'POST', body: JSON.stringify({ cover_note: coverNote }) }); }
export async function getThreads() { return apiJSON<any[]>('/api/messages/threads'); }
export async function getMessages(threadId: string) { return apiJSON<any[]>('/api/messages/' + threadId); }
export async function sendMessage(threadId: string, content: string) { return apiJSON<any>('/api/messages/send', { method: 'POST', body: JSON.stringify({ thread_id: threadId, content }) }); }
export async function getNotifications() { return apiJSON<any[]>('/api/notifications'); }
export async function markAllRead() { return apiJSON<any>('/api/notifications/read-all', { method: 'POST' }); }
export async function registerPushToken(expoPushToken: string) { return apiFetch('/api/notifications/push-token', { method: 'POST', body: JSON.stringify({ token: expoPushToken }) }); }
export async function healthCheck() { try { const res = await fetch(API_URL + '/api/health'); return res.json(); } catch { return { status: 'offline' }; } }
