// Funciones para comunicar el frontend con el backend (REST API).
import { API_URL } from '../config.js';

export function getApiBase() {
  return API_URL;
}

export const API_BASE = `${getApiBase()}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    let data;
    try {
      data = await res.json();
    } catch (e) { data = null; }
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error('Error en fetch:', error);
    throw error;
  }
}

/* Reviews */
export async function apiGetReviews() {
  const resp = await safeFetch(`${API_BASE}/reviews/all`, { headers: { ...getAuthHeaders() } });
  return resp.data || [];
}

// Obtiene reseñas del usuario actualmente logueado
export async function apiGetMyReviews() {
  const resp = await safeFetch(`${API_BASE}/reviews/my`, { headers: { ...getAuthHeaders() } });
  return resp.data || [];
}

// payload: { titulo, descripcion, imagenURL, calificacion }
export async function apiCreateReview(payload) {
  const body = {
    title: payload.titulo || payload.title || '',
    description: payload.descripcion || payload.description || '',
    rating: payload.calificacion || payload.rating || 0
  };

  // Si se proporciona un archivo (input type=file), frontend puede pasar FormData
  if (payload.formData instanceof FormData) {
    const headers = getAuthHeaders(); // No incluir Content-Type, el navegador lo añade automáticamente
    const resp = await safeFetch(`${API_BASE}/reviews/create`, {
      method: 'POST',
      headers,
      body: payload.formData // Pasar FormData directamente
    });
    return resp.data;
  }

  const resp = await safeFetch(`${API_BASE}/reviews/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body)
  });
  return resp.data;
}

export async function apiUpdateReview(id, payload) {
  const headers = getAuthHeaders();
  // Si payload es FormData, no ponemos Content-Type. Si es JSON, sí.
  if (!(payload instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(payload);
  }

  const resp = await safeFetch(`${API_BASE}/reviews/update/${id}`, {
    method: 'PUT',
    headers,
    body: payload
  });
  return resp.data;
}

export async function apiDeleteReview(id) {
  const resp = await safeFetch(`${API_BASE}/reviews/delete/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  return resp.data;
}

/* Auth */
export async function apiRegister(user) {
  const body = {
    nombre: user.nombre,
    email: user.email,
    password: user.contrasenia || user.password
  };

  const resp = await safeFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body)
  });

  if (resp.ok && resp.data) return { ok: true, ...resp.data };
  return { ok: false, message: resp.data?.message || 'Error en registro' };
}

export async function apiLogin(credentials) {
  const body = {
    email: credentials.email,
    password: credentials.contrasenia || credentials.password
  };

  const resp = await safeFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body)
  });

  if (resp.ok && resp.data) return { ok: true, ...resp.data };
  return { ok: false, message: resp.data?.message || 'Error en login' };
}

/* Perfil */
export async function apiGetProfile() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  return usuario;
}

/* Interactions */
export async function apiGetComments(id) {
  const resp = await safeFetch(`${API_BASE}/reviews/${id}/comments`);
  return resp.data || [];
}

export async function apiAddComment(id, comment) {
  const resp = await safeFetch(`${API_BASE}/reviews/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ comment }) // Backend espera { text: ... } o { comment: ... }? Ajustar si es necesario
    // Nota: en backend reviewController.js addCommentToReview espera req.body.comment.
    // Si backend espera req.body.text, cambiar aquí. Pero mantenemos coherencia con lo existente.
  });
  return resp.data;
}

export async function apiLikeReview(id) {
  const resp = await safeFetch(`${API_BASE}/reviews/${id}/like`, {
    method: 'PUT',
    headers: { ...getAuthHeaders() }
  });
  return resp.data;
}

/* Password Recovery */
export async function apiForgotPassword(email) {
  const resp = await safeFetch(`${API_BASE}/auth/forgotpassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (resp.ok) return { ok: true, ...resp.data };
  return { ok: false, message: resp.data?.message || 'Error' };
}

export async function apiResetPassword(token, password) {
  const resp = await safeFetch(`${API_BASE}/auth/resetpassword/${token}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (resp.ok) return { ok: true, ...resp.data };
  return { ok: false, message: resp.data?.message || 'Error' };
}

/* Google Auth */
export async function apiGoogleLogin(token) {
  const resp = await safeFetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (resp.ok && resp.data) return { ok: true, ...resp.data };
  return { ok: false, message: resp.data?.message || 'Error en Google Login' };
}

// Eliminar comentario
export async function apiDeleteComment(reviewId, commentId) {
  const resp = await safeFetch(`${API_BASE}/reviews/${reviewId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  return resp.data;
}

// Editar comentario
export async function apiEditComment(reviewId, commentId, text) {
  const resp = await safeFetch(`${API_BASE}/reviews/${reviewId}/comments/${commentId}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return resp.data;
}

// Reaccionar a comentario
export async function apiReactToComment(reviewId, commentId, reaction) {
  const resp = await safeFetch(`${API_BASE}/reviews/${reviewId}/comments/${commentId}/react`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction })
  });
  return resp.data;
}
