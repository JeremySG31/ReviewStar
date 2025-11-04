// main.js — Punto de entrada del frontend
// Importa módulos y aplica efectos visuales elegantes

import { initPublicReviews } from './reviews.js';
import { initDashboard } from './reviews.js';

// --- Efectos de scroll (animaciones al aparecer) --- //
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".fade-up, .fade-in, .scale-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // mejora rendimiento
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedElements.forEach((el) => observer.observe(el));
}

// --- Inicialización al cargar la página --- //
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa animaciones de aparición al hacer scroll
  initScrollAnimations();

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
