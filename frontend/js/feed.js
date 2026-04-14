import {
    API_BASE,
    apiDeleteComment,
    apiEditComment,
    apiReactToComment,
    apiGetComments
} from './utils/api.js';
import { showToast, escapeHtml } from './utils/dom.js';

let currentReviewId = null;
let allReviews = [];

async function initFeed() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('./login.html');
        return;
    }

    await loadUserName();
    await loadFeed();
    setupEventListeners();
    initCommentModals();
}

async function loadUserName() {
    const userNameLink = document.getElementById('userNameLink');
    if (!userNameLink) return;

    const localUser = localStorage.getItem('usuario');
    if (localUser) {
        try {
            const user = JSON.parse(localUser);
            userNameLink.textContent = user.nombre || 'Usuario';
        } catch (e) {
            console.error(e);
        }
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const user = await response.json();
            if (user.nombre) {
                userNameLink.textContent = user.nombre;
                localStorage.setItem('usuario', JSON.stringify(user));
            }
        }
    } catch (error) {
        console.error('Error cargando nombre:', error);
    }
}

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

function renderReviews(reviews) {
    const containerEl = document.getElementById('feedContainer');
    containerEl.innerHTML = '';

    reviews.forEach(review => {
        const card = createFeedCard(review);
        containerEl.innerHTML += card;
    });

    attachCardListeners();
}

function createFeedCard(review) {
    const author = review.autor || review.user || { nombre: 'Anónimo' };
    const likes = review.likes || 0;
    const comments = review.comments || [];
    const rating = review.calificacion || review.rating || 0;
    const image = review.imagenURL || review.image || '';
    const title = review.titulo || review.title || '';
    const description = review.descripcion || review.description || '';
    const category = review.category || 'Sin categoría';

    // Generar fecha relativa (ej. "Hace 2 horas")
    const reviewDate = new Date(review.createdAt || Date.now());
    const now = new Date();
    const diffMs = now - reviewDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let dateStr = "Hace un momento";
    if (diffDays > 30) {
        dateStr = reviewDate.toLocaleDateString();
    } else if (diffDays > 0) {
        dateStr = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
        dateStr = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
        dateStr = `Hace ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    }

    const imgHtml = '<img src="' + (image || 'https://placehold.co/400x200/1f2937/6b7280?text=Sin+imagen') + '" alt="' + escapeHtml(title) + '" loading="lazy" class="w-full h-48 object-cover rounded-md mb-3 bg-gray-900" onerror="this.src=\'https://placehold.co/400x200/1f2937/6b7280?text=Imagen+no+disponible\'">';

    const isLongText = description.length > 200;
    const shortDescription = isLongText ? description.substring(0, 200) + '...' : description;

    return '<article class="review-card bg-gray-800 rounded-xl p-6 relative shadow-lg hover:shadow-2xl transition" data-id="' + review._id + '">' +
        '<div class="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">' +
        escapeHtml(category) +
        '</div>' +
        imgHtml +
        '<h3 class="font-bold text-xl mb-2 leading-tight">' + escapeHtml(title) + '</h3>' +
        '<div class="mb-4">' +
        '<p class="text-sm text-gray-300 leading-relaxed review-description" data-full="' + escapeHtml(description) + '">' +
        escapeHtml(shortDescription) +
        '</p>' +
        (isLongText ? '<button class="btn-ver-mas text-xs text-cyan-400 hover:text-cyan-300 mt-1 font-semibold">Ver más</button>' : '') +
        '</div>' +
        '<div class="flex items-center justify-between mb-4">' +
        '<div class="flex items-center gap-2">' +
        '<span class="text-yellow-400">⭐</span>' +
        '<span class="font-semibold">' + rating.toFixed(1) + '/5.0</span>' +
        '</div>' +
        '<div class="flex items-center gap-2 text-xs text-gray-400 text-right">' +
        '<div class="text-right">' +
        '<span class="block text-gray-300 font-semibold">' + escapeHtml(author.nombre || author.name || 'Anónimo') + '</span>' +
        '<span class="block">' + dateStr + '</span>' +
        '</div>' +
        (author.avatar ? '<img src="' + escapeHtml(author.avatar) + '" style="width: 32px; height: 32px; min-width: 32px; min-height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #4b5563; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">' : '<div style="width: 32px; height: 32px; min-width: 32px; min-height: 32px; border-radius: 50%; background-color: #1f2937; border: 1px solid #4b5563; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px;">👤</div>') +
        '</div>' +
        '</div>' +
        '<div class="flex items-center gap-4 pt-4 border-t border-gray-700">' +
        '<button class="btn-like flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition" data-id="' + review._id + '">' +
        '<span class="text-red-400">❤️</span>' +
        '<span>' + likes + '</span>' +
        '</button>' +
        '<button class="btn-comment flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition" data-id="' + review._id + '">' +
        '<span class="text-blue-400">💬</span>' +
        '<span>' + comments.length + '</span>' +
        '</button>' +
        '</div>' +
        '</article>';
}

function attachCardListeners() {
    document.querySelectorAll('.btn-like').forEach(btn => {
        btn.addEventListener('click', e => handleLike(e.currentTarget.dataset.id));
    });

    document.querySelectorAll('.btn-comment').forEach(btn => {
        btn.addEventListener('click', e => openCommentsModal(e.currentTarget.dataset.id));
    });

    document.querySelectorAll('.btn-ver-mas').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.target.closest('.review-card');
            const descriptionP = card.querySelector('.review-description');
            const fullText = descriptionP.dataset.full;

            if (e.target.textContent === 'Ver más') {
                descriptionP.textContent = fullText;
                e.target.textContent = 'Ver menos';
            } else {
                const shortText = fullText.substring(0, 200) + '...';
                descriptionP.textContent = shortText;
                e.target.textContent = 'Ver más';
            }
        });
    });
}

async function handleLike(reviewId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Debes iniciar sesión para dar like', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}/like`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al dar like');

        showToast('¡Te gusta esta reseña!', 'success');
        await loadFeed();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al dar like', 'error');
    }
}

