import { API_BASE } from './utils/api.js';

async function initializeGoogleAuth() {
    try {
        // Obtener Client ID del backend
        const res = await fetch(`${API_BASE.replace('/api', '')}/api/config`);
        const config = await res.json();

        if (!config.googleClientId) {
            console.warn('Google Client ID no configurado en el backend.');
            return;
        }

        // Inyectar Client ID en el div de configuración
        const gIdOnload = document.getElementById('g_id_onload');
        if (gIdOnload) {
            gIdOnload.setAttribute('data-client_id', config.googleClientId);
        }

        // Cargar script de Google dinámicamente si no está ya
        if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
            const script = document.createElement('script');
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

    } catch (error) {
        console.error('Error inicializando Google Auth:', error);
    }
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', initializeGoogleAuth);
