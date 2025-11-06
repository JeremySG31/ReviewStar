// Funciones para comunicar el frontend con el backend (REST API).

// Siempre usar el backend en localhost:5000
export function getApiBase() {
  // El backend siempre corre en el puerto 5000
  return 'http://localhost:5000';
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

// Obtiene reseñas del usuario actualmente logueado (filtrado en frontend ya que no hay ruta específica)
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
    // FormData should already contain 'title','description','rating' and optional file 'image'
    const headers = { ...getAuthHeaders() };
    const resp = await safeFetch(`${API_BASE}/reviews/create`, { method: 'POST', headers, body: payload.formData });
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
  // Asumimos que el payload es FormData para la actualización también.
  // El backend debe estar preparado para recibir FormData en el endpoint de update.
  const headers = { ...getAuthHeaders() };
  const resp = await safeFetch(`${API_BASE}/reviews/update/${id}`, { method: 'PUT', headers, body: payload });
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
  console.log('Iniciando registro con datos:', { 
    nombre: user.nombre, 
    email: user.email,
    hasPassword: !!user.password 
  });
  
  // user: { nombre, email, contrasenia }
  const body = {
    nombre: user.nombre,
    email: user.email,
    password: user.contrasenia || user.password
  };

  const url = `${API_BASE}/auth/register`;
  console.log('URL de registro:', url);
  console.log('Datos a enviar:', body);
  
  const resp = await safeFetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  // On success backend returns token and usuario
  if (resp.ok && resp.data) return { ok: true, ...resp.data };
  return { ok: false, message: resp.data?.message || 'Error en registro' };
}

export async function apiLogin(credentials) {
  // credentials: { email, contrasenia }
  const body = {
    email: credentials.email,
    password: credentials.contrasenia || credentials.password
  };
  
  const resp = await safeFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (resp.ok && resp.data) {
    return { ok: true, ...resp.data };
  }
  return { ok: false, message: resp.data?.message || 'Error en login' };
}

/* Perfil (no hay endpoint en backend, usamos localStorage) */
export async function apiGetProfile() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  return usuario;
}

export async function apiAddComment(id, comment) {
  const resp = await safeFetch(`${API_BASE}/reviews/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ comment })
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
