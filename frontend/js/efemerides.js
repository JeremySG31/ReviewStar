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
            <div class="text-center py-8">
                <div class="text-6xl mb-4">🎬</div>
                <p class="text-gray-400">Cargando datos de entretenimiento...</p>
            </div>
        `;
    }
}

function renderEfemeride(data) {
    const container = document.getElementById('efemerideContent');
    const { year, text, category, icon } = data;

    // Formatear texto si es muy largo
    const displayText = text.length > 250 ? text.substring(0, 250) + '...' : text;

    const html = `
        <div class="animate-fadeIn">
            <!-- Título colorido -->
            <h2 class="text-4xl md:text-5xl font-extrabold mb-6 animate-shine">
                📅 Efeméride del Día
            </h2>
            
            <!-- Card estilo único -->
            <div class="p-6 bg-white/10 rounded-xl shadow-lg hover:scale-[1.03] transition-all duration-300 hover:bg-white/15 max-w-lg mx-auto relative overflow-hidden group">
                
                <!-- Brillo animado en hover -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <!-- Contenido -->
                <div class="relative z-10">
                    <!-- Icono y badge -->
                    <div class="flex items-center justify-center gap-3 mb-4">
                        <span class="text-4xl">${icon || '🎬'}</span>
                        <div class="text-left">
                            <h4 class="font-bold text-lg text-white">${category || 'Entretenimiento'}</h4>
                            <p class="text-gray-400 text-xs">Un día como hoy en ${year}</p>
                        </div>
                    </div>
                    
                    <!-- Texto -->
                    <p class="text-gray-300 text-sm leading-relaxed">${displayText}</p>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Iniciar carga cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadEfemeride);
