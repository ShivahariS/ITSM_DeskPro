/*import api from './client.js';

// Hardware assets
export const listAssets = () => api.get('/assets').then((r) => r.data);
export const getAsset = (id) => api.get(`/assets/${id}`).then((r) => r.data);
export const createAsset = (payload) => api.post('/assets', payload).then((r) => r.data);
export const updateAsset = (id, payload) => api.put(`/assets/${id}`, payload).then((r) => r.data);
export const deleteAsset = (id) => api.delete(`/assets/${id}`).then((r) => r.data);
export const listExpiringWarranty = () => api.get('/assets/expiring-warranty').then((r) => r.data);

// Software licenses
export const listLicenses = () => api.get('/licenses').then((r) => r.data);
export const getLicense = (id) => api.get(`/licenses/${id}`).then((r) => r.data);
export const createLicense = (payload) => api.post('/licenses', payload).then((r) => r.data);
export const updateLicense = (id, payload) => api.put(`/licenses/${id}`, payload).then((r) => r.data);
export const listExpiringLicenses = () => api.get('/licenses/expiring').then((r) => r.data);

// Configuration items (CMDB)
export const listConfigItems = () => api.get('/config-items').then((r) => r.data);
export const getConfigItem = (id) => api.get(`/config-items/${id}`).then((r) => r.data);
export const createConfigItem = (payload) => api.post('/config-items', payload).then((r) => r.data);
export const updateConfigItem = (id, payload) =>
  api.put(`/config-items/${id}`, payload).then((r) => r.data);

*/

import api from './client.js';

// Hardware assets
export const listAssets = () => api.get('/assets').then((r) => r.data);
export const getAsset = (id) => api.get(`/assets/${id}`).then((r) => r.data);
export const createAsset = (payload) => api.post('/assets', payload).then((r) => r.data);
export const updateAsset = (id, payload) => api.put(`/assets/${id}`, payload).then((r) => r.data);
export const deleteAsset = (id) => api.delete(`/assets/${id}`).then((r) => r.data);
export const listExpiringWarranty = () => api.get('/assets/expiring-warranty').then((r) => r.data);

// Software licenses
export const listLicenses = () => api.get('/licenses').then((r) => r.data);
export const getLicense = (id) => api.get(`/licenses/${id}`).then((r) => r.data);
export const createLicense = (payload) => api.post('/licenses', payload).then((r) => r.data);
export const updateLicense = (id, payload) => api.put(`/licenses/${id}`, payload).then((r) => r.data);
export const listExpiringLicenses = () => api.get('/licenses/expiring').then((r) => r.data);

// Configuration items (CMDB)
export const listConfigItems = () => api.get('/config-items').then((r) => r.data);
export const getConfigItem = (id) => api.get(`/config-items/${id}`).then((r) => r.data);
export const createConfigItem = (payload) => api.post('/config-items', payload).then((r) => r.data);
export const updateConfigItem = (id, payload) =>
  api.put(`/config-items/${id}`, payload).then((r) => r.data);

// Asset request fulfillment
export const fulfillHardwareRequest = (requestId, assetId, userId) =>
  api.post('/assets/fulfill-hardware', null, { params: { requestId, assetId, userId } }).then((r) => r.data);

export const fulfillSoftwareRequest = (requestId, licenseId) =>
  api.post('/licenses/fulfill-software', null, { params: { requestId, licenseId } }).then((r) => r.data);