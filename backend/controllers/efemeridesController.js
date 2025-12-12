import fetch from 'node-fetch';

// Palabras clave para filtrar efemérides de entretenimiento
const KEYWORDS = [
    // Películas y Cine
    { word: 'película', category: 'Películas', icon: '🎬' },
    { word: 'film', category: 'Películas', icon: '🎬' },
    { word: 'cine', category: 'Películas', icon: '🎬' },
    { word: 'estrenó', category: 'Películas', icon: '🎬' },
    { word: 'estreno', category: 'Películas', icon: '🎬' },
    { word: 'hollywood', category: 'Películas', icon: '🎬' },
    { word: 'oscar', category: 'Películas', icon: '🏆' },
    { word: 'director', category: 'Películas', icon: '🎬' },
    { word: 'actor', category: 'Películas', icon: '🎬' },
    { word: 'actriz', category: 'Películas', icon: '🎬' },
    { word: 'disney', category: 'Películas', icon: '🏰' },
    { word: 'pixar', category: 'Películas', icon: '🎬' },
    { word: 'marvel', category: 'Películas', icon: '🦸' },
    { word: 'dc comics', category: 'Películas', icon: '🦇' },
    { word: 'star wars', category: 'Películas', icon: '⭐' },
    { word: 'spielberg', category: 'Películas', icon: '🎬' },
    { word: 'tarantino', category: 'Películas', icon: '🎬' },
    { word: 'nolan', category: 'Películas', icon: '🎬' },
    { word: 'animación', category: 'Películas', icon: '🎨' },
    { word: 'anime', category: 'Anime', icon: '🎌' },
    { word: 'ghibli', category: 'Anime', icon: '🎌' },
    
    // Series y TV
    { word: 'serie', category: 'Series', icon: '📺' },
    { word: 'televisión', category: 'Series', icon: '📺' },
    { word: 'tv', category: 'Series', icon: '📺' },
    { word: 'temporada', category: 'Series', icon: '📺' },
    { word: 'episodio', category: 'Series', icon: '📺' },
    { word: 'netflix', category: 'Series', icon: '📺' },
    { word: 'hbo', category: 'Series', icon: '📺' },
    { word: 'sitcom', category: 'Series', icon: '📺' },
    
    // Videojuegos
    { word: 'videojuego', category: 'Videojuegos', icon: '🎮' },
    { word: 'juego', category: 'Videojuegos', icon: '🎮' },
    { word: 'consola', category: 'Videojuegos', icon: '🎮' },
    { word: 'nintendo', category: 'Videojuegos', icon: '🎮' },
    { word: 'playstation', category: 'Videojuegos', icon: '🎮' },
    { word: 'xbox', category: 'Videojuegos', icon: '🎮' },
    { word: 'sega', category: 'Videojuegos', icon: '🎮' },
    { word: 'atari', category: 'Videojuegos', icon: '🕹️' },
    { word: 'mario', category: 'Videojuegos', icon: '🍄' },
    { word: 'zelda', category: 'Videojuegos', icon: '🗡️' },
    { word: 'pokémon', category: 'Videojuegos', icon: '⚡' },
    { word: 'pokemon', category: 'Videojuegos', icon: '⚡' },
    { word: 'sonic', category: 'Videojuegos', icon: '🦔' },
    { word: 'arcade', category: 'Videojuegos', icon: '🕹️' },
    { word: 'gamer', category: 'Videojuegos', icon: '🎮' },
    
    // Libros y Cómics
    { word: 'libro', category: 'Libros', icon: '📚' },
    { word: 'novela', category: 'Libros', icon: '📚' },
    { word: 'publicó', category: 'Libros', icon: '📚' },
    { word: 'escritor', category: 'Libros', icon: '✍️' },
    { word: 'autor', category: 'Libros', icon: '✍️' },
    { word: 'cómic', category: 'Cómics', icon: '💥' },
    { word: 'comic', category: 'Cómics', icon: '💥' },
    { word: 'manga', category: 'Manga', icon: '📖' },
    { word: 'superhéroe', category: 'Cómics', icon: '🦸' },
    
    // Música
    { word: 'música', category: 'Música', icon: '🎵' },
    { word: 'disco', category: 'Música', icon: '💿' },
    { word: 'álbum', category: 'Música', icon: '💿' },
    { word: 'cantante', category: 'Música', icon: '🎤' },
    { word: 'banda', category: 'Música', icon: '🎸' },
    { word: 'concierto', category: 'Música', icon: '🎵' },
    { word: 'grammy', category: 'Música', icon: '🏆' },
    
    // Tecnología relacionada con entretenimiento
    { word: 'streaming', category: 'Tecnología', icon: '📡' },
    { word: 'youtube', category: 'Tecnología', icon: '▶️' },
    { word: 'spotify', category: 'Tecnología', icon: '🎧' }
];

