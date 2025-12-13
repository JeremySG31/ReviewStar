import { handleLogin } from './auth.js';
import { clearFormErrors, showFormError } from './utils/validation.js';

// --- Si ya hay sesión activa, redirigir al perfil ---
const token = localStorage.getItem('token');
if (token) {
  window.location.replace('./profile.html');
}

// --- Elementos del DOM ---
const form = document.getElementById('loginForm');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const submitBtn = form.querySelector('button[type="submit"]');

// --- Observador para animaciones ---
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
    else entry.target.classList.remove('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// --- Toggle para mostrar/ocultar contraseña ---
const toggle = document.getElementById('togglePassword');
if (toggle && passwordEl) {
  toggle.addEventListener('click', () => {
    passwordEl.type = passwordEl.type === 'password' ? 'text' : 'password';
  });
}

// --- Función para restaurar el formulario ---
function restoreForm() {
  emailEl.disabled = false;
  passwordEl.disabled = false;
  submitBtn.disabled = false;
  submitBtn.innerHTML = 'Iniciar sesión';
  submitBtn.className = 'w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-md font-semibold transition';
}

// --- Manejo del formulario ---
form.addEventListener('submit', async e => {
  e.preventDefault();

  clearFormErrors(
    [document.getElementById('emailError'), document.getElementById('passwordError'), document.getElementById('formError')],
    [emailEl, passwordEl]
  );

  const email = emailEl?.value.trim() || '';
  const password = passwordEl?.value || '';

  if (!email || !password) {
    showFormError(document.getElementById('formError'), 'Por favor completa todos los campos');
    return;
  }

  // Deshabilitar inputs mientras se procesa
  emailEl.disabled = true;
  passwordEl.disabled = true;
  submitBtn.disabled = true;

  try {
    const result = await handleLogin({
      form,
      email,
      password,
      inputElements: { email: emailEl, password: passwordEl }
    });

    if (result && result.ok) {
      // Login exitoso → mostrar check centrado
      submitBtn.innerHTML = `
        <span class="flex justify-center items-center w-full h-full">
          <svg width="30" height="30" viewBox="0 0 24 24" stroke="green" fill="none" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </span>
      `;
      submitBtn.className = 'flex justify-center items-center w-full h-12 bg-transparent border-none shadow-none';

    } else {
      // Login fallido → restaurar formulario sin check
      restoreForm();
    }

  } catch (err) {
    console.error('Error en login:', err);
    restoreForm();
    showFormError(document.getElementById('formError'), 'Error al iniciar sesión. Por favor intenta de nuevo.');
  }
});
