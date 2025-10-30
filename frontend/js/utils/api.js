// Funciones para comunicar el frontend con el backend (REST API).
// Ajusta API_BASE si tu servidor no corre en localhost:4000

export const API_BASE = 'http://localhost:4000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/* Reviews */
export async function apiGetReviews() {
  const res = await fetch(`${API_BASE}/reseñas`, { headers: { ...getAuthHeaders() }});
  return await res.json();
}

export async function apiGetMyReviews() {
  const res = await fetch(`${API_BASE}/reseñas/mias`, { headers: { ...getAuthHeaders() }});
  return await res.json();
}

export async function apiCreateReview(payload) {
  // payload es obj { titulo, descripcion, categoria, imagenURL, calificacion }
  const res = await fetch(`${API_BASE}/reseñas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function apiUpdateReview(id, payload) {
  const res = await fetch(`${API_BASE}/reseñas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function apiDeleteReview(id) {
  const res = await fetch(`${API_BASE}/reseñas/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  return await res.json();
}

/* Auth */
export async function apiRegister(user) {
  // user: { nombre, email, contrasenia }
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  return await res.json();
}

export async function apiLogin(credentials) {
  // credentials: { email, contrasenia }
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return await res.json();
}

/* Usuarios */
export async function apiGetProfile() {
  const res = await fetch(`${API_BASE}/usuarios/me`, { headers: { ...getAuthHeaders() }});
  return await res.json();
}
