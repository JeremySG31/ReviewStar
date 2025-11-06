// main.js — Punto de entrada del frontend
import { initPublicReviews, initDashboard } from './reviews.js';

function initScrollAnimations(once = false){
  const animatedElements = document.querySelectorAll(".fade-up, .fade-in, .scale-in");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        if(once) observer.unobserve(entry.target);
      } else if(!once){
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.2 });
  animatedElements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', async () => {
  initScrollAnimations(false);

  const reseñasEl = document.getElementById('reseñas');
  if(reseñasEl) await initPublicReviews();

  const dashboardEl = document.getElementById('misReseñas');
  if(dashboardEl) await initDashboard();

  // --- LÓGICA DE LA BARRA DE NAVEGACIÓN ---
  // Se mueve aquí para garantizar que el DOM esté completamente cargado.
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const userMenu = document.getElementById('userMenu');
  const usernameDisplay = document.getElementById('usernameDisplay');
  const logoutBtn = document.getElementById('logoutBtn');
  // Seleccionamos los botones de registro del cuerpo de la página ("Call to Action")
  const ctaHeaderRegister = document.getElementById('cta-header-register');
  const ctaFooterRegister = document.getElementById('cta-footer-register');

  // La clave correcta guardada en el login es 'usuario'
  const userData = localStorage.getItem('usuario');

  if (userData) {
    const user = JSON.parse(userData);

    // Si estamos en una página con botones de login/registro, los ocultamos.
    if (loginBtn) loginBtn.classList.add('hidden');
    if (registerBtn) registerBtn.classList.add('hidden');
    if (ctaHeaderRegister) ctaHeaderRegister.style.display = 'none';
    if (ctaFooterRegister) ctaFooterRegister.style.display = 'none';

    // Si existe el menú de usuario (en index.html), lo mostramos.
    if (userMenu) {
      userMenu.classList.remove('hidden');
    }

    // Actualizamos el nombre de usuario donde se encuentre.
    if (usernameDisplay) usernameDisplay.textContent = user.nombre || 'Usuario';

    // Añadimos el evento de logout SIEMPRE que el botón exista.
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        // Redirigimos al inicio para una mejor experiencia de usuario.
        window.location.href = './index.html';
      });
    }
  }
});
