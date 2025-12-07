import { API_BASE } from './utils/api.js';

async function loadEfemeride() {
    const container = document.getElementById('efemerideContent');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/efemerides/hoy`);

        if (!response.ok) throw new Error('Error al cargar efeméride');

        const data = await response.json();

        renderEfemeride(data);
    } catch (error) {
        console.error('Error cargando efemeride:', error);
        container.innerHTML = `
            <div class="text-center p-4">
                <p class="text-xl mb-2">⭐</p>
                <p class="text-gray-300">Hoy es un gran día para descubrir algo nuevo.</p>
            </div>
        `;
    }
}

function renderEfemeride(data) {
    const container = document.getElementById('efemerideContent');
    const { year, text, category, icon, url } = data;

    // Formatear texto si es muy largo
    const displayText = text.length > 800 ? text.substring(0, 800) + '...' : text;

    let html = `
        <div class="animate-fadeIn">
            <div class="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-6 border border-white/5">
                <span class="text-xl">${icon || '📅'}</span>
                <span class="text-gray-400 text-sm border-l border-gray-600 pl-2 ml-1">Año ${year}</span>
            </div>
            
            <p class="text-xl md:text-2xl text-gray-100 leading-relaxed font-light max-w-5xl mx-auto drop-shadow-md">
                "${displayText}"
            </p>
    `;



    html += `</div>`;

    container.innerHTML = html;
}

// Iniciar carga cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadEfemeride);
