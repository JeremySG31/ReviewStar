import { API_BASE } from './utils/api.js';
import { createReviewCard, showToast, escapeHtml } from './utils/dom.js';

let currentReviewId = null;
let allReviews = [];

// Inicializar feed
async function initFeed() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await loadUserName();
    await loadFeed();
    setupEventListeners();
}

// Cargar nombre del usuario
async function loadUserName() {
    const userNameLink = document.getElementById('userNameLink');
    if (!userNameLink) {
        console.error('Elemento userNameLink no encontrado');
        return;
    }

    // 1. Intentar cargar desde localStorage primero (más rápido)
    const localUser = localStorage.getItem('usuario');
    if (localUser) {
        try {
            const user = JSON.parse(localUser);
            if (user.nombre) {
                userNameLink.textContent = user.nombre;
            } else {
                userNameLink.textContent = 'Usuario';
            }
        } catch (e) {
            console.error('Error parsing local user data', e);
        }
    }

    // 2. Actualizar desde la API para asegurar datos frescos
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            if (user.nombre) {
                userNameLink.textContent = user.nombre;
                // Actualizar localStorage con datos frescos si es necesario
                localStorage.setItem('usuario', JSON.stringify(user));
            }
        }
    } catch (error) {
        console.error('Error cargando nombre de usuario:', error);
    }
}

// Cargar todas las reseñas
async function loadFeed() {
    const loadingEl = document.getElementById('loadingFeed');
    const emptyEl = document.getElementById('emptyFeed');
    const containerEl = document.getElementById('feedContainer');

    loadingEl.classList.remove('hidden');
    containerEl.innerHTML = '';
    emptyEl.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE}/reviews/all`);
        if (!response.ok) throw new Error('Error al cargar reseñas');

        allReviews = await response.json();
        console.log('Reseñas cargadas (Total):', allReviews.length);
        loadingEl.classList.add('hidden');

        if (allReviews.length === 0) {
            emptyEl.classList.remove('hidden');
            return;
        }

        renderReviews(allReviews);
    } catch (error) {
        console.error('Error:', error);
        loadingEl.classList.add('hidden');
        showToast('Error al cargar el feed', 'error');
    }
}

// Renderizar reseñas
function renderReviews(reviews) {
    const containerEl = document.getElementById('feedContainer');
    containerEl.innerHTML = '';

    console.log('Renderizando reseñas:', reviews.length);

    reviews.forEach(review => {
        const card = createFeedCard(review);
        containerEl.innerHTML += card;
    });

    // Agregar event listeners a los botones
    attachCardListeners();
}

// Crear tarjeta de reseña para el feed
function createFeedCard(review) {
    const author = review.autor || review.user || { nombre: 'Anónimo' };
    const likes = review.likes || 0;
    const comments = review.comments || [];
    const rating = review.calificacion || review.rating || 0;
    const image = review.imagenURL || review.image || '';
    const title = review.titulo || review.title || '';
    const description = review.descripcion || review.description || '';
    const category = review.category || 'Sin categoría';

    const short = description.length > 140 ? description.slice(0, 140) + '...' : description;
    const imgHtml = image ? `<img src="${image}" alt="${escapeHtml(title)}" class="w-full h-48 object-cover rounded-md mb-3" onerror="this.style.display='none'">` : '';

    return `
    <article class="review-card bg-gray-800 rounded-xl p-6 relative shadow-lg hover:shadow-2xl transition" data-id="${review._id}">
      <div class="absolute top-3 left-3 bg-blue-600/80 text-white text-xs font-semibold px-3 py-1 rounded-full">
        ${escapeHtml(category)}
      </div>
      ${imgHtml}
      <h3 class="font-bold text-xl mb-2">${escapeHtml(title)}</h3>
      <p class="text-sm text-gray-300 mb-4">${escapeHtml(short)}</p>
      
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="text-yellow-400">⭐</span>
          <span class="font-semibold">${rating.toFixed(1)}/5.0</span>
        </div>
        <div class="text-xs text-gray-400">
          por ${escapeHtml(author.nombre || author.name || 'Anónimo')}
        </div>
      </div>

      <div class="flex items-center gap-4 pt-4 border-t border-gray-700">
        <button class="btn-like flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition" data-id="${review._id}">
          <span class="text-red-400">❤️</span>
          <span>${likes}</span>
        </button>
        <button class="btn-comment flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition" data-id="${review._id}">
          <span class="text-blue-400">💬</span>
          <span>${comments.length}</span>
        </button>
      </div>
    </article>
  `;
}

// Adjuntar event listeners a las tarjetas
function attachCardListeners() {
    // Likes
    document.querySelectorAll('.btn-like').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const reviewId = e.currentTarget.dataset.id;
            await handleLike(reviewId);
        });
    });

    // Comentarios
    document.querySelectorAll('.btn-comment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reviewId = e.currentTarget.dataset.id;
            openCommentsModal(reviewId);
        });
    });
}

// Manejar like
async function handleLike(reviewId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Debes iniciar sesión para dar like', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}/like`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al dar like');

        showToast('¡Te gusta esta reseña!', 'success');
        await loadFeed(); // Recargar para actualizar el contador
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al dar like', 'error');
    }
}

