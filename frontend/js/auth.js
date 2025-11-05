import { apiLogin, apiRegister } from './utils/api.js';
import { showFieldError, showFormError } from './utils/validation.js';

// Mostrar toast
function showToast(msg, color = 'rgba(0,0,0,0.7)') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.style.backgroundColor = color;
  toast.classList.remove('toast-hide');
  toast.classList.add('toast-show');
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
  }, 3000);
}

/**
 * Maneja el proceso de inicio de sesión
 */
export async function handleLogin({
  form,
  email,
  password,
  inputElements = {}
}) {
  try {
    const result = await apiLogin({ email, password });

    if (!result) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!result.ok || !result.token) {
      console.log('Error de autenticación');
      form.classList.add('shake');

      if (inputElements.email) {
        inputElements.email.classList.add('border-red-500', 'shake');
        inputElements.email.disabled = false;
      }
      if (inputElements.password) {
        inputElements.password.classList.add('border-red-500', 'shake');
        inputElements.password.disabled = false;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Iniciar sesión';
        submitBtn.classList.remove('loading');
        submitBtn.className =
          'w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-md font-semibold transition';
      }

      const msg = result.message || 'Usuario o contraseña incorrectos';
      showToast(msg, 'rgba(255,0,0,0.7)');

      setTimeout(() => {
        form.classList.remove('shake');
        if (inputElements.email)
          inputElements.email.classList.remove('border-red-500', 'shake');
        if (inputElements.password)
          inputElements.password.classList.remove('border-red-500', 'shake');
      }, 600);

      return result;
    }

    // Login exitoso - Guardar datos
    localStorage.setItem('token', result.token);
    if (result.usuario) {
      localStorage.setItem('usuario', JSON.stringify(result.usuario));
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('error-message');

    if (errorDiv) {
      errorDiv.classList.add('hidden');
    }

    // ✅ Mostrar solo el check centrado, sin fondo ni borde
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="block mx-auto" width="28" height="28" viewBox="0 0 24 24" stroke="green" fill="none" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      `;
      submitBtn.className = 'p-0 m-0 bg-transparent border-none shadow-none';
    }

    setTimeout(() => {
      const main = form.closest('main');
      if (main) {
        main.style.transition = 'all 0.5s ease-out';
        main.style.opacity = '0';
        main.style.transform = 'translateY(-20px)';
      }
    }, 1000);

    setTimeout(() => {
      window.location.href = './dashboard.html';
    }, 1500);

    return result;
  } catch (err) {
    console.error('Error de red:', err);

    if (inputElements.email) {
      inputElements.email.disabled = false;
      inputElements.email.classList.remove('border-red-500');
    }
    if (inputElements.password) {
      inputElements.password.disabled = false;
      inputElements.password.classList.remove('border-red-500');
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Iniciar sesión';
      submitBtn.className =
        'w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-md font-semibold transition';
    }

    showToast(
      'Error de conexión. Por favor intenta de nuevo.',
      'rgba(255,0,0,0.7)'
    );
  }
}

/**
 * Maneja el proceso de registro
 */
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
      localStorage.setItem('token', result.token);
      if (result.usuario) {
        localStorage.setItem('usuario', JSON.stringify(result.usuario));
      }

      if (inputElements.nombre) {
        inputElements.nombre.classList.remove('border-red-500');
      }
      if (inputElements.email) {
        inputElements.email.classList.remove('border-red-500');
      }
      if (inputElements.password) {
        inputElements.password.classList.remove('border-red-500');
      }

      window.location.href = './login.html';
    } else {
      const msg = result.message || 'Error en el registro';
      if (
        msg.toLowerCase().includes('email') &&
        errorElements.email &&
        inputElements.email
      ) {
        showFieldError(inputElements.email, errorElements.email, msg);
      } else if (errorElements.form) {
        showFormError(errorElements.form, msg);
      }
    }
  } catch (err) {
    console.error('Network error registering user:', err);
    if (errorElements.form) {
      showFormError(
        errorElements.form,
        'Error de red: no se pudo contactar al servidor. Asegúrate de que el backend esté corriendo en http://localhost:5000'
      );
    }
  }
}
