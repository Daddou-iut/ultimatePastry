import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import backgroundImage from '../assets/background2.png';
import { Icon } from '@iconify/react';
import API_URL from '../config';

export const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [allCards, setAllCards] = useState([]);
  const [currentTab, setCurrentTab] = useState('base');
  const [createStep, setCreateStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [selectedCards, setSelectedCards] = useState({
    base: null,
    cream: null,
    filling: null,
    glaze: null,
    decorations: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadTeams();
  }, [token, navigate]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/teams/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await response.json();
      setAllCards(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const openCreateModal = () => {
    setShowModal(true);
    setCreateStep(1);
    setCurrentTab('base');
    loadInventory();
  };

  const closeModal = () => {
    setShowModal(false);
    setTeamName('');
    setCreateStep(1);
    setCurrentTab('base');
    setSelectedCards({
      base: null,
      cream: null,
      filling: null,
      glaze: null,
      decorations: []
    });
  };

  const selectCard = (card) => {
    if (currentTab === 'decoration') {
      const alreadySelected = selectedCards.decorations.findIndex(c => c.id === card.id);
      if (alreadySelected >= 0) {
        setSelectedCards({
          ...selectedCards,
          decorations: selectedCards.decorations.filter((_, i) => i !== alreadySelected)
        });
      } else {
        if (selectedCards.decorations.length >= 3) {
          alert('⚠️ Maximum 3 décorations !');
          return;
        }
        setSelectedCards({
          ...selectedCards,
          decorations: [...selectedCards.decorations, card]
        });
      }
    } else {
      setSelectedCards({
        ...selectedCards,
        [currentTab]: selectedCards[currentTab]?.id === card.id ? null : card
      });
    }
  };

  const isCardSelected = (card) => {
    if (currentTab === 'decoration') {
      return selectedCards.decorations.some(c => c.id === card.id);
    }
    return selectedCards[currentTab]?.id === card.id;
  };

  const createTeam = async () => {
    if (!teamName.trim()) {
      alert('⚠️ Donnez un nom à votre gâteau !');
      return;
    }

    if (!selectedCards.base || !selectedCards.filling) {
      alert('⚠️ Base et Fourrage sont obligatoires !');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/teams/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: teamName,
          base_id: selectedCards.base.id,
          filling_id: selectedCards.filling.id,
          cream_id: selectedCards.cream?.id || null,
          glaze_id: selectedCards.glaze?.id || null,
          decoration_ids: selectedCards.decorations.map(d => d.id)
        })
      });

      if (response.ok) {
        alert('✅ Gâteau créé avec succès !');
        closeModal();
        loadTeams();
      } else {
        const data = await response.json();
        alert('❌ Erreur: ' + (data.error || JSON.stringify(data)));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la création du gâteau');
    }
  };

  const deleteTeam = async (teamId) => {
    if (!confirm('Supprimer ce gâteau ?')) return;

    try {
      const response = await fetch(`${API_URL}/teams/${teamId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        loadTeams();
      } else {
        alert('❌ Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const tabs = [
    { id: 'base', icon: 'fas fa-layer-group', label: 'Base', required: true },
    { id: 'filling', icon: 'fas fa-cookie-bite', label: 'Fourrage', required: true },
    { id: 'cream', icon: 'fas fa-ice-cream', label: 'Crème', required: false },
    { id: 'glaze', icon: 'fas fa-droplet', label: 'Glaçage', required: false },
    { id: 'decoration', icon: 'fas fa-star', label: 'Décorations', required: false }
  ];

  const goToStep = (step) => {
    setCreateStep(step);

    if (step === 1 && currentTab !== 'base') {
      setCurrentTab('base');
    }

    if (step === 2 && !['filling', 'cream', 'glaze', 'decoration'].includes(currentTab)) {
      setCurrentTab('filling');
    }
  };

  const validateStep1 = (showAlert = true) => {
    if (!teamName.trim()) {
      if (showAlert) {
        alert('⚠️ Donnez un nom à votre gâteau !');
      }
      return false;
    }

    if (!selectedCards.base) {
      if (showAlert) {
        alert('⚠️ Base est obligatoire !');
      }
      return false;
    }

    return true;
  };

  const validateStep2 = (showAlert = true) => {
    if (!selectedCards.filling) {
      if (showAlert) {
        alert('⚠️ Fourrage est obligatoire !');
      }
      return false;
    }
    return true;
  };

  const onStepButtonClick = (target) => {
    if (target === 'validation') {
      if (validateStep1(true) && validateStep2(true)) {
        goToStep(3);
      }
      return;
    }

    if (target === 'base') {
      goToStep(1);
      setCurrentTab(target);
      return;
    }

    if (['filling', 'cream', 'glaze', 'decoration'].includes(target)) {
      if (validateStep1(true)) {
        goToStep(2);
        setCurrentTab(target);
      }
    }
  };

  const nextStep = () => {
    if (createStep === 1) {
      if (!validateStep1(true)) {
        return;
      }

      goToStep(2);
      return;
    }

    if (createStep === 2) {
      if (!validateStep2(true)) {
        return;
      }
      goToStep(3);
    }
  };

  const previousStep = () => {
    if (createStep === 2) {
      goToStep(1);
      return;
    }

    if (createStep === 3) {
      goToStep(2);
    }
  };

  const stepTabs = {
    1: ['base'],
    2: ['filling', 'cream', 'glaze', 'decoration'],
    3: []
  };

  const visibleTabs = tabs.filter((tab) => {
    if (createStep === 1) {
      // In step 1, keep Base and Creme strictly separated in the UI.
      return tab.id === currentTab;
    }

    if (createStep === 2) {
      // In step 2, keep each option category separated as well.
      return tab.id === currentTab;
    }

    return stepTabs[createStep].includes(tab.id);
  });

  const filteredCards = createStep === 3
    ? []
    : allCards.filter(c => c.card.family === currentTab);

  return (
    <div className="min-h-[calc(100dvh-1rem)] pt-24 pb-32" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center'
    }}>
      <div className="flex-1 flex gap-6 mx-4">
        <div className="flex-1 bg-white bg-opacity-80 rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center">
              <Icon icon="mdi:cake" width="40" height="40" className="text-pink-600 mr-2" />Mes Gâteaux
            </h1>
            <button
              onClick={openCreateModal}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-600 hover:shadow-lg transition"
            >
              <Icon icon="game-icons:whisk" className="inline-block mr-2 text-white" />Créer un Gâteau
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">
              <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
              <p>Chargement...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              Aucun gâteau créé. Cliquez sur "Créer un Gâteau" !
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {teams.map((team) => {
                const cards = [];
                if (team.base) cards.push(team.base);
                if (team.cream) cards.push(team.cream);
                if (team.filling) cards.push(team.filling);
                if (team.glaze) cards.push(team.glaze);
                if (team.decorations) cards.push(...team.decorations);

                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full bg-white rounded-xl border-4 border-gray-800 p-3 hover:shadow-xl transition"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-2xl">{team.name}</h3>
                      <button
                        onClick={() => deleteTeam(team.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold"
                      >
                        <i className="fas fa-trash mr-1"></i>Supprimer
                      </button>
                    </div>
                    <div className="bg-gradient-to-b from-pink-50 to-purple-50 rounded-lg border-2 border-gray-800 p-3">
                      <div className="flex justify-center items-center gap-4 flex-wrap">
                        {cards.map((cardInst, idx) => (
                          <Card key={idx} card={cardInst.card} level={cardInst.level} compact />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-2xl w-full max-w-5xl max-h-[86vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* En-tête */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-t-2xl border-b-2 border-pink-300">
                <h2 className="text-2xl font-bold text-white text-center">
                  <Icon icon="game-icons:whisk" className="inline-block mr-2 text-white" />Créer un Gâteau
                </h2>
              </div>

              <div className="p-4 md:p-5 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <aside className="lg:col-span-3 bg-white border-2 border-pink-200 rounded-xl p-3 h-fit">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Nommez votre gâteau..."
                      className="w-full px-3 py-2 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm font-semibold"
                    />

                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => onStepButtonClick('base')}
                        className={`w-full text-left px-3 py-2 rounded-full font-bold transition ${createStep === 1 && currentTab === 'base' ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}
                      >
                        1. Base
                      </button>
                      <button
                        onClick={() => onStepButtonClick('cream')}
                        className={`w-full text-left px-3 py-2 rounded-full font-bold transition ${createStep === 1 && currentTab === 'cream' ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}
                      >
                        2. Creme
                      </button>
                      <button
                        onClick={() => onStepButtonClick('filling')}
                        className={`w-full text-left px-3 py-2 rounded-full font-bold transition ${createStep === 2 && currentTab === 'filling' ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}
                      >
                        3. Fourrage
                      </button>
                      <button
                        onClick={() => onStepButtonClick('glaze')}
                        className={`w-full text-left px-3 py-2 rounded-full font-bold transition ${createStep === 2 && currentTab === 'glaze' ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}
                      >
                        4. Glacage
                      </button>
                      <button
                        onClick={() => onStepButtonClick('decoration')}
                        className={`w-full text-left px-3 py-2 rounded-full font-bold transition ${createStep === 2 && currentTab === 'decoration' ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}
                      >
                        5. Decorations
                      </button>
                      <button
                        onClick={() => onStepButtonClick('validation')}
                        className={`w-full text-left px-3 py-2 rounded-full font-bold transition ${createStep === 3 ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}
                      >
                        6. Validation
                      </button>
                    </div>
                  </aside>

                  {createStep !== 3 && (
                  <section className="lg:col-span-6 bg-white border-2 border-pink-200 rounded-xl p-3">
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 uppercase tracking-wide">
                      Les Cartes
                    </h3>

                    {createStep !== 3 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {visibleTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id)}
                            className={`px-3 py-1.5 rounded-full font-bold text-sm transition border ${
                              currentTab === tab.id
                                ? 'bg-pink-600 text-white border-pink-600'
                                : 'bg-white text-gray-700 border-pink-200 hover:bg-pink-50'
                            }`}
                          >
                            <i className={`${tab.icon} mr-1`}></i>{tab.label}
                            {tab.required && <span className="ml-1 text-red-400">*</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="max-h-[40vh] overflow-y-auto pr-1">
                      <div className="mx-auto grid w-fit grid-cols-2 justify-items-center gap-3 min-h-[210px]">
                        {filteredCards.length === 0 ? (
                          <div className="col-span-full text-center text-gray-400 py-12">
                            Aucune carte disponible dans cette catégorie
                          </div>
                        ) : (
                          filteredCards.map((cardInst) => {
                            const selected = isCardSelected(cardInst);
                            return (
                              <div
                                key={cardInst.id}
                                onClick={() => selectCard(cardInst)}
                                className={`w-full max-w-[180px] cursor-pointer hover:scale-105 transition border-2 rounded-lg p-2 ${
                                  selected ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-300 hover:border-pink-500'
                                }`}
                              >
                                <Card card={cardInst.card} level={cardInst.level} compact />
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </section>
                  )}

                  <section className={`${createStep === 3 ? 'lg:col-span-9' : 'lg:col-span-3'} bg-white border-2 border-pink-200 rounded-xl p-3 transition-all duration-300`}>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 lowercase tracking-wide">
                      aperçu du gateau
                    </h3>
                    <div className={`flex flex-wrap items-center justify-center gap-2 bg-gradient-to-b from-yellow-50 to-pink-50 rounded-lg border-2 border-pink-100 ${createStep === 3 ? 'min-h-[300px] p-4' : 'min-h-[210px] p-2'}`}>
                      {!selectedCards.base && !selectedCards.filling && selectedCards.decorations.length === 0 ? (
                        <div className="text-gray-400 text-center">
                          <i className="fas fa-cake-candles text-4xl mb-1"></i>
                          <p className="text-sm">Sélectionnez vos ingrédients</p>
                        </div>
                      ) : (
                        [selectedCards.base, selectedCards.cream, selectedCards.filling, selectedCards.glaze, ...selectedCards.decorations]
                          .filter(c => c)
                          .map((cardInst, idx) => (
                            <div key={idx} className="relative">
                              <Card card={cardInst.card} level={cardInst.level} compact />
                            </div>
                          ))
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* Boutons */}
              <div className="p-4 bg-gray-50 flex gap-3 rounded-b-2xl sticky bottom-0 border-t-2 border-gray-200">
                {createStep === 1 ? (
                  <>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg font-bold hover:bg-gray-400 text-base"
                    >
                      <i className="fas fa-times mr-2"></i>Annuler
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex-1 bg-pink-500 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-pink-600 hover:shadow-lg text-base"
                    >
                      Suivant <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </>
                ) : createStep === 2 ? (
                  <>
                    <button
                      onClick={previousStep}
                      className="flex-1 bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg font-bold hover:bg-gray-400 text-base"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>Précédent
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex-1 bg-pink-500 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-pink-600 hover:shadow-lg text-base"
                    >
                      Suivant <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={previousStep}
                      className="flex-1 bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg font-bold hover:bg-gray-400 text-base"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>Précédent
                    </button>
                    <button
                      onClick={createTeam}
                      className="flex-1 bg-pink-500 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-pink-600 hover:shadow-lg text-base"
                    >
                      <i className="fas fa-check mr-2"></i>Créer le Gâteau
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
