import api from './client.js';

// POST /auth/register -> AuthResponse { token, tokenType, userID, name, email, role }
export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data);

// POST /auth/login -> AuthResponse
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data);
