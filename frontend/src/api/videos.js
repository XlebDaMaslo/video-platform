import api from './axiosInstance';
import axios from 'axios';

const publicApi = axios.create({ baseURL: '/api' });

/**
 * Разворачивает ответ DRF:
 *  - пагинированный объект { results: [] }  → возвращает results
 *  - уже массив                              → возвращает as-is
 *  - одиночный объект (детали видео)         → возвращает as-is
 * Никогда не возвращает undefined (TanStack Query v5 запрещает).
 */
const unwrapList = (r) => {
  const d = r?.data ?? r;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.results)) return d.results;
  return [];
};
const unwrapOne = (r) => r?.data ?? r ?? null;

// ─── Публичные эндпоинты ────────────────────────────────────────────────────
export const getVideos     = (params) => publicApi.get('/videos/', { params }).then(unwrapList);
export const getCategories = ()       => publicApi.get('/videos/categories/').then(unwrapList);
export const getVideo      = (id)     => publicApi.get(`/videos/${id}/`).then(unwrapOne);
export const getStreamUrl  = (id)     => publicApi.get(`/videos/${id}/stream/`).then(unwrapOne);
export const getComments   = (id)     => publicApi.get(`/videos/${id}/comments/`).then(unwrapList);

// ─── Авторизованные эндпоинты ───────────────────────────────────────────────
export const uploadVideo = (formData) =>
  api.post('/videos/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteVideo = (id) => api.delete(`/videos/${id}/`);
export const postComment = (id, text) => api.post(`/videos/${id}/comments/`, { text });
