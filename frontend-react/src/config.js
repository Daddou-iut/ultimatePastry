// Configuration API
// Localhost → localhost:8000
// Réseau local → 10.192.125.97:8000
// Production (Vercel) → Render backend

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isLocalNetwork = window.location.hostname === '10.192.125.97';

let API_URL;

if (isLocalhost) {
  API_URL = 'http://localhost:8000/api';
} else if (isLocalNetwork) {
  API_URL = 'http://10.192.125.97:8000/api';
} else {
  // Production : utilise Render
  API_URL = 'https://ultimatepastry.onrender.com/api';
}

export default API_URL;
