import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

export const Header = () => {
  const [playerData, setPlayerData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      loadPlayerInfo();
    }
  }, [token]);

  const loadPlayerInfo = async () => {
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
        // L'API retourne un tableau, on prend le premier élément
        setPlayerData(data[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des infos du joueur:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Pour l'instant juste un toggle, tu peux ajouter un menu déroulant plus tard
  };

  const cheatAddMoney = async () => {
    if (!token) {
      alert('Vous devez être connecté !');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/players/cheat_add_money/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedPlayer = await response.json();
        setPlayerData(updatedPlayer);
        
        // Animation visuelle
        const moneyEl = document.getElementById('money-display');
        if (moneyEl) {
          moneyEl.style.color = '#22c55e';
          setTimeout(() => {
            moneyEl.style.color = '';
          }, 500);
        }
      }
    } catch (error) {
      console.error('Erreur cheat money:', error);
    }
  };

  const goToProfile = () => {
    navigate('/');
  };

  // Si pas de token, ne rien afficher (on est sur la page login/signin)
  if (!token) {
    return null;
  }

  const profilePicUrl = playerData?.profile_picture 
    ? (playerData.profile_picture.startsWith('http') 
        ? playerData.profile_picture 
        : `http://localhost:8000${playerData.profile_picture}`)
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-gradient-to-b from-pink-200 to-pink-400 shadow-lg text-white">
      <div className="flex justify-between items-center px-6 py-4">
       
        {/* Titre */}
        <h1 className="text-5xl font-bold text-white justify-center" style={{ fontFamily: 'Satisfy, cursive', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Ultimate Pastry
        </h1>

        {/* Actions à droite */}
        <div className="flex items-center gap-4">
          {/* Badge d'argent avec cheat code */}
          <div 
            className="bg-yellow-300 text-gray-800 px-4 py-2 rounded-full font-bold flex items-center gap-2 cursor-pointer hover:bg-yellow-400 transition"
            onClick={cheatAddMoney}
            title="Cheat code: Click for +1000 coins!"
          >
            <i className="fas fa-coins"></i>
            <span id="money-display">
              {playerData?.money || 0}
            </span>
          </div>

          {/* Photo de profil */}
          <div 
            className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition"
            onClick={goToProfile}
            title="Mon profil"
          >
            {profilePicUrl ? (
              <img 
                src={profilePicUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <i className="fas fa-user text-gray-400"></i>
            )}
          </div>

          {/* Bouton de déconnexion */}
          <button 
            className="!bg-red-500 hover:!bg-red-600 px-3 py-2 rounded-lg text-white font-bold transition flex items-center gap-2 border border-red-300"
            onClick={logout}
            title="Déconnexion"
          >
            <i className="fas fa-right-from-bracket"></i>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

    </header>
  );
};
