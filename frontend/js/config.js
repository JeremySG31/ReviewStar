// Configuración del entorno dinámica
const hostname = window.location.hostname;
const ENVIRONMENT = (hostname === 'localhost' || hostname === '127.0.0.1') ? 'development' : 'production';

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

// Ping backend to wake it up
fetch(`${API_URL}/api/test`).catch(() => {});
