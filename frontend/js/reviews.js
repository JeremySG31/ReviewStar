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
const PUBLIC_LIST_ID = 'reseñas';      // en index.html
const DASHBOARD_LIST_ID = 'misReseñas';// en dashboard.html
const MODAL_ID = 'modalReseña';        // modal para crear/editar en dashboard
const FORM_ID = 'reseñaForm';

let editingId = null; // id actual en edición (si aplica)

export async function initPublicReviews() {
  const container = document.getElementById(PUBLIC_LIST_ID);
  if (!container) return;
  try {
    const reviews = await apiGetReviews();
    renderList(container, reviews, false);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="text-center text-red-400">No se pudieron cargar las reseñas.</div>';
  }
}

export async function initDashboard() {
  const container = document.getElementById(DASHBOARD_LIST_ID);
  const modal = document.getElementById(MODAL_ID);
  if (!container) return;

  // cargar mis reseñas
  await refreshMyReviews(container);

  // botones: nueva reseña
  const nuevaBtn = document.getElementById('nuevaReseñaBtn');
  if (nuevaBtn) nuevaBtn.addEventListener('click', () => openModal());

  // form submit
  const form = document.getElementById(FORM_ID);
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitReviewForm(form, container, modal);
    });
    // cancelar
    const cancelar = document.getElementById('cancelarBtn');
    if (cancelar) cancelar.addEventListener('click', () => closeModal(modal));
  }

  // delegación para editar / eliminar
  container.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const delBtn = e.target.closest('.btn-delete');
    if (editBtn) {
      const id = editBtn.dataset.id;
      openModal(id); // carga datos en el modal
    } else if (delBtn) {
      const id = delBtn.dataset.id;
      if (confirm('¿Eliminar reseña?')) {
        await apiDeleteReview(id);
        await refreshMyReviews(container);
      }
    }
  });
}

async function refreshMyReviews(container) {
  try {
    const reviews = await apiGetMyReviews();
    renderList(container, reviews, true);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="text-center text-red-400">No se pudieron cargar tus reseñas.</div>';
  }
}

function renderList(container, reviews, controls = false) {
  if (!reviews || !reviews.length) {
    container.innerHTML = '<div class="text-center text-gray-400">No hay reseñas aún.</div>';
    return;
  }
  container.innerHTML = reviews.map(r => {
    return `<div>${createReviewCard(r, { controls })}</div>`;
  }).join('');
}

async function openModal(editId) {
  editingId = null;
  const modal = document.getElementById(MODAL_ID);
  const form = document.getElementById(FORM_ID);
  if (!form || !modal) return;
  form.reset();

  if (editId) {
    // cargar datos del backend (aquí asumimos que apiGetMyReviews devuelve lista; mejor: endpoint /reseñas/:id)
    const my = await apiGetMyReviews();
    const item = my.find(x => x._id === editId);
    if (item) {
      form.querySelector('#titulo').value = item.titulo || item.title || '';
      form.querySelector('#contenido').value = item.descripcion || item.description || '';
      form.querySelector('#imagenUrl').value = item.imagenURL || item.image || '';
      form.querySelector('#ratingInput')?.value = item.calificacion || item.rating || '';
      editingId = editId;
      document.getElementById('modalTitulo').textContent = 'Editar reseña';
    }
  } else {
    document.getElementById('modalTitulo').textContent = 'Nueva reseña';
  }

  modal.classList.remove('hidden');
}

function closeModal(modal) {
  if (!modal) modal = document.getElementById(MODAL_ID);
  if (modal) modal.classList.add('hidden');
  editingId = null;
}

async function submitReviewForm(form, container, modal) {
  // obtener datos del formulario (nombres en el HTML)
  const titulo = form.querySelector('#titulo')?.value.trim();
  const descripcion = form.querySelector('#contenido')?.value.trim();
  const imagenURL = form.querySelector('#imagenUrl')?.value.trim();
  const calificacionRaw = form.querySelector('#ratingInput')?.value;
  const calificacion = calificacionRaw ? Number(calificacionRaw) : 0;

  const payload = {
    titulo,
    descripcion,
    imagenURL,
    calificacion
  };

  const valid = validateReviewPayload(payload);
  if (!valid.ok) {
    alert(valid.msg);
    return;
  }

  try {
    if (editingId) {
      await apiUpdateReview(editingId, payload);
    } else {
      await apiCreateReview(payload);
    }
    await refreshMyReviews(container);
    closeModal(modal);
  } catch (err) {
    console.error(err);
    alert('Error al guardar la reseña');
  }
}
