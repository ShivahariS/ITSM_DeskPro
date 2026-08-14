import api from './client.js';

export const createChange = (payload) => api.post('/changes', payload).then((r) => r.data);
export const listChanges = () => api.get('/changes').then((r) => r.data);
export const getChange = (id) => api.get(`/changes/${id}`).then((r) => r.data);
export const listChangesByStatus = (status) =>
  api.get('/changes/by-status', { params: { status } }).then((r) => r.data);
export const submitChange = (id) => api.post(`/changes/${id}/submit`).then((r) => r.data);
export const updateChangeStatus = (id, status) =>
  api.patch(`/changes/${id}/status`, null, { params: { status } }).then((r) => r.data);

export const createCabReview = (id, payload) =>
  api.post(`/changes/${id}/cab-review`, payload).then((r) => r.data);
export const listCabReviews = (id) => api.get(`/changes/${id}/cab-reviews`).then((r) => r.data);

export const createImplementation = (id, payload) =>
  api.post(`/changes/${id}/implementation`, payload).then((r) => r.data);
export const getImplementation = (id) =>
  api.get(`/changes/${id}/implementation`).then((r) => r.data);
