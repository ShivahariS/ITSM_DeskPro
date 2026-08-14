import api from './client.js';

export const listAuditLogs = () => api.get('/audit-logs').then((r) => r.data);
export const listAuditLogsByUser = (userID) =>
  api.get(`/audit-logs/user/${userID}`).then((r) => r.data);
