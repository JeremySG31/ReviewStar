// main.js — Punto de entrada del frontend
// Importa módulos y aplica efectos visuales elegantes

import { initPublicReviews, initDashboard } from './reviews.js';

/**
 * Inicializa animaciones de aparición/desaparición al hacer scroll.
 * Los elementos con clases fade-up, fade-in, scale-in se animan.
 * @param {boolean} once - Si true, las animaciones solo ocurren una vez.
 */
function initScrollAnimations(once = false) {
  const animatedElements = document.querySelectorAll(".fade-up, .fade-in, .scale-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedElements.forEach((el) => observer.observe(el));
}

// Inicialización principal al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  // Animaciones al hacer scroll; permite que se repitan si se sube/baja
  initScrollAnimations(false);

  // Manejo seguro de reseñas públicas
  const reseñasEl = document.getElementById('reseñas');
  if (reseñasEl) {
    try {
      await initPublicReviews();
    } catch (err) {
      console.error('Error al inicializar reseñas públicas:', err);
    }
  }

  // Manejo seguro del dashboard
  const dashboardEl = document.getElementById('misReseñas');
  if (dashboardEl) {
    try {
      await initDashboard();
    } catch (err) {
      console.error('Error al inicializar dashboard:', err);
    }
  }

  // Login/Register se manejan por su propio JS y animaciones
});
