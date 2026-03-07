import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import backgroundImage from '../assets/background2.png';
import API_URL from '../config';

export const Packs = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [revealedCards, setRevealedCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadPacks();
  }, [token, navigate]);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/packs/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPacks(data);
      } else {
        setPacks([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setPacks([]);
    } finally {
      setLoading(false);
    }
  };

  const openPack = async (packId) => {
    try {
      const response = await fetch(`${API_URL}/packs/${packId}/open/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setRevealedCards(data.cards);
        setCurrentCardIndex(0);
        setCardFlipped(false);
        setShowModal(true);
      } else {
        alert('Erreur: ' + (data.error || 'Impossible d\'ouvrir le pack'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur serveur');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setRevealedCards([]);
    setCurrentCardIndex(0);
    setCardFlipped(false);
    loadPacks();
  };

  const nextCard = () => {
    if (currentCardIndex < revealedCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setCardFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setCardFlipped(false);
    }
  };

  const packIcons = {
    'bronze': 'fa-box',
    'silver': 'fa-box-open',
    'gold': 'fa-gift'
  };

  const currentCard = revealedCards[currentCardIndex];

  return (
    <div className="min-h-[calc(100dvh-14rem)] pt-24 pb-32 flex items-center justify-center" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center'
    }}>
      <div className="bg-white bg-opacity-80 rounded-2xl shadow-lg p-8 max-w-4xl w-full mx-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          <i className="fas fa-box-open text-pink-500"></i> Shop de Packs
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-600">
            <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
            <p>Chargement des packs disponibles...</p>
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-box-open text-6xl mb-4"></i>
            <p className="text-xl">Aucun pack disponible...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-lg shadow-lg border-2 border-pink-300"
              >
                <div className="text-center mb-4">
                  <i className={`fas ${packIcons[pack.level] || 'fa-box'} text-5xl text-pink-500`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {pack.level.toUpperCase()} Pack
                </h3>
                <div className="text-gray-600 text-sm mb-2 text-center">
                  <i className="fas fa-layer-group"></i> {pack.cards_count} cartes
                </div>
                <div className="text-gray-600 text-sm mb-4 text-center">
                  <i className="fas fa-star"></i> Rareté: {pack.rarity_boost}
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-2 rounded-full text-center font-bold mb-4">
                  <i className="fas fa-coins"></i> {pack.cost} coins
                </div>
                <button
                  onClick={() => openPack(pack.id)}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition flex items-center justify-center gap-2"
                >
                  <i className="fas fa-gift"></i>
                  Ouvrir ce pack
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de révélation des cartes */}
      <AnimatePresence>
        {showModal && currentCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[95vh] overflow-y-auto"
            >
              <h3 className="text-4xl font-bold text-center mb-4 text-pink-600">
                <i className="fas fa-star"></i> PACK OUVERT ! <i className="fas fa-star"></i>
              </h3>
              <p className="text-center text-lg text-gray-600 mb-2">
                Carte {currentCardIndex + 1}/{revealedCards.length}
              </p>

              <div className="flex items-center justify-center gap-6 mb-8">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0 || !cardFlipped}
                  className={`py-2 px-4 rounded-lg font-bold transition ${
                    currentCardIndex === 0 || !cardFlipped
                      ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                      : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  <i className="fas fa-chevron-left"></i> Précédent
                </button>

                <div
                  className="relative cursor-pointer"
                  style={{
                    perspective: '1000px',
                    width: '300px',
                    height: '400px'
                  }}
                  onClick={() => setCardFlipped(true)}
                >
                  <motion.div
                    animate={{ rotateY: cardFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      transformStyle: 'preserve-3d',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    {/* Face avant */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex flex-col items-center justify-center text-white border-2 border-white shadow-2xl"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <i className="fas fa-gift text-4xl mb-3"></i>
                      <div className="font-bold text-lg">Carte Mystère</div>
                      <div className="text-sm opacity-90 mt-2">Clique pour révéler</div>
                    </div>

                    {/* Face arrière */}
                    <div
                      className="absolute inset-0 rounded-xl p-2 flex items-center justify-center shadow-2xl"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <Card
                        card={currentCard.card || currentCard}
                        level={currentCard.level || currentCard.card?.level || 1}
                      />
                    </div>
                  </motion.div>
                </div>

                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === revealedCards.length - 1 || !cardFlipped}
                  className={`py-2 px-4 rounded-lg font-bold transition ${
                    currentCardIndex === revealedCards.length - 1 || !cardFlipped
                      ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                      : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  Suivant <i className="fas fa-chevron-right"></i>
                </button>
              </div>

              {currentCardIndex === revealedCards.length - 1 && cardFlipped && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={closeModal}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition text-lg"
                >
                  <i className="fas fa-check"></i> Fermer
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
