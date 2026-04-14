// Funciones para renderizar estrellas, tarjetas y utilidades DOM

// Renderiza estrellas (calificación de 0-5). Devuelve HTML string.
export function renderStars(rating) {
  const safeRating = Math.min(5, Math.max(0, rating || 0)); // Limitar entre 0 y 5
  const fullStars = Math.floor(safeRating);
  const hasHalf = safeRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  
  let out = '';
  
  // Estrellas llenas
  for (let i = 0; i < fullStars; i++) {
    out += '<span class="text-yellow-400">★</span>';
  }
  
  // Media estrella (si aplica)
  if (hasHalf) {
    out += '<span class="text-yellow-400 opacity-60">★</span>';
  }
  
  // Estrellas vacías
  for (let i = 0; i < emptyStars; i++) {
    out += '<span class="text-gray-500">☆</span>';
  }
  
  return `<span class="star-group inline-flex">${out}</span>`;
}

// Crea el HTML de una tarjeta de reseña
export function createReviewCard(review, options = {}) {
  const showInteractions = options.showInteractions || false;

  const controlsHtml = options.controls ? `
    <div class="absolute top-2 right-2 flex gap-2">
      <button class="text-sm btn-edit px-2 py-1 bg-white/10 rounded" data-id="${review._id}">✏️</button>
      <button class="text-sm btn-delete px-2 py-1 bg-red-600/80 rounded" data-id="${review._id}">🗑️</button>
    </div>` : '';
  const title = review.titulo || review.title || '';
  const description = review.descripcion || review.description || '';
  const image = review.imagenURL || review.image || review.imagen || '';
  const rating = review.calificacion || review.rating || 0;
  const category = review.category || 'Sin categoría';
  const author = review.autor || review.user || review.usuario || null;
  const likes = review.likes || 0;
  const comments = review.comments || [];

  const imgHtml = `<img src="${image || 'https://placehold.co/400x200/1f2937/6b7280?text=Sin+imagen'}" alt="${escapeHtml(title)}" loading="lazy" class="w-full h-48 object-cover rounded-md mb-3 bg-gray-900" onerror="this.src='https://placehold.co/400x200/1f2937/6b7280?text=Imagen+no+disponible'">`;

  const short = (description || '').length > 300 ? (description || '').slice(0, 300) + '...' : (description || '');

  const categoryHtml = `<span class="absolute top-2 left-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">${escapeHtml(category)}</span>`;

  const interactionsHtml = showInteractions ? `
    <div class="flex items-center justify-end gap-4 mt-4">
      <button class="text-sm btn-like px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition" data-id="${review._id}">❤️ ${likes}</button>
      <button class="text-sm btn-comment px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition" data-id="${review._id}">💬 ${comments.length}</button>
    </div>` : '';

    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const dateStr = new Date(review.createdAt).toLocaleDateString('es-ES', dateOptions);

    const userName = escapeHtml(author?.nombre || author?.name || 'Anónimo');
    const authorHtml = `
      <div class="flex items-center gap-2">
        ${author?.avatar 
          ? `<img src="${escapeHtml(author.avatar)}" class="w-7 h-7 rounded-full object-cover shadow border border-gray-600">`
          : `<div class="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow flex items-center justify-center text-white font-bold text-xs">${userName.charAt(0).toUpperCase()}</div>`
        }
        <span class="text-sm font-semibold text-gray-300 truncate max-w-[120px]">${userName}</span>
      </div>
    `;

  return `
    <article class="review-card bg-gray-800 rounded-xl p-4 relative shadow hover:shadow-lg transition" data-id="${review._id}">
      ${controlsHtml}
      <div class="relative h-48 group">
        <div class="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 transition-transform group-hover:scale-105">
          ${escapeHtml(category)}
        </div>
        <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-yellow-400 text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10 flex items-center gap-1 border border-white/10">
          ★ ${rating.toFixed(1)}
        </div>
        ${imgHtml}
      </div>
      <h3 class="font-semibold text-lg mb-1">${escapeHtml(title)}</h3>
      <p class="text-sm text-gray-300 mb-3 max-h-24 overflow-y-auto custom-scrollbar pr-2">${escapeHtml(short)}</p>
      <div class="flex items-center justify-between">
        ${authorHtml}
        <span class="text-xs text-gray-500 bg-gray-900/50 px-2 py-1 rounded-md">${dateStr}</span>
      </div>
      ${interactionsHtml}
    </article>
  `;
}

export function escapeHtml(str = '') {
  return String(str).replace(/[&<>"'`=\/]/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
  }[s]));
}

// Muestra una notificación tipo Toast
export function showToast(message, type = 'info') {
  // type: 'success', 'error', 'info'
  const toast = document.createElement('div');

  let colors = 'bg-gray-800 border-gray-600 text-white';
  let icon = 'ℹ️';

  if (type === 'success') {
    colors = 'bg-green-900/90 border-green-500/50 text-green-100';
    icon = '✅';
  } else if (type === 'error') {
    colors = 'bg-red-900/90 border-red-500/50 text-red-100';
    icon = '⚠️';
  }

  toast.className = `fixed z-50 flex items-center gap-3 px-6 py-4 rounded-xl border shadow-2xl backdrop-blur-md toast-bottom-show ${colors}`;

  // Force bottom-left position with inline styles to override any defaults
  toast.style.bottom = '20px';
  toast.style.left = '20px';
  toast.style.top = 'auto';
  toast.style.transform = 'none';

  toast.innerHTML = `
    <span class="text-xl">${icon}</span>
    <span class="font-medium">${escapeHtml(message)}</span>
  `;

  document.body.appendChild(toast);

  // Remover después de 3s
  setTimeout(() => {
    toast.classList.remove('toast-bottom-show');
    toast.classList.add('toast-bottom-hide');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}
