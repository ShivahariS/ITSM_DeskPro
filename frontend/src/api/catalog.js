import api from './client.js';

// Service catalog items
export const listCatalog = () => api.get('/catalog').then((r) => r.data);
export const getCatalogItem = (id) => api.get(`/catalog/${id}`).then((r) => r.data);
export const createCatalogItem = (payload) => api.post('/catalog', payload).then((r) => r.data);
export const updateCatalogItem = (id, payload) =>
  api.put(`/catalog/${id}`, payload).then((r) => r.data);
export const deleteCatalogItem = (id) => api.delete(`/catalog/${id}`).then((r) => r.data);

// Service requests
export const createServiceRequest = (payload) => api.post('/requests', payload).then((r) => r.data);
export const listServiceRequests = () => api.get('/requests').then((r) => r.data);
export const listMyServiceRequests = () => api.get('/requests/my').then((r) => r.data);
export const getServiceRequest = (id) => api.get(`/requests/${id}`).then((r) => r.data);
export const updateServiceRequestStatus = (id, status, assignedToID, remark) =>
  api
    .patch(`/requests/${id}/status`, null, { params: { status, assignedToID, remark } })
    .then((r) => r.data);
