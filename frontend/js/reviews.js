// Control de CRUD de reseñas desde frontend. Usa utils/api.js + dom helpers.

import {
  apiGetReviews,
  apiCreateReview,
  apiUpdateReview,
  apiDeleteReview,
  apiGetMyReviews
} from './utils/api.js';

import { createReviewCard } from './utils/dom.js';
import { validateReviewPayload } from './utils/validation.js';

// Selectores esperados en los HTML
const PUBLIC_LIST_ID = 'reseñas';       // en index.html
const DASHBOARD_LIST_ID = 'misReseñas'; // en dashboard.html
const MODAL_ID = 'modalReseña';         // modal para crear/editar en dashboard
const FORM_ID = 'reseñaForm';

let editingId = null; // id actual en edición (si aplica)

// Inicializa reseñas públicas en index.html
export async function initPublicReviews() {
  const container = document.getElementById(PUBLIC_LIST_ID);
  if (!container) return;

  try {
    const reviews = await apiGetReviews();
    renderList(container, reviews, false);
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="text-center text-red-400">
        No se pudieron cargar las reseñas.
      </div>`;
  }
}

// Inicializa el dashboard del usuario (CRUD)
export async function initDashboard() {
  const container = document.getElementById(DASHBOARD_LIST_ID);
  const modal = document.getElementById(MODAL_ID);
  if (!container) return;

  // Cargar reseñas del usuario
  await loadProfileData();
  await refreshMyReviews(container);

  // Botón nueva reseña
  const nuevaBtn = document.getElementById('nuevaReseñaBtn');
  if (nuevaBtn) nuevaBtn.addEventListener('click', () => openModal());

  // Formulario de reseña
  const form = document.getElementById(FORM_ID);
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitReviewForm(form, container, modal);
    });

    const cancelar = document.getElementById('cancelarBtn');
    if (cancelar) cancelar.addEventListener('click', () => closeModal(modal));
  }

  // Delegación de eventos para editar / eliminar
  container.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const delBtn = e.target.closest('.btn-delete');

    if (editBtn) {
      const id = editBtn.dataset.id;
      openModal(id);
    } else if (delBtn) {
      const id = delBtn.dataset.id;
      if (confirm('¿Eliminar reseña?')) {
        await apiDeleteReview(id);
        await refreshMyReviews(container);
      }
    }
  });
}

// Carga los datos del perfil (nombre, email) en la cabecera del dashboard
async function loadProfileData() {
  const profileNameEl = document.getElementById('profileName');
  const profileEmailEl = document.getElementById('profileEmail');

  if (profileNameEl && profileEmailEl) {
    try {
      const user = JSON.parse(localStorage.getItem('usuario') || 'null');
      if (user) {
        profileNameEl.textContent = user.nombre || 'Usuario';
        profileEmailEl.textContent = user.email || 'email@desconocido.com';
      }
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
      profileNameEl.textContent = 'Error al cargar';
      profileEmailEl.textContent = 'Intente recargar la página';
    }
  }
}

// Refresca reseñas del usuario logueado
async function refreshMyReviews(container) {
  try {
    const reviews = await apiGetMyReviews();
    renderList(container, reviews, true);

    // Actualizar estadísticas
    const totalReviewsEl = document.getElementById('totalReviews');
    const avgRatingEl = document.getElementById('avgRating');
    if (totalReviewsEl && avgRatingEl) {
      totalReviewsEl.textContent = reviews.length;
      const avg = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
      avgRatingEl.textContent = avg.toFixed(1);
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="text-center text-red-400">
        No se pudieron cargar tus reseñas.
      </div>`;
  }
}

