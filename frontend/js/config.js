// Configuración del entorno
// Cambia esto a 'production' cuando subas a producción
const ENVIRONMENT = 'development'; // 'development' o 'production'

const CONFIG = {
    development: {
        API_URL: 'http://localhost:5000'
    },
    production: {
        API_URL: 'https://reviewstar.onrender.com'
    }
};

export const API_URL = CONFIG[ENVIRONMENT].API_URL;
export const IS_PRODUCTION = ENVIRONMENT === 'production';