// Efemérides de entretenimiento predefinidas para fallback
const ENTERTAINMENT_FALLBACKS = [
    { year: 1977, text: "Se estrenó 'Star Wars: Una Nueva Esperanza', la película que revolucionó el cine de ciencia ficción y creó una de las franquicias más exitosas de la historia.", category: 'Películas', icon: '⭐' },
    { year: 1985, text: "Nintendo lanzó Super Mario Bros., el videojuego que definió el género de plataformas y convirtió a Mario en un ícono cultural mundial.", category: 'Videojuegos', icon: '🍄' },
    { year: 1997, text: "Se publicó 'Harry Potter y la Piedra Filosofal' de J.K. Rowling, iniciando la saga literaria más vendida del siglo XXI.", category: 'Libros', icon: '⚡' },
    { year: 2001, text: "Se estrenó 'El Señor de los Anillos: La Comunidad del Anillo', la primera entrega de la trilogía épica de Peter Jackson.", category: 'Películas', icon: '💍' },
    { year: 1996, text: "Nintendo lanzó Pokémon Rojo y Azul en Japón, iniciando una de las franquicias de videojuegos más exitosas de todos los tiempos.", category: 'Videojuegos', icon: '⚡' },
    { year: 1994, text: "Se estrenó 'El Rey León' de Disney, convirtiéndose en la película animada más taquillera de su época.", category: 'Películas', icon: '🦁' },
    { year: 2008, text: "Marvel Studios estrenó 'Iron Man', dando inicio al Universo Cinematográfico de Marvel (MCU).", category: 'Películas', icon: '🦸' },
    { year: 2011, text: "Se estrenó la primera temporada de 'Game of Thrones' en HBO, revolucionando las series de televisión.", category: 'Series', icon: '🐉' },
    { year: 1986, text: "Nintendo lanzó 'The Legend of Zelda', estableciendo las bases del género de aventuras y acción.", category: 'Videojuegos', icon: '🗡️' },
    { year: 2013, text: "Se lanzó 'Grand Theft Auto V', que se convirtió en uno de los videojuegos más vendidos de la historia.", category: 'Videojuegos', icon: '🎮' }
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

        // Filtrar y buscar coincidencias de entretenimiento
        const entertainmentMatches = [];

        for (const event of data.selected) {
            const text = event.text.toLowerCase();
            const match = KEYWORDS.find(k => text.includes(k.word));

            if (match) {
                entertainmentMatches.push({
                    year: event.year,
                    text: event.text,
                    category: match.category,
                    icon: match.icon,
                    url: event.pages && event.pages[0] ? event.pages[0].content_urls.desktop.page : null
                });
            }
        }

        // Si encontramos efemérides de entretenimiento, elegir una aleatoria
        if (entertainmentMatches.length > 0) {
            const randomIndex = Math.floor(Math.random() * entertainmentMatches.length);
            return res.json(entertainmentMatches[randomIndex]);
        }

        // Si no hay ninguna de entretenimiento, usar un fallback predefinido
        const randomFallback = ENTERTAINMENT_FALLBACKS[Math.floor(Math.random() * ENTERTAINMENT_FALLBACKS.length)];
        res.json(randomFallback);

    } catch (error) {
        console.error('Error efeméride:', error);
        res.json(getDefaultEfemeride());
    }
};

function getDefaultEfemeride() {
    // Usar un fallback aleatorio de entretenimiento
    const randomFallback = ENTERTAINMENT_FALLBACKS[Math.floor(Math.random() * ENTERTAINMENT_FALLBACKS.length)];
    return randomFallback;
}
