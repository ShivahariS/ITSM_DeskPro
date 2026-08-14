import api from './client.js';

export const generateReport = (scope, scopeValue) =>
  api.post('/reports/generate', null, { params: { scope, scopeValue } }).then((r) => r.data);
export const listReports = () => api.get('/reports').then((r) => r.data);
export const getReport = (id) => api.get(`/reports/${id}`).then((r) => r.data);
