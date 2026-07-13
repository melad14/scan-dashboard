const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/v1' : 'https://scan-backend-nine.vercel.app/api/v1';

export const apiClient = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('adminToken');

  const headers = {
    'Content-Type': 'application/json',
    'Accept-Language': 'ar',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // If not on login page, redirect to login
    if (!window.location.pathname.endsWith('/login')) {
      window.location.href = '/login';
    }
  }

  const data = await response.json();

  if (!response.ok) {
    if (data.errorDetails) console.error('Server Error Details:', data.errorDetails);
    const error = new Error(data.message || 'حدث خطأ ما في الخادم');
    error.code = data.code || 'HTTP_ERROR';
    error.statusCode = response.status;
    error.errorDetails = data.errorDetails;
    throw error;
  }

  return data;
}
