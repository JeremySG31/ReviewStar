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

  if(userData && loginBtn && registerBtn && userMenu){
    const user = JSON.parse(userData);

    // Ocultar los botones de registro del cuerpo de la página
    if (ctaHeaderRegister) ctaHeaderRegister.style.display = 'none';
    if (ctaFooterRegister) ctaFooterRegister.style.display = 'none';

    // Ocultar botones de login/register usando la clase 'hidden' de Tailwind
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');

    // Mostrar menú de usuario y configurar datos
    if (userMenu) { // El userMenu solo existe en index.html
      userMenu.classList.remove('hidden');
    }
    if (usernameDisplay) usernameDisplay.textContent = user.nombre || 'Usuario';

    // Evento para cerrar sesión
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      window.location.reload();
    });
  } else if (loginBtn && registerBtn) {
    // Si no hay sesión, asegurarse de que los botones de login/registro estén visibles
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
  }
});
