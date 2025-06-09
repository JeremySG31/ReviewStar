let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
const featuredContainer = document.getElementById('featuredContainer');
const reviewsContainer = document.getElementById('reviewsContainer');
const reviewForm = document.getElementById('reviewForm');
const searchInput = document.getElementById('searchInput');
const searchForm = document.getElementById('searchForm');

// Estrellas interactivas para el formulario
function setupRatingStars() {
  const ratingStars = document.getElementById('ratingStars');
  const ratingInput = document.getElementById('rating');
  const ratingValue = document.getElementById('ratingValue');
  let current = 0;

  function render(val) {
    let html = '';
    for (let i = 1; i <= 10; i++) {
      if (val >= i) {
        html += `<span class="star-rate" data-value="${i}">★</span>`;
      } else if (val >= i - 0.5) {
        html += `<span class="star-rate" data-value="${i - 0.5}"><span class="half-star">★</span><span class="empty-star">★</span></span>`;
      } else {
        html += `<span class="star-rate" data-value="${i}">☆</span>`;
      }
    }
    ratingStars.innerHTML = html;
    ratingValue.textContent = val ? `${val}/10` : '';
  }

  ratingStars.onclick = e => {
    if (e.target.classList.contains('star-rate')) {
      current = parseFloat(e.target.dataset.value);
      ratingInput.value = current;
      render(current);
    }
  };
  ratingStars.onmousemove = e => {
    if (e.target.classList.contains('star-rate')) {
      const val = parseFloat(e.target.dataset.value);
      render(val);
    }
  };
  ratingStars.onmouseleave = () => render(current);

  render(0);
  ratingInput.value = '';
}

// Llama a setupRatingStars cuando abras el modal
document.addEventListener('DOMContentLoaded', () => {
  setupRatingStars();
  const modal = document.getElementById('addReviewModal');
  if (modal) {
    modal.addEventListener('show.bs.modal', () => {
      document.getElementById('rating').value = '';
      document.getElementById('ratingValue').textContent = '';
      setupRatingStars();
    });
  }
});

// Estrellas limpias para mostrar en las reseñas
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 10; i++) {
    if (rating >= i) {
      html += `<span class="star-view">★</span>`;
    } else if (rating >= i - 0.5) {
      html += `<span class="star-view"><span class="half-star">★</span><span class="empty-star">★</span></span>`;
    } else {
      html += `<span class="star-view">☆</span>`;
    }
  }
  return `<span class="star-group">${html}</span>`;
}

// Modifica createCard para que el puntaje esté alineado
function createCard(r, idx, idPrefix = '') {
  const shortDesc = r.description.length > 120 ? r.description.substring(0, 120) + '...' : r.description;
  const needsExpand = r.description.length > 120;
  return `
    <div class="card h-100 review-card">
      ${r.image ? `<img src="${r.image}" alt="Imagen de ${r.title}" class="card-img-top">` : ''}
      <div class="actions">
        <button class="btn btn-sm btn-outline-steam-accent" onclick="editReview(${idx})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteReview(${idx})" title="Eliminar">🗑️</button>
      </div>
      <div class="card-body d-flex flex-column">
        <h5 class="card-title review-title">${r.title}</h5>
        <div class="mb-2 d-flex align-items-center gap-2">
          ${renderStars(r.rating)}
          <span class="rating-number" style="color:#ffb400;font-weight:bold;min-width:48px;text-align:left;">${r.rating}/10</span>
        </div>
        <p class="card-text review-description flex-grow-1" id="${idPrefix}desc-${idx}">
          <span class="desc-short">${shortDesc}</span>
          <span class="desc-full d-none">${r.description}</span>
          ${needsExpand ? `<a href="#" class="see-more-link" data-idx="${idx}" data-prefix="${idPrefix}" aria-label="Mostrar más"><span class="arrow">▼</span></a>` : ''}
        </p>
      </div>
    </div>
  `;
}

function renderFeatured() {
  if (!reviews.length) return;
  featuredContainer.innerHTML = reviews.slice(0, 3).map((r, i) =>
    `<div class="carousel-item${i === 0 ? ' active' : ''}">` + createCard(r, i, 'featured-') + `</div>`
  ).join('');
}

function renderAll(category = 'all') {
  const filtered = category === 'all'
    ? reviews
    : reviews.filter(r => r.category === category);
  reviewsContainer.innerHTML = filtered.length
    ? filtered.map((r, i) => `<div class="col-12 col-md-6 col-lg-4" data-category="${r.category}">` + createCard(r, i, '') + `</div>`).join('')
    : `<div id="noResultsMsg">No hay reseñas en esta categoría.</div>`;
}

