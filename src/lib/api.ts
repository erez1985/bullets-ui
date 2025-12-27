// In development with Vite proxy, use /api. In production, use the full URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  count?: number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(response.status, data.error || 'An error occurred');
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error - is the server running?');
  }
}

// Notes API
export const notesApi = {
  getAll: (params?: { folderId?: string; tagId?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.folderId) searchParams.set('folderId', params.folderId);
    if (params?.tagId) searchParams.set('tagId', params.tagId);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return request<any[]>(`/notes${query ? `?${query}` : ''}`);
  },

  getOne: (id: string) => request<any>(`/notes/${id}`),

  create: (data: any) =>
    request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{}>(`/notes/${id}`, {
      method: 'DELETE',
    }),

  togglePin: (id: string) =>
    request<any>(`/notes/${id}/pin`, {
      method: 'PATCH',
    }),

  // Bullet operations
  addBullet: (noteId: string, data: { afterBulletId?: string; type?: string; indent?: number }) =>
    request<any>(`/notes/${noteId}/bullets`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBullet: (noteId: string, bulletId: string, data: any) =>
    request<any>(`/notes/${noteId}/bullets/${bulletId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteBullet: (noteId: string, bulletId: string) =>
    request<any>(`/notes/${noteId}/bullets/${bulletId}`, {
      method: 'DELETE',
    }),
};

// Folders API
export const foldersApi = {
  getAll: () => request<any[]>('/folders'),

  getOne: (id: string) => request<any>(`/folders/${id}`),

  create: (data: { name: string; icon?: string; parentId?: string }) =>
    request<any>('/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{}>(`/folders/${id}`, {
      method: 'DELETE',
    }),
};

// Tags API
export const tagsApi = {
  getAll: () => request<any[]>('/tags'),

  getOne: (id: string) => request<any>(`/tags/${id}`),

  create: (data: { name: string; color: string }) =>
    request<any>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{}>(`/tags/${id}`, {
      method: 'DELETE',
    }),

  getBullets: (id: string) => request<any[]>(`/tags/${id}/bullets`),
};

// People API
export const peopleApi = {
  getAll: () => request<any[]>('/people'),

  getOne: (id: string) => request<any>(`/people/${id}`),

  create: (data: { name: string; avatar?: string }) =>
    request<any>('/people', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{}>(`/people/${id}`, {
      method: 'DELETE',
    }),

  getBullets: (id: string) => request<any[]>(`/people/${id}/bullets`),
};

// Health check
export const healthCheck = () => request<{ message: string }>('/health');

export { ApiError };

