import api from './client.js';

export const createIncident = (payload) => api.post('/incidents', payload).then((r) => r.data);
export const listIncidents = () => api.get('/incidents').then((r) => r.data);
export const listMyIncidents = () => api.get('/incidents/my').then((r) => r.data);
export const listAssignedIncidents = () => api.get('/incidents/assigned').then((r) => r.data);
export const listIncidentsByStatus = (status) =>
  api.get('/incidents/by-status', { params: { status } }).then((r) => r.data);
export const getIncident = (id) => api.get(`/incidents/${id}`).then((r) => r.data);

export const assignIncident = (id, assignedToID, teamID) =>
  api
    .patch(`/incidents/${id}/assign`, null, { params: { assignedToID, teamID } })
    .then((r) => r.data);
export const escalateIncident = (id, payload) =>
  api.post(`/incidents/${id}/escalate`, payload).then((r) => r.data);
export const resolveIncident = (id, resolutionNote) =>
  api.post(`/incidents/${id}/resolve`, { resolutionNote }).then((r) => r.data);
export const closeIncident = (id) => api.post(`/incidents/${id}/close`).then((r) => r.data);
export const reopenIncident = (id) => api.post(`/incidents/${id}/reopen`).then((r) => r.data);

export const addIncidentNote = (id, payload) =>
  api.post(`/incidents/${id}/notes`, payload).then((r) => r.data);
export const listIncidentNotes = (id) => api.get(`/incidents/${id}/notes`).then((r) => r.data);

export const submitSatisfaction = (id, payload) =>
  api.post(`/incidents/${id}/satisfaction`, payload).then((r) => r.data);
