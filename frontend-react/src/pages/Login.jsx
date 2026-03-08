import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API_URL from '../config';

import { Icon } from '@iconify/react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Sauvegarde le token dans localStorage
        localStorage.setItem('token', data.token);
        
        // Redirige vers l'inventaire
        navigate('/inventory');
      } else {
        setError(data.error || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center ">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            <Icon icon="mdi:cake" width="40" height="40" className="text-pink-600 mr-2"/> Ultimate Pastry
          </h1>
          <p className="text-gray-600">Connecte-toi pour jouer</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border-l-4 border-red-500 p-4 rounded"
            >
              <p className="text-red-700 font-semibold">❌ {error}</p>
            </motion.div>
          )}

          {/* Username */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition"
              placeholder="Entre ton nom d'utilisateur"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition"
              placeholder="Entre ton mot de passe"
              required
            />
          </div>

          {/* Bouton Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-pink-600 hover:shadow-lg'
            }`}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </motion.button>
        </form>

        {/* Liens */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Pas encore de compte?{' '}
            <Link to="/signin" className="text-pink-500 font-bold hover:underline">
              Inscris-toi
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
