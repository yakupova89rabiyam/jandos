/**
 * Centralized API client for JanDós.
 * - Automatically attaches Authorization header from localStorage
 * - On 401 → clears token and redirects to login
 * - Returns parsed JSON or throws with server error message
 */

const BASE_URL = '';

function getToken(): string | null {
  return localStorage.getItem('jandos_token');
}

function clearSession() {
  localStorage.removeItem('jandos_token');
  localStorage.removeItem('jandos_refresh_token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('jandos:logout'));
}

// ─── Refresh token logic ───────────────────────────────────────────────────────

let refreshingPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    const refreshToken = localStorage.getItem('jandos_refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        clearSession();
        return null;
      }

      const data = await response.json();
      localStorage.setItem('jandos_token', data.token);
      localStorage.setItem('jandos_refresh_token', data.refreshToken);
      return data.token as string;
    } catch {
      clearSession();
      return null;
    }
  })();

  try {
    return await refreshingPromise;
  } finally {
    refreshingPromise = null;
  }
}

// ─── Core request ─────────────────────────────────────────────────────────────

export async function request<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(BASE_URL + url, { ...options, headers });

  if (response.status === 401 && !url.includes('/api/auth/')) {
    const newToken = await tryRefresh();
    if (newToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      const retryResponse = await fetch(BASE_URL + url, { ...options, headers: retryHeaders });
      const retryData = await retryResponse.json().catch(() => null);
      if (!retryResponse.ok) {
        throw new Error(retryData?.error || retryData?.message || `Ошибка ${retryResponse.status}`);
      }
      return retryData as T;
    }
    clearSession();
    throw new Error('Сессия истекла. Войдите снова.');
  }

  if (response.status === 401) {
    clearSession();
    throw new Error('Сессия истекла. Войдите снова.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const base = data?.error || data?.message || `Ошибка ${response.status}`;
    const details = Array.isArray(data?.details)
      ? '\n' + data.details.map((d: any) => `• ${d.field || ''}: ${d.message}`).join('\n')
      : '';
    throw new Error(base + details);
  }

  return data as T;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  me: () => request<{ user: any }>('/api/auth/me'),

  login: async (email: string, password: string) => {
    const data = await request<{ token: string; refreshToken: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.refreshToken) localStorage.setItem('jandos_refresh_token', data.refreshToken);
    return data;
  },

  register: async (email: string, name: string, password: string) => {
    const data = await request<{ token: string; refreshToken: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
    if (data.refreshToken) localStorage.setItem('jandos_refresh_token', data.refreshToken);
    return data;
  },

  logout: () => {
    const refreshToken = localStorage.getItem('jandos_refresh_token');
    return request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).finally(() => {
      localStorage.removeItem('jandos_token');
      localStorage.removeItem('jandos_refresh_token');
    });
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; code?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyCode: (email: string, code: string) =>
    request<{ token: string }>('/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  updateProfile: (data: {
    name?: string; avatar?: string; phone?: string;
    birthday?: string; country?: string; city?: string; about?: string;
  }) =>
    request<{ user: any }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ─── Pets ──────────────────────────────────────────────────────────────────────

export const petsApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; status?: string; search?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ data: any[]; total: number; page: number; pages: number }>(`/api/pets${qs ? '?' + qs : ''}`);
  },
  getById: (id: number) => request<any>(`/api/pets/${id}`),
  create: (data: any) => request('/api/pets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request(`/api/pets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/api/pets/${id}`, { method: 'DELETE' }),
};

// ─── News ──────────────────────────────────────────────────────────────────────

export const newsApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ data: any[]; total: number; page: number; pages: number }>(`/api/news${qs ? '?' + qs : ''}`);
  },
  create: (data: any) => request('/api/news', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request(`/api/news/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/api/news/${id}`, { method: 'DELETE' }),
};

// ─── Fundraisers ───────────────────────────────────────────────────────────────