// Validar datos del formulario
function validateForm(data) {
  if (!data.title || !data.category || !data.description || isNaN(data.rating)) {
    alert('Por favor, completa todos los campos correctamente.');
    return false;
  }
  if (data.image && !isValidURL(data.image)) {
    alert('Por favor, ingresa una URL válida para la imagen.');
    return false;
  }
  return true;
}

// Validar URL
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Estrellas interactivas para calificación
function renderInteractiveStars(rating = 0) {
  let html = '';
  for (let i = 1; i <= 10; i++) {
    const value = i * 0.5;
    const isFull = rating >= value;
    const isHalf = rating >= value - 0.5 && rating < value;
    html += `
      <span class="star-rate" data-value="${value}" style="cursor:pointer; font-size:2rem; display:inline-block; width:18px;">
        ${isFull ? '★' : isHalf ? '<span style="position:relative;display:inline-block;width:18px;"><span style="color:gold;position:absolute;overflow:hidden;width:9px;">★</span><span style="color:gray;">★</span></span>' : '☆'}
      </span>
    `;
    i++; // Avanza de 0.5 en 0.5
  }
  return html;
}

function setupRatingStars() {
  const ratingStars = document.getElementById('ratingStars');
  const ratingInput = document.getElementById('rating');
  const ratingValue = document.getElementById('ratingValue');
  let current = 0;

  function render(val) {
    let html = '';
    for (let i = 1; i <= 10; i++) {
      if (val >= i) {
        html += `<span class="star-rate" data-value="${i}">★</span>`;
      } else if (val >= i - 0.5) {
        html += `<span class="star-rate" data-value="${i - 0.5}"><span class="half-star">★</span><span class="empty-star">★</span></span>`;
      } else {
        html += `<span class="star-rate" data-value="${i}">☆</span>`;
      }
    }
    ratingStars.innerHTML = html;
    ratingValue.textContent = val ? `${val}/10` : '';
  }

  ratingStars.onclick = e => {
    if (e.target.classList.contains('star-rate')) {
      current = parseFloat(e.target.dataset.value);
      ratingInput.value = current;
      render(current);
    }
  };
  ratingStars.onmousemove = e => {
    if (e.target.classList.contains('star-rate')) {
      const val = parseFloat(e.target.dataset.value);
      render(val);
    }
  };
  ratingStars.onmouseleave = () => render(current);

  render(0);
  ratingInput.value = '';
}

