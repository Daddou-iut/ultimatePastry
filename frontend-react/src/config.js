// Priorite 1: variable d'environnement VITE_API_URL
// Priorite 2: localhost en dev, Render en production
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:8000/api'
    : 'https://ultimatepastry.onrender.com/api');

export default API_URL;