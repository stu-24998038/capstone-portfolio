const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  /\/$/,
  ''
);

export class ApiError extends Error {
  constructor(message, status = 0, errors = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const config = {
    method,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, config);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(
      `Cannot reach the API at ${API_URL}. Make sure the server is running and VITE_API_URL is correct.`,
      0
    );
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      (response.status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : `Request failed with status ${response.status}.`);
    throw new ApiError(message, response.status, payload?.errors);
  }

  return payload;
}

export const api = {
  baseUrl: API_URL,

  register: (data) => request('/users/register', { method: 'POST', body: data }),
  login: (data) => request('/users/login', { method: 'POST', body: data }),
  me: (token) => request('/users/me', { token }),

  projects: {
    list: () => request('/projects'),
    get: (id) => request(`/projects/${id}`),
    create: (data, token) => request('/projects', { method: 'POST', body: data, token }),
    update: (id, data, token) =>
      request(`/projects/${id}`, { method: 'PUT', body: data, token }),
    remove: (id, token) => request(`/projects/${id}`, { method: 'DELETE', token }),
  },

  blog: {
    list: () => request('/blog'),
    get: (id) => request(`/blog/${id}`),
    create: (data, token) => request('/blog', { method: 'POST', body: data, token }),
    update: (id, data, token) =>
      request(`/blog/${id}`, { method: 'PUT', body: data, token }),
    remove: (id, token) => request(`/blog/${id}`, { method: 'DELETE', token }),
  },

  comments: {
    list: (postId) => request(`/blog/${postId}/comments`),
    create: (postId, data, token) =>
      request(`/blog/${postId}/comments`, { method: 'POST', body: data, token }),
    remove: (postId, commentId, token) =>
      request(`/blog/${postId}/comments/${commentId}`, { method: 'DELETE', token }),
  },

  contact: {
    send: (data) => request('/contact', { method: 'POST', body: data }),
    list: (token) => request('/contact', { token }),
    markRead: (id, read, token) =>
      request(`/contact/${id}/read`, { method: 'PATCH', body: { read }, token }),
    remove: (id, token) => request(`/contact/${id}`, { method: 'DELETE', token }),
  },

  health: () => request('/health'),
};