// Abrir modal de comentarios
async function openCommentsModal(reviewId) {
    currentReviewId = reviewId;
    const modal = document.getElementById('modalComentarios');
    modal.classList.remove('hidden');

    await loadComments(reviewId);
}

// Cargar comentarios
async function loadComments(reviewId) {
    const listaEl = document.getElementById('listaComentarios');
    listaEl.innerHTML = '<p class="text-gray-400">Cargando comentarios...</p>';

    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}/comments`);
        if (!response.ok) throw new Error('Error al cargar comentarios');

        const comments = await response.json();

        if (comments.length === 0) {
            listaEl.innerHTML = '<p class="text-gray-400">No hay comentarios aún. ¡Sé el primero!</p>';
            return;
        }

        listaEl.innerHTML = comments.map(comment => `
      <div class="bg-gray-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="font-semibold text-cyan-400">${escapeHtml(comment.usuario?.nombre || 'Usuario')}</span>
          <span class="text-xs text-gray-400">${new Date(comment.fecha).toLocaleDateString()}</span>
        </div>
        <p class="text-gray-200">${escapeHtml(comment.texto)}</p>
      </div>
    `).join('');
    } catch (error) {
        console.error('Error:', error);
        listaEl.innerHTML = '<p class="text-red-400">Error al cargar comentarios</p>';
    }
}

// Enviar comentario
async function sendComment() {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Debes iniciar sesión para comentar', 'error');
        return;
    }

    const inputEl = document.getElementById('inputComentario');
    const texto = inputEl.value.trim();

    if (!texto) {
        showToast('Escribe un comentario', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reviews/${currentReviewId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ comment: texto })
        });

        if (!response.ok) throw new Error('Error al enviar comentario');

        showToast('¡Comentario enviado!', 'success');
        inputEl.value = '';
        await loadComments(currentReviewId);
        await loadFeed(); // Actualizar contador de comentarios
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al enviar comentario', 'error');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Cerrar sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Modal de comentarios
    document.getElementById('btnCerrarModal').addEventListener('click', () => {
        document.getElementById('modalComentarios').classList.add('hidden');
        currentReviewId = null;
    });

    document.getElementById('btnEnviarComentario').addEventListener('click', sendComment);

    // Filtros
    document.getElementById('filterCategory').addEventListener('change', applyFilters);
    document.getElementById('filterSort').addEventListener('change', applyFilters);
}

// Aplicar filtros
function applyFilters() {
    const category = document.getElementById('filterCategory').value;
    const sort = document.getElementById('filterSort').value;

    let filtered = [...allReviews];

    // Filtrar por categoría
    if (category) {
        filtered = filtered.filter(r => r.category === category);
    }

    // Ordenar
    if (sort === 'likes') {
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sort === 'rating') {
        filtered.sort((a, b) => (b.calificacion || b.rating || 0) - (a.calificacion || a.rating || 0));
    } else {
        // Por defecto: más recientes
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    renderReviews(filtered);
}

// Iniciar cuando cargue la página
document.addEventListener('DOMContentLoaded', initFeed);