async function openCommentsModal(reviewId) {
    currentReviewId = reviewId;
    const modal = document.getElementById('modalComentarios');
    modal.classList.remove('hidden');

    await loadComments(reviewId);
}

async function loadComments(reviewId) {
    const listaEl = document.getElementById('listaComentarios');
    listaEl.innerHTML = '<p class="text-gray-400 animate-pulse">Cargando comentarios...</p>';

    try {
        const comments = await apiGetComments(reviewId);

        if (!comments || comments.length === 0) {
            listaEl.innerHTML = '<p class="text-gray-400 text-center py-4">No hay comentarios aún. ¡Sé el primero!</p>';
            return;
        }

        renderCommentList(comments, reviewId);

    } catch (error) {
        console.error('Error:', error);
        listaEl.innerHTML = '<p class="text-red-400">Error al cargar comentarios</p>';
    }
}

function renderCommentList(comments, reviewId) {
    const listaEl = document.getElementById('listaComentarios');
    
    // Asegurar que comments sea un array
    const commentsList = Array.isArray(comments) ? comments : [];

    const currentUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    const currentUserId = currentUser.id || currentUser._id;
    const htmlParts = [];

    // Header con contador de comentarios
    let headerHtml = '<div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-600">';
    headerHtml += '<h4 class="font-semibold text-lg text-white">Comentarios <span class="text-sm text-gray-400 font-normal">(' + commentsList.length + ')</span></h4>';
    headerHtml += '</div>';

    commentsList.forEach(c => {
        const commentUserId = (c.user && c.user._id) ? c.user._id : c.user;
        const commentUserName = (c.user && c.user.nombre) ? c.user.nombre : 'Usuario';
        const isOwner = currentUserId && commentUserId && commentUserId.toString() === currentUserId.toString();

        const reactions = c.reactions || { '👍': [], '❤️': [], '😂': [] };
        const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '';

        const avatarUrl = (c.user && c.user.avatar) ? c.user.avatar : null;
        let commentHtml = '<div class="flex gap-3 animate-fadeIn comment-item mb-4" data-comment-id="' + c._id + '">';
        commentHtml += '<div class="flex-shrink-0 mt-1">';
        if (avatarUrl) {
            commentHtml += '<img src="' + escapeHtml(avatarUrl) + '" style="width: 32px; height: 32px; min-width: 32px; min-height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #4b5563; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">';
        } else {
            commentHtml += '<div style="width: 32px; height: 32px; min-width: 32px; min-height: 32px; border-radius: 50%; background-color: #1f2937; border: 1px solid #4b5563; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px;">👤</div>';
        }
        commentHtml += '</div>';
        commentHtml += '<div class="w-full bg-gray-700/50 rounded-2xl rounded-tl-none p-3 border border-gray-600/50 shadow-sm relative group">';
        commentHtml += '<div class="flex justify-between items-start mb-1">';
        commentHtml += '<div class="flex-grow">';
        commentHtml += '<span class="text-xs font-bold text-cyan-400">' + escapeHtml(commentUserName) + '</span>';
        if (c.edited) commentHtml += '<span class="text-[10px] text-gray-400 ml-1 italic">(editado)</span>';
        commentHtml += '<span class="text-xs text-gray-500 ml-2">' + dateStr + '</span>';
        commentHtml += '</div>';

        if (isOwner) {
            commentHtml += '<div class="flex gap-1 opacity-100 transition-opacity">';
            commentHtml += '<button class="btn-edit-comment p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded transition" data-comment-id="' + c._id + '" title="Editar">✏️</button>';
            commentHtml += '<button class="btn-delete-comment p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition" data-comment-id="' + c._id + '" title="Eliminar">🗑️</button>';
            commentHtml += '</div>';
        }

        commentHtml += '</div>';
        commentHtml += '<p class="text-gray-200 text-sm leading-relaxed mb-3 comment-text break-words whitespace-pre-wrap">' + escapeHtml(c.text || c) + '</p>';
        commentHtml += '<div class="flex items-center gap-2 pt-2 border-t border-gray-600/30">';

        const hasLike = reactions['👍'].some(id => id.toString() === currentUserId);
        const hasHeart = reactions['❤️'].some(id => id.toString() === currentUserId);
        const hasLaugh = reactions['😂'].some(id => id.toString() === currentUserId);

        commentHtml += '<button class="btn-react flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800/50 hover:bg-gray-700 text-xs transition ' + (hasLike ? 'text-blue-400 ring-1 ring-blue-500/50' : 'text-gray-400') + '" data-comment-id="' + c._id + '" data-reaction="👍">';
        commentHtml += '<span>👍</span> <span class="react-count">' + (reactions['👍'].length || 0) + '</span>';
        commentHtml += '</button>';

        commentHtml += '<button class="btn-react flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800/50 hover:bg-gray-700 text-xs transition ' + (hasHeart ? 'text-red-400 ring-1 ring-red-500/50' : 'text-gray-400') + '" data-comment-id="' + c._id + '" data-reaction="❤️">';
        commentHtml += '<span>❤️</span> <span class="react-count">' + (reactions['❤️'].length || 0) + '</span>';
        commentHtml += '</button>';

        commentHtml += '<button class="btn-react flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800/50 hover:bg-gray-700 text-xs transition ' + (hasLaugh ? 'text-yellow-400 ring-1 ring-yellow-500/50' : 'text-gray-400') + '" data-comment-id="' + c._id + '" data-reaction="😂">';
        commentHtml += '<span>😂</span> <span class="react-count">' + (reactions['😂'].length || 0) + '</span>';
        commentHtml += '</button>';

        commentHtml += '</div>';
        commentHtml += '</div>';
        commentHtml += '</div>';

        htmlParts.push(commentHtml);
    });

    // Siempre aplicar scroll con altura máxima para mantener consistencia
    listaEl.innerHTML = headerHtml + '<div class="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-3">' + htmlParts.join('') + '</div>';
    attachCommentListeners(reviewId);
}

