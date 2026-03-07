// Configuration API - Utilise l'IP locale pour accéder depuis le réseau
// Pour localhost: http://localhost:8000/api
// Pour réseau local: http://10.192.125.97:8000/api

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api'
  : 'http://10.192.125.97:8000/api';

export default API_URL;
