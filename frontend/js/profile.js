import { apiGetProfile } from './utils/api.js';
import { showToast } from './utils/dom.js';

// Elementos del DOM
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileAvatar = document.getElementById('profileAvatar');
const totalReviews = document.getElementById('totalReviews');
const avgRating = document.getElementById('avgRating');

// Elementos de modales
const avatarModal = document.getElementById('avatarModal');
const deleteModal = document.getElementById('deleteModal');

// Verificar autenticación
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = './login.html';
}

// Cargar datos del perfil
async function loadProfile() {
  try {
    const user = await apiGetProfile();
    if (!user) {
      showToast('Error al cargar perfil', 'error');
      return;
    }

    // Actualizar UI
    profileName.textContent = user.nombre;
    profileEmail.textContent = user.email;
    if (user.avatar) {
      profileAvatar.src = user.avatar;
    }

    // Cargar estadísticas cuando estén implementadas
    // totalReviews.textContent = user.reviewCount || '0';
    // avgRating.textContent = user.averageRating?.toFixed(1) || '0.0';

  } catch (error) {
    console.error('Error cargando perfil:', error);
    showToast('Error al cargar el perfil', 'error');
  }
}

// Event Listeners
document.getElementById('changeAvatar').addEventListener('click', () => {
  avatarModal.classList.remove('hidden');
  avatarModal.classList.add('flex');
});

document.getElementById('cancelAvatar').addEventListener('click', () => {
  avatarModal.classList.add('hidden');
  avatarModal.classList.remove('flex');
});

document.getElementById('deleteAccount').addEventListener('click', () => {
  deleteModal.classList.remove('hidden');
  deleteModal.classList.add('flex');
});

document.getElementById('cancelDelete').addEventListener('click', () => {
  deleteModal.classList.add('hidden');
  deleteModal.classList.remove('flex');
});

// Toggle menú de usuario
const userMenu = document.getElementById('userMenu');
const userDropdown = document.getElementById('userDropdown');

userMenu.addEventListener('click', () => {
  userDropdown.classList.toggle('hidden');
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!userMenu.contains(e.target)) {
    userDropdown.classList.add('hidden');
  }
});

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = './login.html';
});

// Cargar perfil al iniciar
loadProfile();