// Variables para modales de comentarios
let pendingDeleteCommentId = null;
let pendingEditCommentId = null;
let currentEditReviewId = null;
let currentDeleteReviewId = null;

function openEditCommentModal(commentId, currentText, reviewId) {
    const modal = document.getElementById('modalEditarComentario');
    const input = document.getElementById('inputEditarComentario');
    if (!modal || !input) return;
    
    pendingEditCommentId = commentId;
    currentEditReviewId = reviewId;
    input.value = currentText;
    modal.classList.remove('hidden');
    input.focus();
}

function closeEditCommentModal() {
    const modal = document.getElementById('modalEditarComentario');
    if (modal) modal.classList.add('hidden');
    pendingEditCommentId = null;
    currentEditReviewId = null;
}

function openDeleteCommentModal(commentId, reviewId) {
    const modal = document.getElementById('modalEliminarComentario');
    if (!modal) return;
    
    pendingDeleteCommentId = commentId;
    currentDeleteReviewId = reviewId;
    modal.classList.remove('hidden');
}

function closeDeleteCommentModal() {
    const modal = document.getElementById('modalEliminarComentario');
    if (modal) modal.classList.add('hidden');
    pendingDeleteCommentId = null;
    currentDeleteReviewId = null;
}

// Inicializar listeners de modales de comentarios
function initCommentModals() {
    // Modal Editar
    const btnCancelarEditar = document.getElementById('btnCancelarEditar');
    const btnConfirmarEditar = document.getElementById('btnConfirmarEditar');
    
    if (btnCancelarEditar) {
        btnCancelarEditar.addEventListener('click', closeEditCommentModal);
    }
    
    if (btnConfirmarEditar) {
        btnConfirmarEditar.addEventListener('click', async () => {
            const input = document.getElementById('inputEditarComentario');
            const newText = input?.value?.trim();
            
            if (newText && pendingEditCommentId && currentEditReviewId) {
                // Guardar reviewId antes de cerrar el modal
                const reviewIdToReload = currentEditReviewId;
                try {
                    await apiEditComment(currentEditReviewId, pendingEditCommentId, newText);
                    showToast('Comentario editado', 'success');
                    closeEditCommentModal();
                    await loadComments(reviewIdToReload);
                } catch (error) {
                    showToast('Error al editar', 'error');
                }
            }
        });
    }
    
    // Modal Eliminar
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    
    if (btnCancelarEliminar) {
        btnCancelarEliminar.addEventListener('click', closeDeleteCommentModal);
    }
    
    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', async () => {
            if (pendingDeleteCommentId && currentDeleteReviewId) {
                // Guardar reviewId antes de cerrar el modal
                const reviewIdToReload = currentDeleteReviewId;
                try {
                    await apiDeleteComment(currentDeleteReviewId, pendingDeleteCommentId);
                    showToast('Comentario eliminado', 'success');
                    closeDeleteCommentModal();
                    await loadComments(reviewIdToReload);
                    await loadFeed();
                } catch (error) {
                    showToast('Error al eliminar', 'error');
                }
            }
        });
    }
}

