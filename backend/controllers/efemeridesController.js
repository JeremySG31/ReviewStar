import fetch from 'node-fetch';

// Palabras clave para filtrar efemérides relevantes a ReviewStar
const KEYWORDS = [
    { word: 'película', category: 'Películas', icon: '🎬' },
    { word: 'cine', category: 'Películas', icon: '🎬' },
    { word: 'estrenó', category: 'Películas', icon: '🎬' },
    { word: 'serie', category: 'Series', icon: '📺' },
    { word: 'televisión', category: 'Series', icon: '📺' },
    { word: 'videojuego', category: 'Videojuegos', icon: '🎮' },
    { word: 'nintendo', category: 'Videojuegos', icon: '🎮' },
    { word: 'playstation', category: 'Videojuegos', icon: '🎮' },
    { word: 'xbox', category: 'Videojuegos', icon: '🎮' },
    { word: 'sega', category: 'Videojuegos', icon: '🎮' },
    { word: 'libro', category: 'Libros', icon: '📚' },
    { word: 'novela', category: 'Libros', icon: '📚' },
    { word: 'publicó', category: 'Libros', icon: '📚' },
    { word: 'computadora', category: 'Tecnología', icon: '💻' },
    { word: 'internet', category: 'Tecnología', icon: '💻' },
    { word: 'apple', category: 'Tecnología', icon: '💻' },
    { word: 'microsoft', category: 'Tecnología', icon: '💻' },
    { word: 'google', category: 'Tecnología', icon: '💻' },
    { word: 'lanzamiento', category: 'Tecnología', icon: '💻' },
    { word: 'música', category: 'Otro', icon: '🎵' },
    { word: 'disco', category: 'Otro', icon: '🎵' }
];

export const getEfemeride = async (req, res) => {
    try {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // URL de la API de Wikipedia en español
        const url = `https://es.wikipedia.org/api/rest_v1/feed/onthisday/selected/${month}/${day}`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'ReviewStar/1.0 (jeremy@example.com)' }
        });

        if (!response.ok) throw new Error('Error al conectar con Wikipedia');

        const data = await response.json();

        if (!data.selected || data.selected.length === 0) {
            return res.json(getDefaultEfemeride());
        }

        // Filtrar y buscar la mejor coincidencia
        let bestMatch = null;

        // Mezclar aleatoriamente para no mostrar siempre el primero del año más antiguo
        const shuffled = data.selected.sort(() => 0.5 - Math.random());

        for (const event of shuffled) {
            const text = event.text.toLowerCase();
            const match = KEYWORDS.find(k => text.includes(k.word));

            if (match) {
                bestMatch = {
                    year: event.year,
                    text: event.text,
                    category: match.category,
                    icon: match.icon,
                    url: event.pages && event.pages[0] ? event.pages[0].content_urls.desktop.page : null
                };
                break;
            }
        }

        // Si no hay match de categoría, tomar uno aleatorio interesante o fallback
        if (!bestMatch) {
            const randomEvent = shuffled[0];
            bestMatch = {
                year: randomEvent.year,
                text: randomEvent.text,
                category: 'Historia',
                icon: '📅',
                url: randomEvent.pages && randomEvent.pages[0] ? randomEvent.pages[0].content_urls.desktop.page : null
            };
        }

        res.json(bestMatch);

    } catch (error) {
        console.error('Error efeméride:', error);
        res.json(getDefaultEfemeride());
    }
};

function getDefaultEfemeride() {
    return {
        year: 2025,
        text: "Hoy es un excelente día para compartir tu opinión sobre tus películas y juegos favoritos en ReviewStar.",
        category: "Comunidad",
        icon: "⭐"
    };
}
