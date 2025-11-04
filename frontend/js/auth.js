import { apiLogin, apiRegister } from './utils/api.js';
import { showFieldError, showFormError } from './utils/validation.js';

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

export async function handleLogin({
  form,
  email,
  password,
  inputElements = {}
}) {
  try {
    const result = await apiLogin({ email, password });
    
    if (result.ok && result.token) {
      // Login exitoso
      localStorage.setItem('token', result.token);
      if (result.usuario) {
        localStorage.setItem('usuario', JSON.stringify(result.usuario));
      }

      // Efecto de transición suave
      const main = form.closest('main');
      if (main) {
        main.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      }

      // Redirigir al dashboard
      setTimeout(() => {
        window.location.href = './dashboard.html';
      }, 500);
    } else {
      // Error de autenticación
      form.classList.add('shake');
      if (inputElements.email) inputElements.email.classList.add('border-red-500');
      if (inputElements.password) inputElements.password.classList.add('border-red-500');
      
      const msg = result.message || 'Usuario o contraseña incorrectos';
      showToast(msg, 'rgba(255,0,0,0.7)');
      
      // Quitar efecto de shake
      setTimeout(() => {
        form.classList.remove('shake');
        if (inputElements.email) inputElements.email.classList.remove('border-red-500');
        if (inputElements.password) inputElements.password.classList.remove('border-red-500');
      }, 400);
    }
  } catch (err) {
    console.error('Error de red:', err);
    showToast('Error de red. Intenta de nuevo.', 'rgba(255,0,0,0.7)');
  }
}

export async function handleRegister({ 
  form,
  nombre,
  email,
  password,
  errorElements = {},
  inputElements = {}
}) {
  try {
    const result = await apiRegister({ nombre, email, password });
    if (result.ok && result.token) {
      // Registro exitoso
      localStorage.setItem('token', result.token);
      if (result.usuario) localStorage.setItem('usuario', JSON.stringify(result.usuario));
      
      // Limpiar errores visuales
      if (inputElements.nombre) inputElements.nombre.classList.remove('border-red-500');
      if (inputElements.email) inputElements.email.classList.remove('border-red-500');
      if (inputElements.password) inputElements.password.classList.remove('border-red-500');
      
      // Redirigir al login
      window.location.href = './login.html';
    } else {
      // Mostrar error devuelto por backend
      const msg = result.message || 'Error en el registro';
      if (msg.toLowerCase().includes('email') && errorElements.email) {
        showFieldError(inputElements.email, errorElements.email, msg);
      } else if (errorElements.form) {
        showFormError(errorElements.form, msg);
      }
    }
  } catch (err) {
    console.error('Network error registering user:', err);
    if (errorElements.form) {
      showFormError(errorElements.form, 'Error de red: no se pudo contactar al servidor. Asegúrate de que el backend esté corriendo en http://localhost:5000');
    }
  }
}