function attachCommentListeners(reviewId) {
    document.querySelectorAll('#listaComentarios .btn-delete-comment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = e.currentTarget.dataset.commentId;
            if (!commentId) return;
            openDeleteCommentModal(commentId, reviewId);
        });
    });

    document.querySelectorAll('#listaComentarios .btn-edit-comment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = e.currentTarget.dataset.commentId;
            const commentItem = e.target.closest('.comment-item');
            if (!commentId || !commentItem) return;

            const textEl = commentItem.querySelector('.comment-text');
            const currentText = textEl.textContent.trim();
            openEditCommentModal(commentId, currentText, reviewId);
        });
    });

    document.querySelectorAll('#listaComentarios .btn-react').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const btnEl = e.currentTarget;
            const commentId = btnEl.dataset.commentId;
            const reaction = btnEl.dataset.reaction;
            if (!commentId || !reaction) return;

            try {
                await apiReactToComment(reviewId, commentId, reaction);
                await loadComments(reviewId);
            } catch (error) {
                console.error(error);
                showToast('Error al reaccionar', 'error');
            }
        });
    });
}

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
        await loadFeed();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al enviar comentario', 'error');
    }
}

function setupEventListeners() {
    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.replace('./login.html');
    });

    document.getElementById('btnCerrarModal').addEventListener('click', () => {
        document.getElementById('modalComentarios').classList.add('hidden');
        currentReviewId = null;
    });

    document.getElementById('btnEnviarComentario').addEventListener('click', sendComment);

    document.getElementById('filterCategory').addEventListener('change', applyFilters);
    document.getElementById('filterSort').addEventListener('change', applyFilters);
    
    // El buscador filtra en tiempo real
    const searchInput = document.getElementById('filterSearch');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

