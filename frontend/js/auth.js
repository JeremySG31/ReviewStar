// Manejo simple de login/registro (frontend) usando utils/api.js
// Se espera que tus páginas login.html y register.html llamen a estas funciones.

import { apiLogin, apiRegister } from './utils/api.js';

export async function handleLogin(formEl) {
  const email = formEl.querySelector('#email').value.trim();
  const contrasenia = formEl.querySelector('#contrasenia').value.trim();
  try {
    const res = await apiLogin({ email, contrasenia });
    if (res.token) {
      localStorage.setItem('token', res.token);
      // opcional: guardar info usuario en localStorage si backend la devuelve
      if (res.usuario) localStorage.setItem('usuario', JSON.stringify(res.usuario));
      // redirige a dashboard o index
      window.location.href = '/dashboard.html';
    } else {
      alert(res.message || 'Error al iniciar sesión');
    }
  } catch (err) {
    console.error(err);
    alert('Error de red. Intenta de nuevo.');
  }
}

export async function handleRegister(formEl) {
  const nombre = formEl.querySelector('#nombre').value.trim();
  const email = formEl.querySelector('#email').value.trim();
  const contrasenia = formEl.querySelector('#contrasenia').value.trim();
  try {
    const res = await apiRegister({ nombre, email, contrasenia });
    if (res.ok) {
      alert('Registro exitoso. Inicia sesión.');
      window.location.href = '/login.html';
    } else {
      alert(res.message || 'Error en registro.');
    }
  } catch (err) {
    console.error(err);
    alert('Error de red. Intenta de nuevo.');
  }
}
