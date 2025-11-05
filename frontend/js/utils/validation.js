// Validaciones reutilizables (formulario, URL, campos de registro)

// Validación de campos de registro
export function validateRegistrationFields(nombre, email, password) {
  const errors = [];
  
  if (!nombre) {
    errors.push({ field: 'nombre', message: 'Por favor ingresa un usuario.' });
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Ingresa un correo válido.' });
  }
  
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/; // Igual al backend
  if (!pwdRegex.test(password)) {
    errors.push({
      field: 'password',
      message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y un carácter especial (por ejemplo @).'
    });
  }
  
  return errors;
}

// Funciones de manejo de errores para formularios
export function clearFormErrors(errorElements, inputElements) {
  errorElements.forEach(el => {
    if (!el) return;
    el.textContent = '';
    el.classList.add('hidden');
  });
  inputElements.forEach(i => {
    if (!i) return;
    i.classList.remove('border-red-500');
  });
}

export function showFieldError(inputEl, errorEl, msg) {
  if (inputEl) inputEl.classList.add('border-red-500');
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }
}

export function showFormError(formErrorEl, msg) {
  if (!formErrorEl) return;
  formErrorEl.textContent = msg;
  formErrorEl.classList.remove('hidden');
}

export function isValidURL(value) {
  if (!value) return true; // opcional
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function validateReviewPayload(payload) {
  const { titulo, categoria, descripcion, calificacion, imagenURL } = payload;
  if (!titulo || !categoria || !descripcion) {
    return { ok: false, msg: 'Completa título, categoría y descripción.' };
  }
  if (typeof calificacion !== 'number' || isNaN(calificacion)) {
    return { ok: false, msg: 'Selecciona una calificación válida.' };
  }
  if (imagenURL && !isValidURL(imagenURL)) {
    return { ok: false, msg: 'La URL de la imagen no es válida.' };
  }
  return { ok: true };
}