// Setup filters and form after DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('.category-filter');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAll(btn.dataset.category);
      // Limpia búsqueda al cambiar filtro
      searchInput.value = '';
      removeNoResultsMsg();
    });
  });

  // Delete
  window.deleteReview = function(idx) {
    reviews.splice(idx, 1);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    renderFeatured(); renderAll(getActiveCategory());
  };

  // Edit
  window.editReview = function(idx) {
    const r = reviews[idx];
    if (!r) return;
    document.getElementById('title').value = r.title;
    document.getElementById('category').value = r.category;
    document.getElementById('image').value = r.image;
    document.getElementById('description').value = r.description;
    document.getElementById('rating').value = r.rating;
    reviewForm.dataset.editIndex = idx;
    const modal = new bootstrap.Modal(document.getElementById('addReviewModal'));
    modal.show();
    setTimeout(() => {
      document.getElementById('title').focus();
      if (window.innerWidth < 600) window.scrollTo(0, 0);
    }, 300);
  };

  // Form submit
  reviewForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      title: document.getElementById('title').value.trim(),
      category: document.getElementById('category').value,
      image: document.getElementById('image').value.trim(),
      description: document.getElementById('description').value.trim(),
      rating: parseInt(document.getElementById('rating').value)
    };
    if (!validateForm(data)) return;

    // Al crear una nueva reseña:
    data.id = data.id || Date.now().toString() + Math.random().toString(36).substr(2, 5);

    const idx = reviewForm.dataset.editIndex;
    if (typeof idx !== "undefined" && idx !== "") {
      reviews[idx] = data;
      delete reviewForm.dataset.editIndex;
    } else {
      reviews.unshift(data);
    }
    localStorage.setItem('reviews', JSON.stringify(reviews));
    reviewForm.reset();
    bootstrap.Modal.getInstance(document.getElementById('addReviewModal')).hide();
    renderFeatured(); renderAll(getActiveCategory());
  });

  // Búsqueda mejorada
  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      renderAll(getActiveCategory());
      removeNoResultsMsg();
      return;
    }
    const filtered = reviews.filter(r =>
      r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query)
    );
    reviewsContainer.innerHTML = filtered.length
      ? filtered.map((r, i) => `<div class="col-12 col-md-6 col-lg-4" data-category="${r.category}">` + highlightCard(createCard(r, i), query) + `</div>`).join('')
      : `<div id="noResultsMsg">No se encontraron resultados para tu búsqueda.</div>`;
  });

  // Limpia mensaje de "no resultados" al escribir
  searchInput.addEventListener('input', function () {
    if (this.value.trim() === '') {
      renderAll(getActiveCategory());
      removeNoResultsMsg();
    }
  });

  // Inicializa reviews si no hay
  if (!reviews.length) {
    reviews = [
      { 
        title: 'Cyberpunk 2077', 
        category: 'juego', 
        description: 'Mundo impresionante con detalles asombrosos. Aunque tuvo un lanzamiento problemático, las actualizaciones han mejorado significativamente la experiencia.', 
        rating: 4, 
        image: 'https://th.bing.com/th/id/OIP.wPzYGtRtFbyVJ6ZU1oaP_AHaEL?rs=1&pid=ImgDetMain' 
      },
      { 
        title: 'The Matrix', 
        category: 'pelicula', 
        description: 'Película revolucionaria que cambió el cine de acción. Una mezcla perfecta de filosofía, ciencia ficción y efectos visuales innovadores.', 
        rating: 5, 
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWLrg0dcElyoE5asST-hBMfO-hY6gXpgLIXA&s' 
      },
      { 
        title: '1984', 
        category: 'libro', 
        description: 'Novela distópica vigente y reveladora. Una obra maestra que explora los peligros del totalitarismo y la vigilancia constante.', 
        rating: 5, 
        image: 'https://th.bing.com/th/id/OIP.z2ZuLIdIECLdJe0lDi4nRgHaKl?rs=1&pid=ImgDetMain' 
      },
      { 
        title: 'Elden Ring', 
        category: 'juego', 
        description: 'Un juego desafiante y visualmente impresionante. La colaboración entre FromSoftware y George R.R. Martin ha dado lugar a un mundo rico en historia y exploración.', 
        rating: 5, 
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg?t=1678296342' 
      },
      { 
        title: 'Inception', 
        category: 'pelicula', 
        description: 'Una obra maestra de Christopher Nolan que combina acción, drama y una narrativa compleja. La exploración de los sueños y la realidad es fascinante.', 
        rating: 4, 
        image: 'https://m.media-amazon.com/images/I/51zUbui+gbL._AC_SY679_.jpg' 
      },
      { 
        title: 'El Principito', 
        category: 'libro', 
        description: 'Un clásico de la literatura que combina simplicidad y profundidad. Una historia conmovedora sobre la amistad, el amor y la importancia de ver más allá de lo superficial.', 
        rating: 3, 
        image: 'https://images-na.ssl-images-amazon.com/images/I/81t2CVWEsUL.jpg' 
      }
    ];
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }

  // Render featured and all reviews
  renderFeatured();
  renderAll();
});

// Helpers
function getActiveCategory() {
  const active = document.querySelector('.category-filter.active');
  return active ? active.dataset.category : 'all';
}

function removeNoResultsMsg() {
  const msg = document.getElementById('noResultsMsg');
  if (msg) msg.remove();
}

// Resalta coincidencias en búsqueda
function highlightCard(cardHtml, query) {
  if (!query) return cardHtml;
  return cardHtml.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
}

document.addEventListener('click', function(e) {
  const link = e.target.closest('.see-more-link, .see-less-link');
  if (link) {
    e.preventDefault();
    const idx = link.getAttribute('data-idx');
    const prefix = link.getAttribute('data-prefix') || '';
    const descElem = document.getElementById(prefix + 'desc-' + idx);
    const shortSpan = descElem.querySelector('.desc-short');
    const fullSpan = descElem.querySelector('.desc-full');
    if (link.classList.contains('see-more-link')) {
      shortSpan.classList.add('d-none');
      fullSpan.classList.remove('d-none');
      link.innerHTML = '<span class="arrow">▲</span>';
      link.classList.remove('see-more-link');
      link.classList.add('see-less-link');
    } else if (link.classList.contains('see-less-link')) {
      shortSpan.classList.remove('d-none');
      fullSpan.classList.add('d-none');
      link.innerHTML = '<span class="arrow">▼</span>';
      link.classList.remove('see-less-link');
      link.classList.add('see-more-link');
    }
  }
});