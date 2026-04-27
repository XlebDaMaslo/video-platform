import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Инициализация при первом импорте — подхватываем токен если он уже есть
;(function initToken() {
  const token = localStorage.getItem('access_token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
})()

// Request interceptor: всегда читаем свежий токен из localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    if (config.headers) delete config.headers['Authorization'];
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Никогда не ретрайим refresh эндпоинт
    if (original?.url?.includes('/users/token/refresh/')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) =>
        api({
          ...original,
          _retry: true,
          headers: { ...original.headers, Authorization: `Bearer ${token}` },
        })
      );
    }

    original._retry = true;
    isRefreshing = true;

    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      isRefreshing = false;
      localStorage.removeItem('access_token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post('/api/users/token/refresh/', { refresh });
      const newToken = data.access;

      localStorage.setItem('access_token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      processQueue(null, newToken);

      // Повторяем исходный запрос с новым токеном
      return api({
        ...original,
        _retry: true,
        headers: { ...original.headers, Authorization: `Bearer ${newToken}` },
      });
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
