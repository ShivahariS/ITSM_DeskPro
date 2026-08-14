import api from './client.js';

// Problem records
export const createProblem = (payload) => api.post('/problems', payload).then((r) => r.data);
export const listProblems = () => api.get('/problems').then((r) => r.data);
export const getProblem = (id) => api.get(`/problems/${id}`).then((r) => r.data);
export const updateProblem = (id, payload) => api.put(`/problems/${id}`, payload).then((r) => r.data);
export const updateProblemStatus = (id, status, rootCause) =>
  api
    .patch(`/problems/${id}/status`, { rootCause }, { params: { status } })
    .then((r) => r.data);

// Known errors (KEDB)
export const createKnownError = (payload) => api.post('/known-errors', payload).then((r) => r.data);
export const listKnownErrors = () => api.get('/known-errors').then((r) => r.data);
export const getKnownError = (id) => api.get(`/known-errors/${id}`).then((r) => r.data);
export const listKnownErrorsByProblem = (problemID) =>
  api.get(`/problems/${problemID}/known-errors`).then((r) => r.data);
export const updateKnownError = (id, payload) =>
  api.put(`/known-errors/${id}`, payload).then((r) => r.data);
