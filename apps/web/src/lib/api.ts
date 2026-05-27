import type {
  ApiResponse,
  TruScore,
  Escrow,
  User,
} from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

/* =========================================================
   TOKEN HELPERS
========================================================= */

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem('veritas_token');
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('veritas_token', token);
  }
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('veritas_token');
  }
}

/* =========================================================
   AUTH HEADERS
========================================================= */

function authHeaders(): Record<string, string> {
  const token = getToken();

  return token
    ? {
        Authorization: 'Bearer ' + token,
      }
    : {};
}

/* =========================================================
   REQUEST WRAPPER
========================================================= */

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(API_BASE + path, {
      credentials: 'include',

      ...options,

      headers: {
        'Content-Type': 'application/json',

        ...authHeaders(),

        ...(options.headers ?? {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        status: 'error',
        error:
          data.error ??
          'HTTP ' + res.status,
      };
    }

    return {
      status: 'ok',
      data: data as T,
    };
  } catch (err) {
    return {
      status: 'error',
      error:
        err instanceof Error
          ? err.message
          : 'Network error',
    };
  }
}

/* =========================================================
   AUTH API
========================================================= */

export const apiRegister = (
  name: string,
  email: string,
  password: string,
  role?: string,
  phone?: string
) =>
  request<any>(
    '/api/auth/register',
    {
      method: 'POST',

      body: JSON.stringify({
        name,
        email,
        password,
        role: role || 'worker',
        phone: phone || '',
      }),
    }
  );

export const apiLogin = (
  email: string,
  password: string
) =>
  request<any>(
    '/api/auth/login',
    {
      method: 'POST',

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

export async function apiLogout() {
  clearToken();

  return request<any>(
    '/api/auth/logout',
    {
      method: 'POST',
    }
  );
}

export const apiGetMe = () =>
  request<User>(
    '/api/auth/me'
  );

/* =========================================================
   WALLET AUTH
========================================================= */

export const apiWalletNonce = (
  wallet: string
) =>
  request<any>(
    '/api/auth/wallet/nonce',
    {
      method: 'POST',

      body: JSON.stringify({
        wallet,
      }),
    }
  );

export const apiWalletVerify = (
  wallet: string,
  signature: string
) =>
  request<any>(
    '/api/auth/wallet/verify',
    {
      method: 'POST',

      body: JSON.stringify({
        wallet,
        signature,
      }),
    }
  );

/* =========================================================
   TRUST API
========================================================= */

export const apiGetTruScore = (
  userId: string
) =>
  request<TruScore>(
    '/api/trust/truscore/' +
      encodeURIComponent(userId)
  );

export const apiGetBadge = (
  userId: string
) =>
  request<any>(
    '/api/trust/badge/' +
      encodeURIComponent(userId)
  );

export const apiVerifySerial = (
  serial: string
) =>
  request<any>(
    '/api/trust/verify/' +
      encodeURIComponent(serial)
  );

/* =========================================================
   ESCROW API
========================================================= */

export const apiCreateEscrow = (
  payload: {
    worker_id: string;
    title: string;
    amount: number;
  }
) =>
  request<Escrow>(
    '/api/escrow/create',
    {
      method: 'POST',

      body: JSON.stringify(payload),
    }
  );

export const apiReleaseEscrow = (
  escrowId: string
) =>
  request<any>(
    '/api/escrow/' +
      encodeURIComponent(
        escrowId
      ) +
      '/release',
    {
      method: 'POST',
    }
  );

export const apiDisputeEscrow = (
  escrowId: string,
  reason: string
) =>
  request<any>(
    '/api/escrow/' +
      encodeURIComponent(
        escrowId
      ) +
      '/dispute',
    {
      method: 'POST',

      body: JSON.stringify({
        reason,
      }),
    }
  );

export const apiGetUserEscrows = (
  userId: string
) =>
  request<Escrow[]>(
    '/api/escrow/user/' +
      encodeURIComponent(userId)
  );

/* =========================================================
   JOB API
========================================================= */

export const apiGetJobs = (
  params?: {
    category?: string;
    search?: string;
  }
) => {
  const qs = params
    ? new URLSearchParams(
        params as Record<
          string,
          string
        >
      ).toString()
    : '';

  return request<any[]>(
    '/api/jobs' +
      (qs ? '?' + qs : '')
  );
};

export const apiCreateJob = (
  payload: {
    title: string;
    description: string;
    category: string;
    budget: number;
  }
) =>
  request<any>(
    '/api/jobs',
    {
      method: 'POST',

      body: JSON.stringify(payload),
    }
  );

export const apiApplyToJob = (
  jobId: string,
  coverNote?: string
) =>
  request<any>(
    '/api/jobs/' +
      encodeURIComponent(jobId) +
      '/apply',
    {
      method: 'POST',

      body: JSON.stringify({
        cover_note: coverNote,
      }),
    }
  );

/* =========================================================
   MESSAGES API
========================================================= */

export const apiGetThreads = () =>
  request<any[]>(
    '/api/messages/threads'
  );

export const apiGetMessages = (
  threadId: string
) =>
  request<any[]>(
    '/api/messages/' +
      encodeURIComponent(threadId)
  );

export const apiSendMessage = (
  threadId: string,
  recipientId: string,
  content: string
) =>
  request<any>(
    '/api/messages/send',
    {
      method: 'POST',

      body: JSON.stringify({
        thread_id: threadId,
        recipient_id: recipientId,
        content,
      }),
    }
  );

/* =========================================================
   NOTIFICATIONS API
========================================================= */

export const apiGetNotifications =
  () =>
    request<{
      notifications: any[];
      unread: number;
    }>('/api/notifications');

export const apiMarkAllRead =
  () =>
    request<any>(
      '/api/notifications/read-all',
      {
        method: 'POST',
      }
    );

/* =========================================================
   WAITLIST API
========================================================= */

export const apiJoinWaitlist = (
  username: string,
  email: string,
  referredBy?: string
) =>
  request<any>(
    '/api/waitlist/join',
    {
      method: 'POST',

      body: JSON.stringify({
        username,
        email,
        referred_by:
          referredBy,
      }),
    }
  );

export const apiCheckUsername = (
  username: string
) =>
  request<any>(
    '/api/waitlist/check/' +
      encodeURIComponent(username)
  );

export const apiGetWaitlistCount =
  () =>
    request<{
      total: number;
    }>('/api/waitlist/count');

/* =========================================================
   SYSTEM API
========================================================= */

export const apiHealth = () =>
  request<any>(
    '/api/health'
  );

export const apiGetFeed = () =>
  request<any[]>(
    '/api/feed'
  );