function applyFilters() {
    const category = document.getElementById('filterCategory').value;
    const sort = document.getElementById('filterSort').value;
    const searchTerm = document.getElementById('filterSearch') ? document.getElementById('filterSearch').value.trim().toLowerCase() : '';
    
    let filtered = [...allReviews];

    if (category) {
        filtered = filtered.filter(r => r.category === category);
    }

    if (searchTerm) {
        filtered = filtered.filter(r => {
            const title = (r.titulo || r.title || '').toLowerCase();
            const desc = (r.descripcion || r.description || '').toLowerCase();
            return title.includes(searchTerm) || desc.includes(searchTerm);
        });
    }

    // Función auxiliar para parsear valores numéricos de forma segura
    const getNum = (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    };

    if (sort === 'likes') {
        // Populares: Likes > Comentarios > Calificación > Fecha
        filtered.sort((a, b) => {
            const likesA = Math.max(getNum(a.likes), Array.isArray(a.likedBy) ? a.likedBy.length : 0);
            const likesB = Math.max(getNum(b.likes), Array.isArray(b.likedBy) ? b.likedBy.length : 0);
            if (likesB !== likesA) return likesB - likesA; 

            const commentsA = Array.isArray(a.comments) ? a.comments.length : 0;
            const commentsB = Array.isArray(b.comments) ? b.comments.length : 0;
            if (commentsB !== commentsA) return commentsB - commentsA;

            const ratingA = getNum(a.calificacion || a.rating);
            const ratingB = getNum(b.calificacion || b.rating);
            if (ratingB !== ratingA) return ratingB - ratingA;

            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    } else if (sort === 'comments') {
        // Comentadas: Comentarios > Likes > Calificación > Fecha
        filtered.sort((a, b) => {
            const countA = Array.isArray(a.comments) ? a.comments.length : 0;
            const countB = Array.isArray(b.comments) ? b.comments.length : 0;
            if (countB !== countA) return countB - countA;

            const likesA = getNum(a.likes);
            const likesB = getNum(b.likes);
            if (likesB !== likesA) return likesB - likesA;

            const ratingA = getNum(a.calificacion || a.rating);
            const ratingB = getNum(b.calificacion || b.rating);
            if (ratingB !== ratingA) return ratingB - ratingA;

            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    } else if (sort === 'rating') {
        // Valoradas: Calificación > Likes > Comentarios > Fecha
        filtered.sort((a, b) => {
            const ratingA = getNum(a.calificacion || a.rating);
            const ratingB = getNum(b.calificacion || b.rating);
            if (ratingB !== ratingA) return ratingB - ratingA;

            const likesA = getNum(a.likes);
            const likesB = getNum(b.likes);
            if (likesB !== likesA) return likesB - likesA;

            const countA = Array.isArray(a.comments) ? a.comments.length : 0;
            const countB = Array.isArray(b.comments) ? b.comments.length : 0;
            if (countB !== countA) return countB - countA;

            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    } else {
        // Por defecto: Más recientes primero
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    renderReviews(filtered);
}

document.addEventListener('DOMContentLoaded', initFeed);
