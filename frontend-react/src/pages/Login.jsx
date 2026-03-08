import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API_URL from '../config';
import Toast from '../components/Toast';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
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
        localStorage.setItem('token', data.token);
        setNotification({
          message: 'Connexion réussie!',
          type: 'success'
        });
        setTimeout(() => navigate('/inventory'), 500);
      } else {
        setNotification({
          message: data.error || 'Identifiants incorrects',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({
        message: 'Erreur de connexion au serveur',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-2">🧁</h1>
            <h2 className="text-3xl font-bold text-gray-800">Se connecter</h2>
            <p className="text-gray-600 mt-2">Bienvenue dans Ultimate Pâtisserie!</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
    </>
  );
};
