import api from './axiosInstance';

// Публичные эндпоинты — идут через api (interceptor читает токен из localStorage).
// login/register не требуют токена — если токена нет в localStorage,
// interceptor просто не добавит Authorization заголовок.
export const login    = (data) => api.post('/users/login/', data);
export const register = (data) => api.post('/users/register/', data);
export const getProfile = ()   => api.get('/users/profile/');
export const updateProfile = (data) => api.patch('/users/profile/', data);
