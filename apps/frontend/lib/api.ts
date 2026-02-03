const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'An error occurred');
  }

  return data.data;
}

// Auth
export const authApi = {
  syncUser: (token: string, data: { name?: string; avatar?: string }) =>
    fetchApi('/auth/sync', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  getMe: (token: string) => fetchApi('/auth/me', { token }),
};

// Assets
export const assetsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/assets${query}`);
  },
  getBySlug: (slug: string) => fetchApi(`/assets/${slug}`),
  getMyAssets: (token: string) =>
    fetchApi('/assets/seller/mine', { token }),
  create: (token: string, formData: FormData) =>
    fetch(`${API_URL}/api/assets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => res.json()),
  update: (token: string, id: string, formData: FormData) =>
    fetch(`${API_URL}/api/assets/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => res.json()),
  publish: (token: string, id: string) =>
    fetchApi(`/assets/${id}/publish`, { method: 'POST', token }),
  delete: (token: string, id: string) =>
    fetchApi(`/assets/${id}`, { method: 'DELETE', token }),
};

// Orders
export const ordersApi = {
  create: (token: string, assetIds: string[]) =>
    fetchApi<{ order: unknown; checkoutUrl: string }>('/orders', {
      method: 'POST',
      token,
      body: JSON.stringify({ assetIds }),
    }),
  getMyOrders: (token: string) => fetchApi('/orders', { token }),
  getOrder: (token: string, id: string) =>
    fetchApi(`/orders/${id}`, { token }),
  getPurchasedAssets: (token: string) =>
    fetchApi('/orders/purchased-assets', { token }),
  getSellerOrders: (token: string) =>
    fetchApi('/orders/seller', { token }),
};

// Downloads
export const downloadsApi = {
  getDownloadUrl: (token: string, assetId: string) =>
    fetchApi<{ url: string; expiresAt: string; fileName: string }>(
      `/downloads/${assetId}`,
      { token }
    ),
  getHistory: (token: string) => fetchApi('/downloads', { token }),
  canDownload: (token: string, assetId: string) =>
    fetchApi<{ canDownload: boolean }>(`/downloads/check/${assetId}`, { token }),
};

// Users
export const usersApi = {
  getProfile: (token: string) => fetchApi('/users/profile', { token }),
  updateProfile: (token: string, data: Record<string, unknown>) =>
    fetchApi('/users/profile', {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),
  becomeSeller: (token: string, data: { storeName: string; storeDescription?: string }) =>
    fetchApi('/users/become-seller', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  getSellerStats: (token: string) =>
    fetchApi('/users/seller/stats', { token }),
};

// Admin
export const adminApi = {
  getAssets: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/admin/assets${query}`, { token });
  },
  updateAssetStatus: (token: string, id: string, status: string) =>
    fetchApi(`/admin/assets/${id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }),
  getUsers: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/admin/users${query}`, { token });
  },
  updateUserRole: (token: string, id: string, role: string) =>
    fetchApi(`/admin/users/${id}/role`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ role }),
    }),
  getOrders: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/admin/orders${query}`, { token });
  },
  getAnalytics: (token: string) => fetchApi('/admin/analytics', { token }),
};
