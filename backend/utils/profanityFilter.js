// Filtro básico de palabras obscenas para evitar contenido inapropiado
const badWords = [
    'puta', 'puto', 'mierda', 'cojon', 'cojones', 'cabron', 'cabrón', 
    'pendejo', 'pendeja', 'gilipollas', 'concha', 'carajo', 'verga', 
    'pinga', 'culo', 'zorra', 'perra', 'maricon', 'maricón', 'puta',
    'putita', 'putito', 'follo', 'follar', 'joder', 'jodete', 'porno', 
    'pornografia', 'sexo', 'nude', 'desnudo', 'violacion', 'chupar',
    'mamada', 'pija'
];

export function containsProfanity(text) {
    if (!text) return false;
    
    // Normalizar texto (quitar acentos, convertir a minúsculas)
    const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Crear regex que busque palabras completas
    return badWords.some(word => {
        // Normalizamos la palabra también
        const normalizedWord = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
        return regex.test(normalizedText);
    });
}

export function filterProfanity(text) {
    if (!text) return text;
    
    let filteredText = text;
    const normalizedTextForMatch = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    badWords.forEach(word => {
        const normalizedWord = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const regex = new RegExp(`\\b${normalizedWord}\\b`, 'gi');
        
        // Reemplazar la palabra encontrada con asteriscos
        filteredText = filteredText.replace(new RegExp(`\\b${word}\\b`, 'gi'), '*'.repeat(word.length));
    });
    
    return filteredText;
}
