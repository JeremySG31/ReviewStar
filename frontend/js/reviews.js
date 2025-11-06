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
const DASHBOARD_LIST_ID = 'misReseñas'; // en profile.html
const MODAL_ID = 'modalReseña';         // modal para crear/editar en dashboard
const FORM_ID = 'reseñaForm';

let editingId = null; // id actual en edición (si aplica)
let allReviewsCache = []; // Caché para guardar todas las reseñas y filtrar en el frontend

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
  allReviewsCache = await apiGetMyReviews();
  renderList(container, allReviewsCache, true);

  // Lógica del filtro de categoría para el dashboard
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      filterAndRenderReviews(container, allReviewsCache, e.target.value, true);
    });
  }

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
    const likeBtn = e.target.closest('.btn-like');
    const commentBtn = e.target.closest('.btn-comment');

    if (editBtn) {
      const id = editBtn.dataset.id;
      openModal(id);
    } else if (delBtn) {
      const id = delBtn.dataset.id;
      if (confirm('¿Eliminar reseña?')) {
        await apiDeleteReview(id);
        await refreshMyReviews(container);
      }
    } else if (likeBtn) {
      const id = likeBtn.dataset.id;
      await apiLikeReview(id);
      await refreshMyReviews(container);
    } else if (commentBtn) {
      const id = commentBtn.dataset.id;
      const comment = prompt('Escribe tu comentario:');
      if (comment) {
        await apiAddComment(id, comment);
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
    allReviewsCache = await apiGetMyReviews();
    const categoryFilter = document.getElementById('categoryFilter');
    const currentFilter = categoryFilter ? categoryFilter.value : 'all';
    filterAndRenderReviews(container, allReviewsCache, currentFilter, true);

    // Actualizar estadísticas
    const totalReviewsEl = document.getElementById('totalReviews');
    const avgRatingEl = document.getElementById('avgRating');
    if (totalReviewsEl && avgRatingEl) {
      totalReviewsEl.textContent = allReviewsCache.length;
      const avg = allReviewsCache.length > 0 ? (allReviewsCache.reduce((sum, r) => sum + r.rating, 0) / allReviewsCache.length) : 0;
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

// Filtra y renderiza las reseñas según la categoría seleccionada
function filterAndRenderReviews(container, reviews, category, controls) {
  if (category === 'all') {
    renderList(container, reviews, controls);
  } else {
    const filteredReviews = reviews.filter(review => review.category === category);
    renderList(container, filteredReviews, controls);
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
  const submitBtn = document.getElementById('submitReviewBtn');
  if (!form || !modal) return;

  form.reset();

  if (editId) {
    const my = await apiGetMyReviews();
    const item = my.find((x) => x._id === editId);
    if (item) {
      form.querySelector('#titulo').value = item.titulo || item.title || '';
      form.querySelector('#contenido').value = item.descripcion || item.description || '';
      form.querySelector('#category').value = item.category || '';
      form.querySelector('#reviewImage').value = '';
      const fileUploadLabel = document.getElementById('fileUploadLabel');
      if (fileUploadLabel) {
        fileUploadLabel.textContent = 'Elegir archivo';
      }

      const ratingInput = form.querySelector('#ratingInput');
      const currentRating = item.calificacion || item.rating || 0;
      if (ratingInput) ratingInput.value = currentRating;
      updateStars(currentRating); // Actualiza visualmente las estrellas
      editingId = editId;
      const titleEl = document.getElementById('modalTitulo');
      if (titleEl) titleEl.textContent = 'Editar reseña';
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
    }
  } else {
    const titleEl = document.getElementById('modalTitulo');
    if (titleEl) titleEl.textContent = 'Nueva reseña';
    if (submitBtn) submitBtn.textContent = 'Crear';
    const fileUploadLabel = document.getElementById('fileUploadLabel');
    if (fileUploadLabel) {
      fileUploadLabel.textContent = 'Elegir archivo';
    }
    updateStars(0); // Resetea las estrellas para una nueva reseña
  }

  // Lógica para el sistema de calificación por estrellas
  const starsContainer = document.getElementById('ratingStars');
  const ratingInput = document.getElementById('ratingInput');

  starsContainer.onmousemove = e => {
    const rect = e.target.getBoundingClientRect();
    const starIndex = Array.from(starsContainer.children).indexOf(e.target);
    if (starIndex === -1) return;

    // Muestra una vista previa de la calificación al pasar el ratón
    const hoverValue = starIndex + (e.clientX - rect.left > rect.width / 2 ? 1 : 0.5);
    updateStars(hoverValue, true);
  };

  starsContainer.onmouseleave = () => {
    // Al salir, revierte a la calificación guardada en el input
    updateStars(ratingInput.value);
  };

  starsContainer.onclick = e => {
    const rect = e.target.getBoundingClientRect();
    const starIndex = Array.from(starsContainer.children).indexOf(e.target);
    if (starIndex === -1) return;

    const clickValue = starIndex + (e.clientX - rect.left > rect.width / 2 ? 1 : 0.5);
    ratingInput.value = clickValue;
    updateStars(clickValue);

    // Añadir animación a las estrellas clickeadas
    const stars = starsContainer.children;
    for (let i = 0; i <= starIndex; i++) {
      stars[i].classList.remove('star-clicked'); // Prevenir re-trigger si se clickea rápido
      // Forzar reflow para reiniciar la animación
      void stars[i].offsetWidth; 
      stars[i].classList.add('star-clicked');
    }
    // Limpiar la clase de animación después de que termine
    setTimeout(() => Array.from(stars).forEach(s => s.classList.remove('star-clicked')), 400);
  };

  // Lógica para reemplazar el texto del botón con el nombre del archivo
  const fileInput = document.getElementById('reviewImage');
  const fileUploadLabel = document.getElementById('fileUploadLabel');
  if (fileInput && fileUploadLabel) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        fileUploadLabel.textContent = fileInput.files[0].name;
      }
    });
  }

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
  const category = form.querySelector('#category')?.value;
  const imageFile = form.querySelector('#reviewImage')?.files[0];
  const calificacionRaw = form.querySelector('#ratingInput')?.value;
  const calificacion = calificacionRaw ? parseFloat(calificacionRaw) : 0;

  // Usamos FormData para poder enviar el archivo de imagen al backend
  const formData = new FormData();
  formData.append('title', titulo);
  formData.append('description', descripcion);
  formData.append('category', category);
  formData.append('rating', calificacion);
  if (imageFile) {
    formData.append('image', imageFile); // El backend espera el campo 'image'
  }

  const valid = validateReviewPayload({ titulo, descripcion, calificacion, category });
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
