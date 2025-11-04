import { handleLogin } from './auth.js';
import { clearFormErrors, showFormError } from './utils/validation.js';

// Elementos del DOM
const form = document.getElementById('loginForm');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');

// Observador para animaciones de entrada
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('visible');
    else entry.target.classList.remove('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Toggle para mostrar/ocultar contraseña
const toggle = document.getElementById('togglePassword');
if (toggle && passwordEl) {
  toggle.addEventListener('click', () => {
    passwordEl.type = passwordEl.type === 'password' ? 'text' : 'password';
  });
}

// Manejo del formulario de login
form.addEventListener('submit', async e => {
  e.preventDefault();
  
  // Obtener valores del formulario
  const email = emailEl?.value.trim() || '';
  const password = passwordEl?.value || '';

  // Limpiar errores previos si existen
  clearFormErrors(
    [form], // elementos de error
    [emailEl, passwordEl] // elementos de input
  );

  // Validación básica
  if (!email || !password) {
    showFormError(form, 'Por favor completa todos los campos');
    return;
  }

  // Intentar login
  await handleLogin({
    form,
    email,
    password,
    inputElements: {
      email: emailEl,
      password: passwordEl
    }
  });
});