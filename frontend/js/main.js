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

function initUserMenu(){
  const nav = document.querySelector('nav');
  const user = JSON.parse(localStorage.getItem('user'));
  if(user){
    nav.querySelectorAll('a').forEach(a => a.remove()); // quitamos login/register

    // URL por defecto del avatar
    const defaultAvatar = 'https://i.ibb.co/2NwYqJ1/default-avatar.png';

    const menu = document.createElement('div');
    menu.className = 'flex items-center gap-2 relative';
    menu.innerHTML = `
      <img src="${user.avatar || defaultAvatar}" alt="Avatar" class="w-8 h-8 rounded-full border border-white/20">
      <span class="text-white font-medium">${user.name}</span>
      <div class="absolute right-0 mt-10 bg-black/80 backdrop-blur-sm rounded-md p-2 hidden group-hover:block">
        <a href="./dashboard.html" class="block px-4 py-2 hover:bg-white/10 rounded">Mis reseñas</a>
        <a href="#" id="logoutBtn" class="block px-4 py-2 hover:bg-white/10 rounded">Cerrar sesión</a>
      </div>
    `;
    menu.classList.add('group', 'cursor-pointer');
    nav.appendChild(menu);

    const logoutBtn = menu.querySelector('#logoutBtn');
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      location.reload();
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initScrollAnimations(false);

  const reseñasEl = document.getElementById('reseñas');
  if(reseñasEl) await initPublicReviews();

  const dashboardEl = document.getElementById('misReseñas');
  if(dashboardEl) await initDashboard();

  initUserMenu();
});

// Mostrar avatar si el usuario está logueado
const userArea = document.getElementById('userArea');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const userMenu = document.getElementById('userMenu');
const userAvatar = document.getElementById('userAvatar');
const dropdown = document.getElementById('dropdown');
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');

const userData = localStorage.getItem('user');
if(userData){
  const user = JSON.parse(userData);

  // Ocultar botones de login/register
  loginBtn.classList.add('hidden');
  registerBtn.classList.add('hidden');

  // Mostrar menú de usuario
  userMenu.classList.remove('hidden');
  userAvatar.src = user.avatar || 'https://www.w3schools.com/howto/img_avatar.png';
  usernameDisplay.textContent = user.name || 'Usuario';

  // Toggle dropdown
  userAvatar.addEventListener('click', () => {
    dropdown.classList.toggle('hidden');
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.reload();
  });
}
