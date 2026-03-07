import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import backgroundImage from '../assets/background2.png';
import { Icon } from '@iconify/react';
import API_URL from '../config';

export const Marketplace = () => {
  const [currentTab, setCurrentTab] = useState('browse');
  const [allListings, setAllListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [inventoryCards, setInventoryCards] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [selectedCardForSell, setSelectedCardForSell] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadMarketplaceListings();
  }, [token, navigate]);

  const loadMarketplaceListings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/marketplace/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAllListings(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyListings = async () => {
    try {
      const response = await fetch(`${API_URL}/marketplace/my-listings/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMyListings(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadSellTab = async () => {
    try {
      const inventoryResponse = await fetch(`${API_URL}/inventory/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      const listingsResponse = await fetch(`${API_URL}/marketplace/my-listings/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (inventoryResponse.ok) {
        const inventory = await inventoryResponse.json();
        setInventoryCards(inventory);

        if (listingsResponse.ok) {
          const listings = await listingsResponse.json();
          setMyListings(listings);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const switchTab = (tab) => {
    setCurrentTab(tab);
    if (tab === 'browse') loadMarketplaceListings();
    if (tab === 'my-listings') loadMyListings();
    if (tab === 'sell') loadSellTab();
  };

  const filterListings = () => {
    if (currentFilter === 'all') return allListings;
    return allListings.filter(listing => listing.card_instance.card.family === currentFilter);
  };

  const selectCardForSell = (card) => {
    setSelectedCardForSell(card);
    calculatePriceSuggestions(card);
  };

  const calculatePriceSuggestions = (card) => {
    const rarity = card.card.rarity;
    const level = card.level;

    const basePrice = {
      'common': 50,
      'uncommon': 150,
      'rare': 400,
      'epic': 1000
    }[rarity] || 50;

    // Calculer prix standard
    const standardPrice = Math.floor(basePrice * level * 0.7);
    setSellPrice(standardPrice.toString());
  };

  const selectListing = (listing) => {
    setSelectedListing(listing);
    setShowBuyModal(true);
  };

  const buyCard = async () => {
    if (!selectedListing) return;

    try {
      const response = await fetch(`${API_URL}/marketplace/buy/${selectedListing.id}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Vous avez acheté ${selectedListing.card_instance.card.name} pour ${selectedListing.price} coins!`);
        setShowBuyModal(false);
        setSelectedListing(null);
        loadMarketplaceListings();
      } else {
        alert('❌ ' + (data.error || 'Erreur lors de l\'achat'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'achat');
    }
  };

  const sellCard = async () => {
    if (!selectedCardForSell) {
      alert('❌ Sélectionnez une carte d\'abord');
      return;
    }

    const price = parseInt(sellPrice);
    if (!price || price < 1) {
      alert('❌ Entrez un prix valide');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/marketplace/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          card_instance_id: selectedCardForSell.id,
          price: price
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Carte mise en vente avec succès !');
        setSelectedCardForSell(null);
        setSellPrice('');
        loadSellTab();
        loadMarketplaceListings();
      } else {
        alert('❌ ' + (data.error || 'Erreur'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la mise en vente');
    }
  };

  const cancelListing = async (listingId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette annonce?')) return;

    try {
      const response = await fetch(`${API_URL}/marketplace/cancel/${listingId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('✅ Annonce annulée');
        loadMyListings();
      } else {
        alert('❌ Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filters = ['all', 'base', 'cream', 'filling', 'glaze', 'decoration'];
  const filterLabels = {
    'all': 'Tout',
    'base': 'Base',
    'cream': 'Crème',
    'filling': 'Fourrage',
    'glaze': 'Glaçage',
    'decoration': 'Décoration'
  };

  const cardsForSale = new Set(
    myListings
      .filter(listing => listing.status === 'active')
      .map(listing => listing.card_instance?.id || listing.card_instance_id)
  );

  return (
    <div className="min-h-[calc(100dvh-14rem)] pt-24 pb-32" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center'
    }}>
      <div className="flex-1 flex flex-col bg-white bg-opacity-80 rounded-2xl shadow-lg p-8 max-w-6xl w-full mx-auto my-5">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center mb-8">
          <i className="fas fa-store text-pink-500 mr-2"></i>Marketplace
        </h1>

        {/* Onglets */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => switchTab('browse')}
            className={`px-6 py-3 font-bold text-lg border-b-4 transition ${
              currentTab === 'browse'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-search mr-2"></i>Parcourir les ventes
          </button>
          <button
            onClick={() => switchTab('my-listings')}
            className={`px-6 py-3 font-bold text-lg border-b-4 transition ${
              currentTab === 'my-listings'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-list mr-2"></i>Mes annonces
          </button>
          <button
            onClick={() => switchTab('sell')}
            className={`px-6 py-3 font-bold text-lg border-b-4 transition ${
              currentTab === 'sell'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon icon="streamline:e-commerce-touch-buy" className="inline mr-2" />Vendre une carte
          </button>
        </div>

        {/* TAB 1: Parcourir */}
        {currentTab === 'browse' && (
          <div>
            <div className="mb-4 p-4 bg-pink-50 rounded-lg">
              <label className="block text-gray-700 font-semibold mb-2">Filtrer par famille</label>
              <div className="flex gap-2 flex-wrap">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCurrentFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      currentFilter === filter
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {filterLabels[filter]}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filterListings().length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-600">
                    <i className="fas fa-box-open text-6xl mb-4"></i>
                    <p>Aucune carte en vente</p>
                  </div>
                ) : (
                  filterListings().map((listing) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white border-2 border-gray-300 rounded-lg p-3 cursor-pointer hover:border-pink-500 hover:shadow-lg transition"
                      onClick={() => selectListing(listing)}
                    >
                      <div className="flex justify-center">
                        <Card card={listing.card_instance.card} level={listing.card_instance.level} compact />
                      </div>
                      <div className="bg-yellow-300 text-gray-800 px-2 py-1 rounded-full text-center font-bold mt-2 text-sm">
                        <i className="fas fa-coins"></i> {listing.price}
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">Par {listing.seller.user.username}</p>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Mes annonces */}
        {currentTab === 'my-listings' && (
          <div>
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-semibold">
                <i className="fas fa-info-circle mr-2"></i>Vos cartes en vente et historique
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myListings.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-600">
                  <i className="fas fa-inbox mr-2"></i>Vous n'avez aucune annonce
                </div>
              ) : (
                myListings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-2 border-gray-300 rounded-lg p-3"
                  >
                    <div className="flex justify-center">
                      <Card card={listing.card_instance.card} level={listing.card_instance.level} compact />
                    </div>
                    <div className="bg-yellow-300 text-gray-800 px-2 py-1 rounded-full text-center font-bold mt-2 text-sm">
                      <i className="fas fa-coins"></i> {listing.price}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-center text-xs font-bold mt-2 ${
                      listing.status === 'active' ? 'bg-green-100 text-green-800' :
                      listing.status === 'sold' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status === 'active' ? 'En vente' :
                       listing.status === 'sold' ? 'Vendu' : 'Annulé'}
                    </div>
                    {listing.status === 'active' && (
                      <button
                        onClick={() => cancelListing(listing.id)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded mt-2 text-sm font-bold"
                      >
                        Annuler
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Vendre */}
        {currentTab === 'sell' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <Icon icon="material-symbols-light:editor-choice-outline-rounded" className="inline mr-2 text-pink-500" />Choisir une carte à vendre
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {inventoryCards.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-600">
                    <i className="fas fa-inbox text-6xl mb-4"></i>
                    <p>Aucune carte disponible</p>
                  </div>
                ) : (
                  inventoryCards.map((cardInst) => {
                    const isForSale = cardsForSale.has(cardInst.id);
                    const isSelected = selectedCardForSell?.id === cardInst.id;

                    return (
                      <div
                        key={cardInst.id}
                        onClick={() => !isForSale && selectCardForSell(cardInst)}
                        className={`border-2 rounded-lg p-2 transition ${
                          isForSale
                            ? 'border-gray-300 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-green-500 ring-2 ring-green-300 cursor-pointer'
                            : 'border-gray-300 hover:border-pink-500 cursor-pointer'
                        }`}
                      >
                        <div className="flex justify-center">
                          <Card card={cardInst.card} level={cardInst.level} compact />
                        </div>
                        {isForSale && (
                          <p className="text-xs text-center text-red-600 font-bold mt-1">En vente</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">
                <Icon icon="streamline:e-commerce-touch-buy" className="inline mr-2 text-pink-500" />Prix de vente
              </h2>

              {selectedCardForSell && (
                <div className="mb-6 p-4 bg-white rounded-lg border-2 border-pink-300">
                  <div className="flex justify-center">
                    <Card card={selectedCardForSell.card} level={selectedCardForSell.level} compact />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Prix (en coins):</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="Entrez un prix"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500"
                  min="1"
                />
              </div>

              <button
                onClick={sellCard}
                disabled={!selectedCardForSell}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-check mr-2"></i>Mettre en vente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'achat */}
      <AnimatePresence>
        {showBuyModal && selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowBuyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                <i className="fas fa-shopping-cart text-green-500 mr-2"></i>Confirmer l'achat
              </h2>
              <div className="mb-6 flex justify-center">
                <Card
                  card={selectedListing.card_instance.card}
                  level={selectedListing.card_instance.level}
                  compact
                />
              </div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-sm mb-2">Vendeur: <span className="font-bold">{selectedListing.seller.user.username}</span></p>
                <p className="text-gray-700 text-sm mb-2">Prix: <span className="font-bold text-green-600">{selectedListing.price} coins</span></p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={buyCard}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg"
                >
                  Acheter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