// Renderiza lista de reseñas (públicas o privadas)
function renderList(container, reviews, controls = false) {
  if (!reviews || reviews.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-400">
        No hay reseñas aún.
      </div>`;
    return;
  }

  // ✅ Se usa join seguro y sin expresiones ambiguas
  let html = '';
  for (const r of reviews) {
    html += createReviewCard(r, { controls });
  }
  container.innerHTML = html;
}

// Abre modal para crear o editar reseña
async function openModal(editId) {
  editingId = null;
  const modal = document.getElementById(MODAL_ID);
  const form = document.getElementById(FORM_ID);
  if (!form || !modal) return;

  form.reset();

  if (editId) {
    const my = await apiGetMyReviews();
    const item = my.find((x) => x._id === editId);
    if (item) {
      form.querySelector('#titulo').value = item.titulo || item.title || '';
      form.querySelector('#contenido').value = item.descripcion || item.description || '';
      // El input de archivo no se puede pre-rellenar por seguridad, solo se limpia.
      form.querySelector('#reviewImage').value = '';

      const ratingInput = form.querySelector('#ratingInput');
      const currentRating = item.calificacion || item.rating || 0;
      if (ratingInput) ratingInput.value = currentRating;
      updateStars(currentRating); // Actualiza visualmente las estrellas
      editingId = editId;
      const titleEl = document.getElementById('modalTitulo');
      if (titleEl) titleEl.textContent = 'Editar reseña';
    }
  } else {
    const titleEl = document.getElementById('modalTitulo');
    if (titleEl) titleEl.textContent = 'Nueva reseña';
    updateStars(0); // Resetea las estrellas para una nueva reseña
  }

  // Lógica para el sistema de calificación por estrellas
  const starsContainer = document.getElementById('ratingStars');
  const ratingInput = document.getElementById('ratingInput');

  starsContainer.onmousemove = e => {
    const rect = e.target.getBoundingClientRect();
    const starIndex = Array.from(starsContainer.children).indexOf(e.target);
    if (starIndex === -1) return;

    const hoverValue = starIndex + (e.clientX - rect.left > rect.width / 2 ? 1 : 0.5);
    updateStars(hoverValue, true);
  };

  starsContainer.onmouseleave = () => {
    updateStars(ratingInput.value);
  };

  starsContainer.onclick = e => {
    const rect = e.target.getBoundingClientRect();
    const starIndex = Array.from(starsContainer.children).indexOf(e.target);
    if (starIndex === -1) return;

    const clickValue = starIndex + (e.clientX - rect.left > rect.width / 2 ? 1 : 0.5);
    ratingInput.value = clickValue;
    updateStars(clickValue);
  };

  modal.classList.remove('hidden');
}

// Cierra modal
function closeModal(modal) {
  if (!modal) modal = document.getElementById(MODAL_ID);
  if (modal) modal.classList.add('hidden');
  editingId = null;
}

// Actualiza la apariencia de las estrellas
function updateStars(rating, isHover = false) {
  const stars = document.querySelectorAll('#ratingStars .star');
  const ratingDisplay = document.getElementById('ratingValueDisplay');

  if (ratingDisplay) {
    ratingDisplay.textContent = `${parseFloat(rating).toFixed(1)} / 5.0`;
  }

  const ratingValue = parseFloat(rating);

  stars.forEach((star, index) => {
    star.classList.remove('text-yellow-400', 'text-yellow-300');
    star.style.background = '';
    star.style.webkitBackgroundClip = '';
    star.style.webkitTextFillColor = '';

    if (ratingValue > index + 0.5) {
      star.classList.add('text-yellow-400'); // Estrella completa
    } else if (ratingValue > index) {
      // Media estrella usando un gradiente
      star.style.background = 'linear-gradient(to right, #FBBF24 50%, #6B7280 50%)';
      star.style.webkitBackgroundClip = 'text';
      star.style.webkitTextFillColor = 'transparent';
    } else {
      star.classList.add(isHover ? 'text-gray-400' : 'text-gray-500');
    }
  });
}

// Envía formulario (crear o editar)
async function submitReviewForm(form, container, modal) {
  const titulo = form.querySelector('#titulo')?.value.trim();
  const descripcion = form.querySelector('#contenido')?.value.trim();
  const imageFile = form.querySelector('#reviewImage')?.files[0];
  const calificacionRaw = form.querySelector('#ratingInput')?.value;
  const calificacion = calificacionRaw ? parseFloat(calificacionRaw) : 0;

  // Usamos FormData para poder enviar el archivo de imagen al backend
  const formData = new FormData();
  formData.append('title', titulo);
  formData.append('description', descripcion);
  formData.append('rating', calificacion);
  if (imageFile) {
    formData.append('image', imageFile); // El backend espera el campo 'image'
  }

  const valid = validateReviewPayload({ titulo, descripcion, calificacion });
  if (!valid.ok) {
    alert(valid.msg);
    return;
  }

  try {
    if (editingId) {
      // La API de update también debe aceptar FormData si se quiere cambiar la imagen
      await apiUpdateReview(editingId, formData);
    } else {
      // La API de create ya está lista para FormData
      await apiCreateReview({ formData });
    }
    await refreshMyReviews(container);
    closeModal(modal);
  } catch (err) {
    console.error(err);
    alert('Error al guardar la reseña');
  }
}
