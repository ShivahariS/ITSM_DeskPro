import api from './client.js';

export const listUsers = () => api.get('/users').then((r) => r.data);
export const getUser = (id) => api.get(`/users/${id}`).then((r) => r.data);
export const listUsersByRole = (role) =>
  api.get('/users/by-role', { params: { role } }).then((r) => r.data);
export const updateUserStatus = (id, status) =>
  api.patch(`/users/${id}/status`, null, { params: { status } }).then((r) => r.data);
export const updateUserRole = (id, role) =>
  api.patch(`/users/${id}/role`, null, { params: { role } }).then((r) => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then((r) => r.data);
export const changePassword = (oldPassword, newPassword) =>
  api.post('/users/change-password', { oldPassword, newPassword }).then((r) => r.data);
