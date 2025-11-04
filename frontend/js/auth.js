import { apiLogin, apiRegister } from './utils/api.js';

// Mostrar toast
function showToast(msg, color='rgba(0,0,0,0.7)') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.backgroundColor = color;
  toast.classList.remove('toast-hide');
  toast.classList.add('toast-show');
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
  }, 3000);
}

export async function handleLogin(formEl) {
  const email = formEl.querySelector('#email').value.trim();
  const contrasenia = formEl.querySelector('#contrasenia').value.trim();
  try {
    const res = await apiLogin({ email, contrasenia });
    if (res.token) {
      localStorage.setItem('token', res.token);
      if (res.usuario) localStorage.setItem('usuario', JSON.stringify(res.usuario));
      const main = formEl.closest('main');
      main.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => window.location.href = '/dashboard.html', 500);
    } else {
      formEl.classList.add('shake');
      showToast(res.message || 'Usuario o contraseña incorrectos', 'rgba(255,0,0,0.7)');
      setTimeout(() => formEl.classList.remove('shake'), 400);
    }
  } catch (err) {
    console.error(err);
    showToast('Error de red. Intenta de nuevo.', 'rgba(255,0,0,0.7)');
  }
}

export async function handleRegister(formEl) {
  const nombre = formEl.querySelector('#nombre').value.trim();
  const email = formEl.querySelector('#email').value.trim();
  const contrasenia = formEl.querySelector('#contrasenia').value.trim();
  try {
    const res = await apiRegister({ nombre, email, contrasenia });
    if (res.ok) {
      showToast('Registro exitoso. Redirigiendo...', 'rgba(0,200,0,0.7)');
      setTimeout(() => window.location.href = '/login.html', 1500);
    } else {
      formEl.classList.add('shake');
      showToast(res.message || 'Error en registro.', 'rgba(255,0,0,0.7)');
      setTimeout(() => formEl.classList.remove('shake'), 400);
    }
  } catch (err) {
    console.error(err);
    showToast('Error de red. Intenta de nuevo.', 'rgba(255,0,0,0.7)');
  }
}
