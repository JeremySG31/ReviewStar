// Funciones para renderizar estrellas, tarjetas y utilidades DOM

// Renderiza estrellas (calificación de 1..10). Devuelve HTML string.
export function renderStars(rating) {
  // rating puede ser entero (1-10)
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  let out = '';
  for (let i = 1; i <= 10; i++) {
    if (i <= full) out += '<span class="star-view">★</span>';
    else if (half && i === full + 1) out += '<span class="star-view"><span class="half-star">★</span><span class="empty-star">★</span></span>';
    else out += '<span class="star-view">☆</span>';
  }
  return `<span class="star-group">${out}</span>`;
}

// Crea el HTML de una tarjeta de reseña (frontend generic)
export function createReviewCard(review, options = {}) {
  // review: { _id, titulo, descripcion, imagenURL, calificacion, autor }
  // options: { controls: true, prefix: '' }
  const prefix = options.prefix || '';
  const controlsHtml = options.controls ? `
    <div class="absolute top-2 right-2 flex gap-2">
      <button class="text-sm btn-edit px-2 py-1 bg-white/10 rounded" data-id="${review._id}">✏️</button>
      <button class="text-sm btn-delete px-2 py-1 bg-red-600/80 rounded" data-id="${review._id}">🗑️</button>
    </div>` : '';

  const imgHtml = review.imagenURL ? `<img src="${review.imagenURL}" alt="${escapeHtml(review.titulo)}" class="w-full h-40 object-cover rounded-md mb-3">` : '';

  const short = review.descripcion.length > 140 ? review.descripcion.slice(0, 140) + '...' : review.descripcion;

  return `
    <article class="bg-gray-800 rounded-xl p-4 relative shadow hover:shadow-lg transition" data-id="${review._id}">
      ${controlsHtml}
      ${imgHtml}
      <h3 class="font-semibold text-lg mb-1">${escapeHtml(review.titulo)}</h3>
      <p class="text-sm text-gray-300 mb-3">${escapeHtml(short)}</p>
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-400">por ${review.autor?.nombre || 'Anónimo'}</div>
        <div class="flex items-center gap-2">
          ${renderStars(review.calificacion || review.rating || 0)}
          <span class="text-yellow-400 font-semibold ml-2">${review.calificacion || review.rating || 0}/10</span>
        </div>
      </div>
    </article>
  `;
}

export function escapeHtml(str = '') {
  return String(str).replace(/[&<>"'`=\/]/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
  }[s]));
}