export const fundraisersApi = {
  getAll: () => request<any[]>('/api/fundraisers'),
  donate: (fundraiser_id: number, amount: number) =>
    request('/api/fundraisers/donate', { method: 'POST', body: JSON.stringify({ fundraiser_id, amount }) }),
  create: (data: any) => request('/api/fundraisers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request(`/api/fundraisers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/api/fundraisers/${id}`, { method: 'DELETE' }),
};

// ─── Adoption ──────────────────────────────────────────────────────────────────

export const adoptionApi = {
  getAll: () => request<any[]>('/api/adoption_requests'),
  submit: (pet_id: number, message?: string) =>
    request('/api/adoption_requests', { method: 'POST', body: JSON.stringify({ pet_id, message }) }),
  updateStatus: (id: number, status: string) =>
    request(`/api/adoption_requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ─── Volunteers ────────────────────────────────────────────────────────────────

export const volunteersApi = {
  getAll: () => request<any[]>('/api/volunteers'),
  apply: (skills?: string, experience?: string) =>
    request('/api/volunteers', { method: 'POST', body: JSON.stringify({ skills, experience }) }),
  updateStatus: (id: number, status: string) =>
    request(`/api/volunteers/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getShifts: () => request<any[]>('/api/volunteers/shifts'),
  createShift: (data: any) => request('/api/volunteers/shifts', { method: 'POST', body: JSON.stringify(data) }),
  updateShift: (id: number, data: any) => request(`/api/volunteers/shifts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteShift: (id: number) => request(`/api/volunteers/shifts/${id}`, { method: 'DELETE' }),
  getSlots: () => request<any[]>('/api/volunteers/slots'),
  getMySlots: () => request<any[]>('/api/volunteers/slots/mine'),
  signupSlot: (id: number) => request(`/api/volunteers/slots/${id}/signup`, { method: 'POST' }),
  cancelSlot: (id: number) => request(`/api/volunteers/slots/${id}/signup`, { method: 'DELETE' }),
  createSlot: (data: any) => request('/api/volunteers/slots', { method: 'POST', body: JSON.stringify(data) }),
  updateSlot: (id: number, data: any) => request(`/api/volunteers/slots/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSlot: (id: number) => request(`/api/volunteers/slots/${id}`, { method: 'DELETE' }),
};

// ─── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () => request<any[]>('/api/users'),
  changeRole: (id: number, role: string) =>
    request(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  ban: (id: number) => request(`/api/users/${id}/ban`, { method: 'POST' }),
  unban: (id: number) => request(`/api/users/${id}/unban`, { method: 'POST' }),
  getMyData: () => request<any>('/api/my_requests'),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  getMy: () => request<{ notifications: any[]; unreadCount: number }>('/api/notifications/my'),
  markRead: (id: number) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/api/notifications/read-all', { method: 'PATCH' }),
  broadcast: (title: string, message: string) =>
    request('/api/notifications/broadcast', { method: 'POST', body: JSON.stringify({ title, message }) }),
};

// ─── Media ────────────────────────────────────────────────────────────────────

export const mediaApi = {
  getAll: () => request<any[]>('/api/media'),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ id: number; url: string; filename: string }>('/api/media/upload', {
      method: 'POST',
      body: form,
    });
  },
  delete: (id: number) => request(`/api/media/${id}`, { method: 'DELETE' }),
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsApi = {
  getAll: () => request<Record<string, string>>('/api/settings'),
  update: (data: Record<string, string>) =>
    request('/api/settings', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const feedbackApi = {
  submit: (data: { name: string; email: string; subject?: string; message: string }) =>
    request('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => request<any[]>('/api/feedback'),
};

// ─── Graduates ────────────────────────────────────────────────────────────────

export const graduatesApi = {
  getAll: () => request<any[]>('/api/graduates'),
  create: (data: any) => request('/api/graduates', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/api/graduates/${id}`, { method: 'DELETE' }),
};

// ─── Needs ────────────────────────────────────────────────────────────────────

export const needsApi = {
  getAll: () => request<any[]>('/api/needs'),
  create: (data: any) => request('/api/needs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request(`/api/needs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/api/needs/${id}`, { method: 'DELETE' }),
  fulfill: (id: number) => request(`/api/needs/${id}/fulfill`, { method: 'POST' }),
};

// ─── Surrender Requests ───────────────────────────────────────────────────────

export const surrenderApi = {
  submit: (data: {
    full_name: string; iin?: string; phone: string; animal_type?: string;
    animal_gender?: string; health?: string; breed?: string; age?: string;
    reason?: string; address?: string;
  }) => request<{ id: number }>('/api/surrender', { method: 'POST', body: JSON.stringify(data) }),
  submitFormData: (formData: FormData) => fetch('/api/surrender', {
    method: 'POST',
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
      throw new Error(error.error || `Ошибка ${res.status}`);
    }
    return res.json();
  }),
  getAll: () => request<any[]>('/api/surrender'),
  updateStatus: (id: number, status: string) =>
    request(`/api/surrender/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ─── Guardianships ───────────────────────────────────────────────────────────

export const guardianshipsApi = {
  getMy: () => request<any[]>('/api/guardianships/my'),
  create: (pet_id: number, type: 'food' | 'treatment', monthly_amount: number) =>
    request<{ id: number }>('/api/guardianships', { method: 'POST', body: JSON.stringify({ pet_id, type, monthly_amount }) }),
  remove: (pet_id: number) =>
    request(`/api/guardianships/${pet_id}`, { method: 'DELETE' }),
};

// ─── Favorites ────────────────────────────────────────────────────────────────

export const favoritesApi = {
  getMy: () => request<any[]>('/api/favorites/my'),
  add: (pet_id: number) =>
    request('/api/favorites', { method: 'POST', body: JSON.stringify({ pet_id }) }),
  remove: (pet_id: number) =>
    request(`/api/favorites/${pet_id}`, { method: 'DELETE' }),
};

// ─── Promised Items ───────────────────────────────────────────────────────────

export const promisedItemsApi = {
  getMy: () => request<number[]>('/api/promised_items/my'),
  getMyFull: () => request<any[]>('/api/promised_items/my/full'),
  promise: (need_id: number) =>
    request('/api/promised_items', { method: 'POST', body: JSON.stringify({ need_id }) }),
  cancel: (need_id: number) =>
    request(`/api/promised_items/${need_id}`, { method: 'DELETE' }),
};

// ─── Donations ────────────────────────────────────────────────────────────────

export const donationsApi = {
  create: (amount: number, type: 'one-time' | 'basic' | 'extended', payment_method?: string) =>
    request<{ id: number; amount: number; type: string }>('/api/donations', {
      method: 'POST',
      body: JSON.stringify({ amount, type, payment_method }),
    }),
  getMy: () => request<any[]>('/api/donations/my'),
};

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const activityApi = {
  getRecent: () => request<any[]>('/api/activity'),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsApi = {
  get: () => request<any>('/api/analytics'),
};

// ─── Audit ────────────────────────────────────────────────────────────────────

export const auditApi = {
  getLogs: () => request<any[]>('/api/audit_logs'),
};
