import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import backgroundImage from '../assets/background2.png';
import API_URL from '../config';
import Toast from '../components/Toast';

export const Game = () => {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      const response = await fetch(`${API_URL}/players/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlayerData(data[0]);
      } else {
        console.error('Erreur de chargement du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setNotification({
        message: 'Sélectionnez un fichier image valide (JPG, PNG, GIF...)',
        type: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        message: 'L\'image dépasse 5 MB. Choisissez une image plus petite',
        type: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await fetch(`${API_URL}/players/upload_picture/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          message: 'Photo de profil mise à jour avec succès',
          type: 'success'
        });
        loadPlayerData();
      } else {
        setNotification({
          message: data.error || 'Impossible de mettre à jour la photo',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setNotification({
        message: 'Erreur lors du téléchargement de la photo',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div 
        className="min-h-[calc(100dvh-14rem)] pt-24 pb-32 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white bg-opacity-80 rounded-2xl shadow-lg p-8 max-w-4xl w-full mx-5"
        >
          {/* PROFIL */}
          <div className="flex flex-col items-center mb-6">
            {/* Photo de profil */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-pink-300 mb-4 overflow-hidden"
            >
              {playerData?.profile_picture ? (
                <img
                  src={`http://localhost:8000${playerData.profile_picture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-gray-400 text-7xl"></i>
              )}
            </motion.div>

            {/* Bouton changer photo */}
            <input
              type="file"
              id="file-input"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <motion.button
              onClick={() => document.getElementById('file-input').click()}
              className="bg-pink-300 text-white px-4 py-2 rounded-lg hover:bg-pink-500 transition font-bold flex items-center gap-2 text-sm mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-camera"></i>
              Changer
            </motion.button>

            {/* Username */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {playerData?.user?.username || 'Joueur'}
            </h2>

            {/* Stats */}
            <div className="space-y-2 mb-4 text-center">
              <p className="text-gray-700">
                <strong>Niveau :</strong>{' '}
                <span className="text-lg font-bold text-indigo-600">
                  {playerData?.level || 1}
                </span>
              </p>
              <p className="text-gray-700">
                <strong>Exp :</strong>{' '}
                <span className="font-semibold">
                  {playerData?.experience || 0} XP
                </span>
              </p>
            </div>

            {/* Money badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-white to-pink-300 text-pink-500 px-6 py-3 rounded-full inline-flex items-center gap-2 font-bold text-lg shadow-md"
            >
              <i className="fas fa-coins"></i>
              <span>{playerData?.money || 0}</span>
            </motion.div>
          </div>

          {/* Message de bienvenue */}
          <div className="text-center mt-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Bienvenue !</h2>
            <p className="text-gray-600">
              Sélectionnez une section via le menu en haut pour commencer.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};
