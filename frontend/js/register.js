import { handleRegister } from './auth.js';
import { validateRegistrationFields, clearFormErrors, showFieldError, showFormError } from './utils/validation.js';

// Log para debug
console.log('Script de registro cargado');

// Elementos del DOM
const form = document.getElementById('registerForm');
const nombreEl = document.getElementById('nombre');
const emailEl = document.getElementById('email');
const passwordInput = document.getElementById('password');
const nombreError = document.getElementById('nombreError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const formErrorEl = document.getElementById('formError');

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
const passwordEl = document.getElementById('password');
if (toggle && passwordEl) {
  toggle.addEventListener('click', () => {
    passwordEl.type = passwordEl.type === 'password' ? 'text' : 'password';
  });
}

// Manejo del formulario de registro
form.addEventListener('submit', async e => {
  e.preventDefault();

  // Limpiar errores previos
  clearFormErrors(
    [nombreError, emailError, passwordError, formErrorEl],
    [nombreEl, emailEl, passwordInput]
  );

  // Obtener valores del formulario
  const nombre = nombreEl?.value.trim() || '';
  const email = emailEl?.value.trim() || '';
  const password = passwordInput?.value || '';

  // Validar campos
  const errors = validateRegistrationFields(nombre, email, password);
  if (errors.length > 0) {
    errors.forEach(error => {
      switch(error.field) {
        case 'nombre':
          showFieldError(nombreEl, nombreError, error.message);
          break;
        case 'email':
          showFieldError(emailEl, emailError, error.message);
          break;
        case 'password':
          showFieldError(passwordInput, passwordError, error.message);
          break;
      }
    });
    return;
  }

  // Intentar registro
  await handleRegister({
    form,
    nombre,
    email,
    password,
    errorElements: {
      nombre: nombreError,
      email: emailError,
      password: passwordError,
      form: formErrorEl
    },
    inputElements: {
      nombre: nombreEl,
      email: emailEl,
      password: passwordInput
    }
  });
});