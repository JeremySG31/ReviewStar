// main.js
// Punto de entrada para el frontend. Importa módulos y arranca la app.
// Importante: usar <script type="module" src="./js/main.js"></script> en HTML.

import { initPublicReviews } from './reviews.js';
import { initDashboard } from './reviews.js';

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  // Si estamos en index.html (existe #reseñas), inicializa lista pública
  if (document.getElementById('reseñas')) {
    await initPublicReviews();
  }

  // Si estamos en dashboard.html (existe #misReseñas), inicializa dashboard
  if (document.getElementById('misReseñas')) {
    await initDashboard();
  }

  // Si estamos en login/register, no hacemos nada aquí (esas páginas importan auth.js directamente)
});
