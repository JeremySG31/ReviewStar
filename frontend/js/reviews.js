// Control de CRUD de reseñas desde frontend. Usa utils/api.js + dom helpers.

import {
  apiGetReviews,
  apiCreateReview,
  apiUpdateReview,
  apiDeleteReview,
  apiGetMyReviews,
  apiGetComments,
  apiAddComment,
  apiLikeReview
} from './utils/api.js';

import { createReviewCard, showToast } from './utils/dom.js';
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

  // Función para recargar
  const refresh = async () => {
    try {
      const reviews = await apiGetReviews();
      // Limitar a las 3 más recientes
      const recentReviews = reviews.slice(0, 3);
      renderList(container, recentReviews, false); 
    } catch (err) {
      console.error(err);
    }
  };

  try {
    const reviews = await apiGetReviews();
    allReviewsCache = reviews;
    // Mostrar solo las 3 reseñas más recientes en index
    const recentReviews = reviews.slice(0, 3);
    renderList(container, recentReviews, false);
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="text-center text-red-400">
        No se pudieron cargar las reseñas.
      </div>`;
  }

  // Delegación de eventos para Like / Comentar en el index
  container.addEventListener('click', async (e) => {
    const likeBtn = e.target.closest('.btn-like');
    const commentBtn = e.target.closest('.btn-comment');

    if (likeBtn) {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Debes iniciar sesión para dar like.', 'error');
        return;
      }

      const id = likeBtn.dataset.id;
      // Animación visual
      likeBtn.classList.add('like-animation');
      setTimeout(() => likeBtn.classList.remove('like-animation'), 600);

      try {
        await import('./utils/api.js').then(m => m.apiLikeReview(id));
        showToast('¡Te gusta esta reseña!', 'success');
        // Recargar la lista para actualizar contadores
        await refresh();
      } catch (err) {
        console.error(err);
        showToast('Error al dar like', 'error');
      }
    } else if (commentBtn) {
      const id = commentBtn.dataset.id;
      openCommentsModal(id);
    }
  });
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

  // Botón nueva reseña (Navbar)
  const nuevaBtn = document.getElementById('nuevaReseñaBtn');
  if (nuevaBtn) nuevaBtn.addEventListener('click', () => openModal());

  // Botón nueva reseña (FAB Flotante)
  const fabBtn = document.getElementById('fabNuevaReseña');
  if (fabBtn) fabBtn.addEventListener('click', () => openModal());

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
      // Agregar animación de like
      likeBtn.classList.add('like-animation');
      setTimeout(() => likeBtn.classList.remove('like-animation'), 600);

      await apiLikeReview(id);
      await refreshMyReviews(container);
    } else if (commentBtn) {
      const id = commentBtn.dataset.id;
      openCommentsModal(id);
    }
  });
}

// Carga los datos del perfil (nombre, email) en la cabecera del dashboard
async function loadProfileData() {
  const profileNameEl = document.getElementById('profileName');
  const profileEmailEl = document.getElementById('profileEmail');
  const totalReviewsEl = document.getElementById('totalReviews');
  const totalLikesEl = document.getElementById('totalLikes');

  if (profileNameEl && profileEmailEl) {
    try {
      // 1. Cargar datos locales primero (para mostrar algo rápido)
      const localUser = JSON.parse(localStorage.getItem('usuario') || 'null');
      if (localUser) {
        profileNameEl.textContent = localUser.nombre || 'Usuario';
        profileEmailEl.textContent = localUser.email || 'email@desconocido.com';
      }

      // 2. Obtener datos actualizados desde el backend
      const token = localStorage.getItem('token');
      if (token) {
        const { API_BASE } = await import('./utils/api.js');
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();

          // Actualizar UI con datos frescos
          profileNameEl.textContent = userData.nombre || 'Usuario';
          profileEmailEl.textContent = userData.email || 'email@desconocido.com';

          // Actualizar métricas
          if (totalReviewsEl) totalReviewsEl.textContent = userData.totalReviews || 0;
          if (totalLikesEl) totalLikesEl.textContent = userData.totalLikes || 0;

          // Actualizar localStorage con datos frescos
          localStorage.setItem('usuario', JSON.stringify(userData));
        }
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
    const totalLikesEl = document.getElementById('totalLikes');
    if (totalReviewsEl && totalLikesEl) {
      // Intentar usar los datos del usuario persistido si están disponibles
      const user = JSON.parse(localStorage.getItem('usuario') || 'null');

      if (user && typeof user.totalReviews === 'number') {
        totalReviewsEl.textContent = user.totalReviews;
        totalLikesEl.textContent = user.totalLikes;
      } else {
        // Fallback: Calcular desde el array (solo si no hay datos persistidos)
        totalReviewsEl.textContent = allReviewsCache.length;
        const totalLikes = allReviewsCache.reduce((sum, r) => sum + (r.likes || 0), 0);
        totalLikesEl.textContent = totalLikes;
      }
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

// Abre el modal de comentarios
async function openCommentsModal(reviewId) {
  const modal = document.getElementById('modalComentarios');
  const reviewContent = document.getElementById('comentariosReviewContent');
  const listaComentarios = document.getElementById('listaComentarios');
  const form = document.getElementById('nuevoComentarioForm');
  const cerrarBtn = document.getElementById('cerrarComentariosBtn');

  if (!modal || !reviewContent || !listaComentarios) return;

  // Obtener la reseña completa
  const review = allReviewsCache.find(r => r._id === reviewId);
  if (!review) return;

  // Renderizar la reseña completa en la parte superior
  // Renderiza la cabecera del modal (SOLO TÍTULO, sin imagen)
  reviewContent.innerHTML = `
    <div class="border-b border-gray-700 pb-4 mb-4">
      <h3 class="text-xl font-bold text-white mb-2">${escapeHtml(review.title)}</h3>
      <p class="text-gray-400 text-sm">${escapeHtml(review.description)}</p>
      <div class="flex items-center gap-2 mt-2">
        <span class="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded-full">${escapeHtml(review.category)}</span>
        <span class="text-xs text-gray-500">por ${escapeHtml(review.user?.nombre || 'Anónimo')}</span>
      </div>
    </div>
  `;

  // Renderizar comentarios existentes
  const comments = await apiGetComments(reviewId);
  renderComments(comments);

  // Verificar autenticación
  const token = localStorage.getItem('token');
  const loginContainer = document.getElementById('loginParaComentar');

  if (token) {
    // Usuario logueado: Mostrar formulario, ocultar login
    if (form) form.classList.remove('hidden');
    if (loginContainer) loginContainer.classList.add('hidden');

    // Configurar envío de formulario
    form.onsubmit = async (e) => {
      e.preventDefault();
      const textarea = document.getElementById('nuevoComentarioTexto');
      const comment = textarea.value.trim();

      if (comment) {
        try {
          await apiAddComment(reviewId, comment);
          textarea.value = '';

          // Actualizar comentarios
          const newComments = await apiGetComments(reviewId);
          renderComments(newComments);

          // Actualizar cache si es necesario (opcional, ya que fetched comments son la verdad)

        } catch (err) {
          console.error(err);
          alert('Error al agregar comentario');
        }
      }
    };
  } else {
    // Usuario NO logueado: Ocultar formulario, mostrar login
    if (form) form.classList.add('hidden');
    if (loginContainer) loginContainer.classList.remove('hidden');
  }

  // Botón cerrar
  cerrarBtn.onclick = () => closeCommentsModal();

  // Cerrar al hacer clic fuera del modal
  modal.onclick = (e) => {
    if (e.target === modal) closeCommentsModal();
  };

  modal.classList.remove('hidden');
}

// Cierra el modal de comentarios
function closeCommentsModal() {
  const modal = document.getElementById('modalComentarios');
  if (modal) modal.classList.add('hidden');
}

// Renderiza la lista de comentarios con estilo de hilo
function renderComments(comments) {
  const listaComentarios = document.getElementById('listaComentarios');
  if (!listaComentarios) return;

  const commentsHtml = comments.length > 0
    ? comments.map(c => `
        <div class="flex gap-3 animate-fadeIn">
          <div class="flex-shrink-0 mt-1">
             <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
               💬
             </div>
          </div>
          <div class="flex-grow bg-gray-800/40 rounded-2xl rounded-tl-none p-3 border border-gray-700/50 shadow-sm">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-bold text-blue-300">${escapeHtml(c.user?.nombre || 'Usuario')}</span>
              <span class="text-xs text-gray-500">${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</span>
            </div>
            <p class="text-gray-200 text-sm leading-relaxed">${escapeHtml(c.text || c)}</p>
          </div>
        </div>
      `).join('')
    : `
      <div class="text-center py-8 opacity-60">
        <div class="text-4xl mb-2">💭</div>
        <p class="text-gray-400">No hay comentarios aún.</p>
        <p class="text-sm text-gray-500">¡Sé el primero en compartir tu opinión!</p>
      </div>
    `;

  listaComentarios.innerHTML = `
    <div class="flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
      <h4 class="font-semibold text-lg">Comentarios <span class="text-sm text-gray-400 font-normal">(${comments.length})</span></h4>
    </div>
    <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      ${commentsHtml}
    </div>
  `;
}

// Función helper para escapar HTML
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"'`=\/]/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
  }[s]));
}
