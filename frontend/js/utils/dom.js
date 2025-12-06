// Funciones para renderizar estrellas, tarjetas y utilidades DOM

// Renderiza estrellas (calificación de 1..10). Devuelve HTML string.
export function renderStars(rating) {
  // rating puede ser entero (1-5)
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  let out = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= full) out += '<span class="star-view">★</span>';
    else if (half && i === full + 1) out += '<span class="star-view"><span class="half-star">★</span><span class="empty-star">★</span></span>';
    else out += '<span class="star-view">☆</span>';
  }
  return `<span class="star-group">${out}</span>`;
}

// Crea el HTML de una tarjeta de reseña (frontend generic)
export function createReviewCard(review, options = {}) {
  // review can come from backend (title, description, image, rating, user)
  // or from frontend shapes (titulo, descripcion, imagenURL, calificacion, autor)
  // options: { controls: true, prefix: '', showInteractions: false }
  const prefix = options.prefix || '';
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

  const imgHtml = image ? `<img src="${image}" alt="${escapeHtml(title)}" class="w-full h-48 object-contain rounded-md mb-3 bg-gray-900" onerror="this.closest('article').remove()">` : '';

  const short = (description || '').length > 300 ? (description || '').slice(0, 300) + '...' : (description || '');

  // Renderiza la categoría con un estilo de "píldora"
  const categoryHtml = `<span class="absolute top-2 left-2 bg-blue-600/80 text-white text-xs font-semibold px-2 py-1 rounded-full">${escapeHtml(category)}</span>`;

  // Botones de interacción solo si showInteractions es true
  const interactionsHtml = showInteractions ? `
    <div class="flex items-center justify-end gap-4 mt-4">
      <button class="text-sm btn-like px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition" data-id="${review._id}">❤️ ${likes}</button>
      <button class="text-sm btn-comment px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition" data-id="${review._id}">💬 ${comments.length}</button>
    </div>` : '';

  return `
    <article class="review-card bg-gray-800 rounded-xl p-4 relative shadow hover:shadow-lg transition" data-id="${review._id}">
      ${controlsHtml}
      ${imgHtml}
      <h3 class="font-semibold text-lg mb-1">${escapeHtml(title)}</h3>
      <p class="text-sm text-gray-300 mb-3 line-clamp-6">${escapeHtml(short)}</p>
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-400 mt-2">por ${escapeHtml(author?.nombre || author?.name || 'Anónimo')}</div>
        <div class="flex items-center gap-2">
          ${renderStars(rating)}
          <span class="text-yellow-400 font-semibold ml-2">${rating.toFixed(1)}/5.0</span>
        </div>
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
