// Validaciones reutilizables (formulario, URL)

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
