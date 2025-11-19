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
  // options: { controls: true, prefix: '' }
  const prefix = options.prefix || '';
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

  const imgHtml = image ? `<img src="${image}" alt="${escapeHtml(title)}" class="w-full h-32 object-cover rounded-md mb-3" onerror="this.closest('article').remove()">` : '';

  const short = (description || '').length > 140 ? (description || '').slice(0, 140) + '...' : (description || '');

  // Renderiza la categoría con un estilo de "píldora"
  const categoryHtml = `<span class="absolute top-2 left-2 bg-blue-600/80 text-white text-xs font-semibold px-2 py-1 rounded-full">${escapeHtml(category)}</span>`;

  return `
    <article class="review-card bg-gray-800 rounded-xl p-4 relative shadow hover:shadow-lg transition" data-id="${review._id}">
      ${controlsHtml}
      ${imgHtml}
      <h3 class="font-semibold text-lg mb-1">${escapeHtml(title)}</h3>
      <p class="text-sm text-gray-300 mb-3">${escapeHtml(short)}</p>
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-400 mt-2">por ${escapeHtml(author?.nombre || author?.name || 'Anónimo')}</div>
        <div class="flex items-center gap-2">
          ${renderStars(rating)}
          <span class="text-yellow-400 font-semibold ml-2">${rating.toFixed(1)}/5.0</span>
        </div>
      </div>
      <div class="flex items-center justify-end gap-4 mt-4">
        <button class="text-sm btn-like px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition" data-id="${review._id}">❤️ ${likes}</button>
        <button class="text-sm btn-comment px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition" data-id="${review._id}">💬 ${comments.length}</button>
      </div>
    </article>
  `;
}

export function escapeHtml(str = '') {
  return String(str).replace(/[&<>"'`=\/]/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
  }[s]));
}
