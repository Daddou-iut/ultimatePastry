// Configuration API
// Localhost → localhost:8000
// Réseau local → 10.192.125.97:8000
// Production (HTTPS) → Render backend HTTPS

const hostname = window.location.hostname;
const isHttps = window.location.protocol === 'https:';

let API_URL;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
  API_URL = 'http://localhost:8000/api';
} else if (hostname === '10.192.125.97') {
  API_URL = 'http://10.192.125.97:8000/api';
} else if (isHttps) {
  // Production HTTPS : utilise Render HTTPS
  API_URL = 'https://ultimatepastry.onrender.com/api';
} else {
  // Fallback
  API_URL = 'https://ultimatepastry.onrender.com/api';
}

export default API_URL;