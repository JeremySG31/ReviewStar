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

    const imgHtml = '<img src="' + (image || 'https://placehold.co/400x200/1f2937/6b7280?text=Sin+imagen') + '" alt="' + escapeHtml(title) + '" class="w-full h-48 object-cover rounded-md mb-3 bg-gray-900" onerror="this.src=\'https://placehold.co/400x200/1f2937/6b7280?text=Imagen+no+disponible\'">';

    const isLongText = description.length > 200;
    const shortDescription = isLongText ? description.substring(0, 200) + '...' : description;

    return '<article class="review-card bg-gray-800 rounded-xl p-6 relative shadow-lg hover:shadow-2xl transition" data-id="' + review._id + '">' +
        '<div class="absolute top-3 left-3 bg-blue-600/80 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">' +
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
        '<div class="text-xs text-gray-400">' +
        'por ' + escapeHtml(author.nombre || author.name || 'Anónimo') +
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

    const currentUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    const currentUserId = currentUser.id || currentUser._id;
    const htmlParts = [];

    comments.forEach(c => {
        const commentUserId = (c.user && c.user._id) ? c.user._id : c.user;
        const commentUserName = (c.user && c.user.nombre) ? c.user.nombre : 'Usuario';
        const isOwner = currentUserId && commentUserId && commentUserId.toString() === currentUserId.toString();

        const reactions = c.reactions || { '👍': [], '❤️': [], '😂': [] };
        const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '';

        let commentHtml = '<div class="flex gap-3 animate-fadeIn comment-item mb-4" data-comment-id="' + c._id + '">';
        commentHtml += '<div class="flex-shrink-0 mt-1">';
        commentHtml += '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md select-none">💬</div>';
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

    listaEl.innerHTML = htmlParts.join('');
    attachCommentListeners(reviewId);
}

function attachCommentListeners(reviewId) {
    document.querySelectorAll('#listaComentarios .btn-delete-comment').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const commentId = e.currentTarget.dataset.commentId;
            if (!commentId) return;

            if (confirm('¿Eliminar este comentario?')) {
                try {
                    await apiDeleteComment(reviewId, commentId);
                    showToast('Comentario eliminado', 'success');
                    await loadComments(reviewId);
                    await loadFeed();
                } catch (error) {
                    console.error(error);
                    showToast('Error al eliminar', 'error');
                }
            }
        });
    });

    document.querySelectorAll('#listaComentarios .btn-edit-comment').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const commentId = e.currentTarget.dataset.commentId;
            const commentItem = e.target.closest('.comment-item');
            if (!commentId || !commentItem) return;

            const textEl = commentItem.querySelector('.comment-text');
            const currentText = textEl.textContent.trim();
            const newText = prompt('Editar comentario:', currentText);

            if (newText && newText.trim() && newText !== currentText) {
                try {
                    await apiEditComment(reviewId, commentId, newText.trim());
                    showToast('Comentario editado', 'success');
                    await loadComments(reviewId);
                } catch (error) {
                    console.error(error);
                    showToast('Error al editar', 'error');
                }
            }
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
}

function applyFilters() {
    const category = document.getElementById('filterCategory').value;
    const sort = document.getElementById('filterSort').value;
    let filtered = [...allReviews];

    if (category) {
        filtered = filtered.filter(r => r.category === category);
    }

    // Función auxiliar para parsear valores numéricos de forma segura
    const getNum = (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    };

    if (sort === 'likes') {
        // Lógica mejorada de popularidad: Likes > Calificación > Comentarios
        filtered.sort((a, b) => {
            const likesA = getNum(a.likes);
            const likesB = getNum(b.likes);

            if (likesB !== likesA) return likesB - likesA; // Principal: Likes

            const ratingA = getNum(a.calificacion || a.rating);
            const ratingB = getNum(b.calificacion || b.rating);

            if (ratingB !== ratingA) return ratingB - ratingA; // Desempate 1: Calificación

            // Desempate 2: Fecha (más reciente primero)
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    } else if (sort === 'comments') {
        // Ordenar por cantidad de comentarios
        filtered.sort((a, b) => {
            const countA = Array.isArray(a.comments) ? a.comments.length : 0;
            const countB = Array.isArray(b.comments) ? b.comments.length : 0;
            return countB - countA;
        });
    } else if (sort === 'rating') {
        filtered.sort((a, b) => {
            const ratingA = getNum(a.calificacion || a.rating);
            const ratingB = getNum(b.calificacion || b.rating);
            return ratingB - ratingA;
        });
    } else {
        // Por defecto: Más recientes primero
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    renderReviews(filtered);
}

document.addEventListener('DOMContentLoaded', initFeed);
