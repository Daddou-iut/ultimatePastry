import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Card } from '../components/Card';
import backgroundImage from '../assets/background2.png';
import API_URL from '../config';
import Toast from '../components/Toast';

export const Inventory = () => {
  // ===== ÉTATS =====
  const [cards, setCards] = useState([]); // Toutes les cartes de l'inventaire
  const [mergeMode, setMergeMode] = useState(false); // Mode fusion activé?
  const [droppedCards, setDroppedCards] = useState([]); // Les 2 cartes à fusionner
  const [showMergeModal, setShowMergeModal] = useState(false); // Afficher la modal?
  const [loading, setLoading] = useState(true); // Chargement en cours?
  const [draggedCard, setDraggedCard] = useState(null); // Carte en cours de drag
  const [filterOpen, setFilterOpen] = useState(false); // Panneau filtre ouvert?
  const [selectedFamily, setSelectedFamily] = useState('all'); // Famille sélectionnée
  const [notification, setNotification] = useState(null);
  const MAX_DISPLAY = 40;

  const token = localStorage.getItem('token');

  // ===== CHARGER L'INVENTAIRE AU DÉMARRAGE =====
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';  // Si pas de token → go login
      return;
    }
  
    loadInventory();
  }, []); 

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/inventory/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data);
      } else {
        setNotification({
          message: 'Impossible de charger l\'inventaire',
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

  // ===== FONCTIONS DRAG/DROP =====
  const handleDragStart = (cardInstance) => {
    setDraggedCard(cardInstance);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (!draggedCard) return;

    // Vérifier si déjà dans la zone
    const alreadyAdded = droppedCards.some(c => c.id === draggedCard.id);
    if (alreadyAdded) {
      setNotification({
        message: 'Cette carte est déjà dans la zone',
        type: 'warning'
      });
      return;
    }

    // Ajouter la carte
    const newDroppedCards = [...droppedCards, draggedCard];
    setDroppedCards(newDroppedCards);

    // Si 2 cartes, vérifier et afficher modal
    if (newDroppedCards.length === 2) {
      if (newDroppedCards[0].card.id !== newDroppedCards[1].card.id) {
        setNotification({
          message: 'Les deux cartes doivent être identiques',
          type: 'warning'
        });
        setDroppedCards([]);
        return;
      }
      setShowMergeModal(true);
    }
  };

  const removeFromDropZone = (index) => {
    setDroppedCards(droppedCards.filter((_, i) => i !== index));
  };

  // ===== FUSIONNER LES CARTES =====
  const mergeTwoCards = async () => {
    if (droppedCards.length !== 2) {
      setNotification({
        message: 'Veuillez déposer exactement deux cartes',
        type: 'warning'
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/merge-cards/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          card_instance_id_1: droppedCards[0].id,
          card_instance_id_2: droppedCards[1].id
        })
      });

      if (response.ok) {
        setShowMergeModal(false);
        setDroppedCards([]);

        // Message de succès
        setNotification({
          message: 'Fusion réussie',
          type: 'success'
        });

        // Réinitialiser et recharger
        setMergeMode(false);
        await loadInventory();
      } else {
        const data = await response.json();
        setNotification({
          message: data.error || 'Erreur lors de la fusion',
          type: 'error'
        });
        setDroppedCards([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({
        message: 'Erreur lors de la fusion',
        type: 'error'
      });
    }
  };

  const familyFilters = [
    { id: 'all', label: 'Toutes', icon: 'fa-th-large' },
    { id: 'base', label: 'Base', icon: 'fa-layer-group' },
    { id: 'cream', label: 'Crème', icon: 'fa-ice-cream' },
    { id: 'filling', label: 'Fourrage', icon: 'fa-cookie-bite' },
    { id: 'glaze', label: 'Glaçage', icon: 'fa-droplet' },
    { id: 'decoration', label: 'Décorations', icon: 'fa-star' }
  ];

  const filteredCards = (selectedFamily === 'all'
    ? cards
    : cards.filter((cardInstance) => cardInstance.card.family === selectedFamily)
  ).slice(0, MAX_DISPLAY);
  
  // ===== RENDU =====
  if (loading) {
    return (
      <>
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-2xl text-gray-600">Chargement...</p>
        </div>
      </>
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
      <div className="flex gap-6 p-8 pt-24 pb-32" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      minHeight: '100vh'
    }}>
      {/* ===== PANNEAU FILTRES (gauche, coulissant) ===== */}
      <motion.aside
        initial={false}
        animate={{ x: filterOpen ? 0 : -220 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 w-56 bg-white/95 rounded-r-2xl border-2 border-pink-200 shadow-xl p-3"
      >
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="absolute -right-11 top-1/2 -translate-y-1/2 bg-pink-500 hover:bg-pink-600 text-white w-11 h-20 rounded-r-xl flex items-center justify-center shadow-lg transition"
          title={filterOpen ? 'Fermer les filtres' : 'Ouvrir les filtres'}
        >
          <i className={`fas ${filterOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>

        <p className="text-sm font-bold text-gray-700 mb-3">Filtrer les cartes</p>
        <div className="space-y-2">
          {familyFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFamily(filter.id)}
              className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                selectedFamily === filter.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              }`}
            >
              <i className={`fas ${filter.icon}`}></i>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </motion.aside>

      {/* ===== PARTIE GAUCHE: INVENTAIRE ===== */}
      <div className={`flex-1 bg-white bg-opacity-80 rounded-2xl shadow-lg p-8 transition-all ${mergeMode ? 'mr-80' : ''}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-2">
            <Icon icon="hugeicons:cards-02" className="text-pink-500" />
            Mes cartes
          </h1>
          <motion.button
            onClick={() => {
              setMergeMode(!mergeMode);
                setDroppedCards([]);
              }}
              className={`px-6 py-2 rounded-lg font-bold text-white transition flex items-center gap-2 ${
                mergeMode 
                ? 'bg-purple-700 hover:bg-purple-800' 
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              >
              <Icon icon="mdi:creation-outline" />
              Mode Fusion
              </motion.button>
            </div>

            {/* Info mode fusion */}
        {mergeMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded"
          >
            <p className="text-yellow-800 font-semibold">ℹ️ Mode fusion activé</p>
            <p className="text-yellow-700 text-sm">Glissez-déposez deux cartes identiques dans la zone à droite pour les fusionner.</p>
          </motion.div>
        )}

        {/* Grille de cartes */}
        <div className={`grid gap-6 ${mergeMode ? 'grid-cols-5' : 'grid-cols-6'}`}>
          {cards.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-xl">📦 Ton inventaire est vide. Ouvre un pack !</p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-xl">Aucune carte dans cette catégorie.</p>
            </div>
          ) : (
            filteredCards.map((cardInstance) => (
            <div
              key={cardInstance.id}
              draggable={mergeMode}
              onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; handleDragStart(cardInstance); }}
              onDragEnd={handleDragEnd}
              className={`relative ${mergeMode ? 'cursor-move' : 'cursor-default'}`}
            >
              <Card card={cardInstance.card} level={cardInstance.level} />
            </div>
          ))
          )}
        </div>
      </div>

      {/* ===== PARTIE DROITE: ZONE DE DÉPÔT (Mode Fusion) ===== */}
      {mergeMode && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="fixed right-4 top-24 bottom-32 w-80 bg-gradient-to-b from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6 border-4 border-dashed border-purple-400 flex flex-col items-center justify-start overflow-y-auto z-40"
        >
          <div className="text-center mb-6">
            <p className="text-purple-700 font-bold">Déposez 2 cartes identiques ici</p>
          </div>

          {/* Slots pour les cartes */}
          <div className="w-full space-y-4 flex-1">
            {[0, 1].map((index) => {
              const cardInstance = droppedCards[index];
              return (
                <motion.div
                  key={index}
                  className="relative w-full h-48 rounded-xl border-2 border-dashed border-purple-400 bg-white/60 flex items-center justify-center overflow-hidden"
                >
                  {cardInstance ? (
                    <>
                      <Card card={cardInstance.card} level={cardInstance.level} />
                      <button
                        onClick={() => removeFromDropZone(index)}
                        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <p className="text-purple-500 text-sm font-semibold">Slot {index + 1}</p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Bouton Annuler */}
          <button
            onClick={() => {
              setMergeMode(false);
              setDroppedCards([]);
            }}
            className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition"
          >
            ❌ Annuler
          </button>
        </motion.div>
      )}

      {/* ===== MODAL DE CONFIRMATION ===== */}
      {showMergeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-4">✨ Confirmer la fusion</h2>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">Êtes-vous sûr de vouloir fusionner ces deux cartes ?</p>
              <p className="text-sm text-gray-500">Une carte sera supprimée et l'autre verra son niveau augmenté.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowMergeModal(false);
                  setDroppedCards([]);
                }}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={mergeTwoCards}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg"
              >
                Fusionner
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </div>
    </>
  );
};
