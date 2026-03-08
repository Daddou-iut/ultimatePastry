import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import backgroundImage from '../assets/background2.png';
import { generateCardSVG } from '../cardGenerator';
import API_URL from '../config';

const getBaseImageFilename = (card) => {
  if (!card) return null;
  
  const name = card.name.toLowerCase();
  const flavor = (card.flavor || 'neutral').toLowerCase();
  
  let baseType = 'base';
  if (name.includes('génoise')) {
    baseType = 'génoise';
  } else if (name.includes('biscuit')) {
    baseType = 'biscuit';
  } else if (name.includes('dacquoise')) {
    baseType = 'dacquoise';
  }
  
  return `/generated_bases/${baseType}_${flavor}.png`;
};

const getFillingImageFilename = (card) => {
  if (!card) return null;
  const flavor = (card.flavor || 'neutral').toLowerCase();
  return `/generated_fillings/filling_${flavor}.png`;
};

const getDecorationImageFilename = (card) => {
  if (!card) return null;
  
  const nameMap = {
    'fruits rouges': 'fruits_rouges.png',
    'fraises': 'fraises.png',
    'framboises': 'framboises.png',
    'myrtilles': 'myrtilles.png',
    'macarons': 'macarons.png',
    'or alimentaire': 'or_alimentaire.png',
    'noisettes grillées': 'hazelnut.png',
    'amandes effilées': 'amndes_effilées.png',
    'pépites chocolat': 'pépites_chocolat.png',
    'pistaches concassées': 'pistache.png' // fallback
  };
  
  const name = (card.name || '').toLowerCase();
  const filename = nameMap[name];
  
  return filename ? `/generated_decorations/${filename}` : null;
};

const getFlavorColors = (flavor) => {
  const flavorsColors = {
    caramel: { top: '#d97706', bottom: '#92400e' },
    strawberry: { top: '#fb7185', bottom: '#be123c' },
    chocolate: { top: '#634832', bottom: '#3e2723' },
    pistachio: { top: '#a3e635', bottom: '#4d7c0f' },
    vanilla: { top: '#fffbeb', bottom: '#fef3c7' },
    lemon: { top: '#fef08a', bottom: '#facc15' },
    blueberry: { top: '#6366f1', bottom: '#312e81' },
    raspberry: { top: '#e11d48', bottom: '#881337' },
    cherry: { top: '#991b1b', bottom: '#450a0a' },
    butter: { top: '#fef3d7', bottom: '#fef08a' },
    cream: { top: '#f3f4f6', bottom: '#e5e7eb' },
    fruit: { top: '#f472b6', bottom: '#ec4899' },
    nut: { top: '#d4a373', bottom: '#92582a' },
    coffee: { top: '#78360f', bottom: '#451a03' },
    almond: { top: '#d2b48c', bottom: '#a0826d' },
    hazelnut: { top: '#b5851f', bottom: '#78491f' },
    neutral: { top: '#e5e7eb', bottom: '#d1d5db' },
    fig: { top: '#c084fc', bottom: '#7e22ce' },
    apple: { top: '#d0e590b7', bottom: '#65161d' },
  };
  
  const key = (flavor || 'neutral').toLowerCase();
  return flavorsColors[key] || flavorsColors.neutral;
};

const renderCreamCylinder = (card) => {
  const colors = getFlavorColors(card.flavor);
  
  return `
    <svg width="100%" height="100%" viewBox="0 0 400 350"
         xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">
      
      <ellipse cx="200" cy="160" rx="120" ry="18" fill="#c8bba5" opacity="0.35"/>
      <ellipse cx="200" cy="330" rx="115" ry="18" fill="${colors.top}"/>
      <rect x="85" y="130" width="230" height="200" fill="${colors.bottom}"/>
      <ellipse cx="200" cy="130" rx="115" ry="18" fill="${colors.top}"/>
    </svg>
  `;
};

const renderGlazeCylinder = (card) => {
  const colors = getFlavorColors(card.flavor);
  return `
    <svg width="100%" viewBox="0 0 400 350"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet">

    <!-- Glaçage coulant -->
    <path d="
      M85 138
      C110 118 290 118 315 138
      L315 158
      C300 173 285 168 275 153
      C265 138 250 148 240 168
      C230 188 210 188 200 168
      C190 148 175 148 165 168
      C155 188 135 188 125 168
      C115 148 100 138 90 153
      C80 168 70 168 85 153
      Z"
      fill="${colors.top}" stroke="${colors.bottom}" stroke-width="2"/>

    <!-- Surface du glaçage (dessus rond) -->
    <ellipse cx="200" cy="138" rx="115" ry="18"
            fill="${colors.top}" stroke="${colors.bottom}" stroke-width="2"/>
  </svg>
  `;
};

const buildLayerList = (team) => {
  const layers = [];

  // 1. Base (en bas)
  if (team?.base?.card) {
    layers.push({ 
      id: `base-bottom-${team.base.id}`, 
      type: 'base', 
      card: team.base.card,
      imageUrl: getBaseImageFilename(team.base.card)
    });
  }

  // 2. Fourrage
  if (team?.filling?.card) {
    layers.push({ 
      id: `filling-${team.filling.id}`, 
      type: 'filling', 
      card: team.filling.card,
      imageUrl: getFillingImageFilename(team.filling.card)
    });
  }

  // 3. Base (en haut)
  if (team?.base?.card) {
    layers.push({ 
      id: `base-top-${team.base.id}`, 
      type: 'base', 
      card: team.base.card,
      imageUrl: getBaseImageFilename(team.base.card)
    });
  }

  // 4. Crème (couvre tout)
  if (team?.cream?.card) {
    layers.push({ 
      id: `cream-${team.cream.id}`, 
      type: 'cream', 
      card: team.cream.card,
      isOverlay: true
    });
  }

  // 5. Glaçage (couvre tout)
  if (team?.glaze?.card) {
    layers.push({ 
      id: `glaze-${team.glaze.id}`, 
      type: 'glaze', 
      card: team.glaze.card,
      isOverlay: true
    });
  }

  return layers;
};

const LayerSVG = ({ layer, delayStart, idx }) => {
  const isCream = layer.type === 'cream';
  const isGlaze = layer.type === 'glaze';
  const isPNG = layer.type === 'base' || layer.type === 'filling';
  const layerStart = delayStart + 0.8 + (idx * 1.9);

  // Crème : afficher le cylindre de pièce montée
  if (isCream) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: layerStart,
          duration: 2,
          type: 'spring',
          stiffness: 78,
          damping: 22
        }}
        className="absolute left-1/2 -translate-x-1/2 w-[320px] sm:w-[380px] h-[330px] sm:h-[390px]"
        style={{ bottom: `${-2}px`, zIndex: 150 }}
      >
        <div 
          className="w-full h-full" 
          dangerouslySetInnerHTML={{ __html: renderCreamCylinder(layer.card) }}
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
        />
        
        <motion.i
          initial={{ opacity: 0, x: -25, y: 10, rotate: -35 }}
          animate={{ opacity: [0, 1, 1, 0], x: 35, y: -12, rotate: 30 }}
          transition={{
            delay: layerStart + 0.6,
            duration: 2,
            ease: 'easeInOut'
          }}
          className="fas fa-spoon absolute right-0 bottom-8 text-fuchsia-600 text-xl"
        ></motion.i>
      </motion.div>
    );
  }

  // Glaçage : couche coulante posée sur la crème
  if (isGlaze) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -18, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: layerStart,
          duration: 2,
          type: 'spring',
          stiffness: 78,
          damping: 22
        }}
        className="absolute left-1/2 -translate-x-1/2 w-[320px] sm:w-[380px] h-[330px] sm:h-[390px]"
        style={{ bottom: `${-23}px`, zIndex: 170 }}
      >
        <motion.div
          className="w-full h-full rounded-2xl overflow-hidden"
          style={{ opacity: 0.92 }}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={{
            delay: layerStart + 0.7,
            duration: 2,
            ease: 'easeOut'
          }}
        >
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: renderGlazeCylinder(layer.card) }}
            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.18))' }}
          />
        </motion.div>

        <motion.i
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, 6, 14, 20] }}
          transition={{
            delay: layerStart + 1,
            duration: 1.6,
            ease: 'easeInOut'
          }}
          className="fas fa-droplet absolute left-1/2 -translate-x-1/2 top-2 text-sky-500 text-sm"
        ></motion.i>
      </motion.div>
    );
  }

  // Base ou Fourrage : images PNG empilées
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.72 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: layerStart,
        duration: 1.7,
        type: 'spring',
        stiffness: 84,
        damping: 24
      }}
      className="absolute left-1/2 -translate-x-1/2 w-[380px] sm:w-[460px] h-[160px] sm:h-[190px]"
      style={{ bottom: `${8 + (idx * 15)}px`, zIndex: 10 + idx }}
    >
      {isPNG && layer.imageUrl ? (
        <img 
          src={layer.imageUrl} 
          alt={layer.card.name}
          className="w-full h-full object-contain scale-[1.35] sm:scale-[1.4] origin-center"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.22))' }}
        />
      ) : (
        <motion.div
          className="w-full h-full rounded-xl overflow-hidden border border-white/70 shadow-sm bg-white/90"
        >
          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: generateCardSVG(layer.card) }} />
        </motion.div>
      )}
    </motion.div>
  );
};

const CakeBuildAnimation = ({ team, color, isWinner = false, delayStart = 0 }) => {
  const layers = buildLayerList(team);
  const decorations = team?.decorations || [];
  const decorationStart = delayStart + 0.8 + (layers.length * 1.9) + 0.6;

  return (
    <div className="flex-1 min-w-0">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delayStart, duration: 0.35 }}
        className={`rounded-2xl border-2 p-4 sm:p-5 ${color} ${isWinner ? 'ring-4 ring-emerald-400/80 shadow-lg shadow-emerald-300/50' : ''}`}
      >
        <div className="text-center mb-2">
          <h4 className="font-black text-base sm:text-lg text-gray-800 truncate">{team?.name || 'Gâteau'}</h4>
        </div>

        <div className="h-[300px] sm:h-[340px] rounded-xl bg-white/70 border border-white/80 px-2 py-2 relative overflow-hidden flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delayStart + 0.15, duration: 0.25 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-2 w-[360px] sm:w-[420px] h-6 bg-gray-300/70 blur-[1px] rounded-full"
          ></motion.div>

          {layers.map((layer, idx) => (
            <LayerSVG key={layer.id} layer={layer} delayStart={delayStart} idx={idx} />
          ))}

          {decorations.slice(0, 6).map((decoration, index) => {
            const imageUrl = getDecorationImageFilename(decoration.card);
            const positions = [
              { left: '38%', top: '12%' },
              { left: '42%', top: '14%' },
              { left: '50%', top: '12%' },
              { left: '38%', top: '14%' },
              { left: '42%', top: '16%' },
              { left: '50%', top: '14%' }
            ];
            const position = positions[index] || { left: '42%', top: '14%' };

            return (
              <motion.div
                key={`deco-${decoration.id}-${index}`}
                initial={{ opacity: 0, y: -16, scale: 0.3, rotate: -15 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                transition={{ 
                  delay: decorationStart + (index * 0.55), 
                  duration: 1.55,
                  type: 'spring',
                  stiffness: 80,
                  damping: 22
                }}
                className="absolute w-16 h-16 sm:w-20 sm:h-20"
                style={{
                  left: position.left,
                  top: position.top,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 200 + index
                }}
              >
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={decoration.card.name}
                    className="w-full h-full object-contain"
                    style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}
                  />
                ) : (
                  <span className="block w-full h-full rounded-full bg-pink-400 border-2 border-white"></span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-1 text-[11px] sm:text-xs text-gray-600 font-semibold flex flex-wrap justify-center gap-2">
          {team?.base?.card && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Base: {team.base.card.name}</span>}
          {team?.cream?.card && <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">Crème: {team.cream.card.name}</span>}
          {team?.filling?.card && <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Fourrage: {team.filling.card.name}</span>}
          {team?.glaze?.card && <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Glaçage: {team.glaze.card.name}</span>}
        </div>
      </motion.div>
    </div>
  );
};

export const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [myTeams, setMyTeams] = useState([]);
  const [adversaryTeams, setAdversaryTeams] = useState([]);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [team1Preview, setTeam1Preview] = useState(null);
  const [team2Preview, setTeam2Preview] = useState(null);
  const [showBattle, setShowBattle] = useState(false);
  const [battleTeams, setBattleTeams] = useState({ team1: null, team2: null });
  const [showResult, setShowResult] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myTeamIds, setMyTeamIds] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadMyTeams();
    loadMatches();
  }, [token, navigate]);

  const loadMyTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/teams/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const teams = await response.json();
      setMyTeamIds(teams.map(t => t.id));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/matches/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await response.json();
      setMatches(response.ok && data.length > 0 ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      const myTeamsResponse = await fetch(`${API_URL}/teams/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const myTeamsData = await myTeamsResponse.json();

      if (myTeamsData.length === 0) {
        alert('⚠️ Vous devez créer au moins un gâteau !');
        return;
      }

      const adversaryTeamsResponse = await fetch(`${API_URL}/adversary-teams/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const adversaryTeamsData = await adversaryTeamsResponse.json();

      setMyTeams(myTeamsData);
      setAdversaryTeams(adversaryTeamsData);
      setShowModal(true);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTeam1Id('');
    setTeam2Id('');
    setTeam1Preview(null);
    setTeam2Preview(null);
  };

  const updatePreview = (teamNum, teamId) => {
    const allTeams = [...myTeams, ...adversaryTeams];
    const team = allTeams.find(t => t.id === parseInt(teamId));
    
    if (teamNum === 1) {
      setTeam1Preview(team || null);
    } else {
      setTeam2Preview(team || null);
    }
  };

  const launchMatch = async () => {
    if (!team1Id || !team2Id) {
      alert('⚠️ Sélectionnez les deux gâteaux !');
      return;
    }

    if (team1Id === team2Id) {
      alert('⚠️ Vous ne pouvez pas affronter le même gâteau !');
      return;
    }

    const selectedTeam1 = myTeams.find((team) => team.id === parseInt(team1Id));
    const selectedTeam2 = adversaryTeams.find((team) => team.id === parseInt(team2Id));

    setBattleTeams({ team1: selectedTeam1 || null, team2: selectedTeam2 || null });
    setShowModal(false);
    setShowBattle(true);

    try {
      const response = await fetch(`${API_URL}/matches/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          team1_id: parseInt(team1Id),
          team2_id: parseInt(team2Id)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMatchResult(data);
        setShowResult(true);
        loadMatches();
      } else {
        setShowModal(true);
        alert('❌ Erreur: ' + (data.error || JSON.stringify(data)));
      }
    } catch (error) {
      console.error('Erreur:', error);
      setShowModal(true);
      alert('❌ Erreur lors du match');
    } finally {
      setShowBattle(false);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setMatchResult(null);
    setTeam1Id('');
    setTeam2Id('');
    setTeam1Preview(null);
    setTeam2Preview(null);
    setShowBattle(false);
    setBattleTeams({ team1: null, team2: null });
  };

  const constructionFinishedDelay = 7.8;

  return (
    <div className="min-h-[calc(100dvh-14rem)] pt-24 pb-32" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      minHeight: '100vh'
    }}>
      <div className="flex-1 flex gap-6 mx-4">
        <div className="flex-1 bg-white bg-opacity-80 rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-swords text-pink-500 mr-2"></i>Matchs
            </h1>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition"
            >
              <i className="fas fa-play mr-2"></i>Nouveau Match
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">
              <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
              <p>Chargement...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              Aucun match joué pour le moment...
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const iMyTeamP1 = myTeamIds.includes(match.teamP1?.id);
                const myTeam = iMyTeamP1 ? match.teamP1 : match.teamP2;
                const adversaryTeam = iMyTeamP1 ? match.teamP2 : match.teamP1;
                const myScore = iMyTeamP1 ? match.score_player1 : match.score_player2;
                const adversaryScore = iMyTeamP1 ? match.score_player2 : match.score_player1;
                const isWinner = match.winner?.id === myTeam?.id;
                const winnerClass = isWinner ? 'border-green-500' : 'border-red-500';

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 ${winnerClass} p-6`}
                  >
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center">
                        <h3 className={`font-bold text-xl ${isWinner ? 'text-green-600' : ''}`}>
                          {myTeam?.name || 'N/A'}
                        </h3>
                        <p className="text-3xl font-bold text-pink-600">{myScore}</p>
                      </div>

                      <div className="text-center">
                        <i className="fas fa-crossed-swords text-4xl text-gray-400"></i>
                        <p className="text-sm text-gray-600 mt-2">
                          {new Date(match.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-center">
                        <h3 className={`font-bold text-xl ${!isWinner ? 'text-green-600' : ''}`}>
                          {adversaryTeam?.name || 'N/A'}
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">{adversaryScore}</p>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      {isWinner ? (
                        <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          <i className="fas fa-trophy mr-1"></i>Victoire
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          <i className="fas fa-times mr-1"></i>Défaite
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de lancement de match */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-lg p-5 sm:p-6 max-w-2xl w-full m-4 max-h-[82dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6 text-center">
                <i className="fas fa-trophy text-yellow-500 mr-2"></i>Lancer un Match
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Équipe 1 */}
                <div className="border-2 border-pink-400 rounded-lg p-4">
                  <h3 className="font-bold text-pink-600 mb-3 text-center">Votre Gâteau</h3>
                  <select
                    value={team1Id}
                    onChange={(e) => {
                      setTeam1Id(e.target.value);
                      updatePreview(1, e.target.value);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500"
                  >
                    <option value="">Sélectionner...</option>
                    {myTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {team1Preview && (
                    <div className="mt-3 bg-white rounded p-2 space-y-1 text-sm">
                      <p><i className="fas fa-layer-group text-pink-500"></i> {team1Preview.base?.card?.name || 'N/A'}</p>
                      <p><i className="fas fa-ice-cream text-purple-500"></i> {team1Preview.cream?.card?.name || 'N/A'}</p>
                      {team1Preview.filling && <p><i className="fas fa-cookie-bite text-yellow-500"></i> {team1Preview.filling.card.name}</p>}
                      {team1Preview.glaze && <p><i className="fas fa-droplet text-blue-500"></i> {team1Preview.glaze.card.name}</p>}
                    </div>
                  )}
                </div>

                {/* Équipe 2 */}
                <div className="border-2 border-purple-400 rounded-lg p-4">
                  <h3 className="font-bold text-purple-600 mb-3 text-center">Adversaire</h3>
                  <select
                    value={team2Id}
                    onChange={(e) => {
                      setTeam2Id(e.target.value);
                      updatePreview(2, e.target.value);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                  >
                    <option value="">Sélectionner...</option>
                    {adversaryTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.owner.user.username})
                      </option>
                    ))}
                  </select>
                  {team2Preview && (
                    <div className="mt-3 bg-white rounded p-2 space-y-1 text-sm">
                      <p><i className="fas fa-layer-group text-pink-500"></i> {team2Preview.base?.card?.name || 'N/A'}</p>
                      <p><i className="fas fa-ice-cream text-purple-500"></i> {team2Preview.cream?.card?.name || 'N/A'}</p>
                      {team2Preview.filling && <p><i className="fas fa-cookie-bite text-yellow-500"></i> {team2Preview.filling.card.name}</p>}
                      {team2Preview.glaze && <p><i className="fas fa-droplet text-blue-500"></i> {team2Preview.glaze.card.name}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={launchMatch}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg"
                >
                  Lancer le Match !
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal animation du combat en cours */}
      <AnimatePresence>
        {showBattle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-65 flex items-center justify-center z-[60]"
          >
            <motion.div
              initial={{ scale: 0.95, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 40 }}
              className="bg-white rounded-2xl p-4 sm:p-5 w-[90vw] max-w-none m-4 relative max-h-[82dvh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <p className="uppercase tracking-[0.3em] text-xs font-black text-gray-500">Match en cours</p>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mt-2">Préparation des gâteaux</h2>
                <p className="text-gray-600 mt-2">Chaque couche se pose avant la confrontation finale.</p>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-4">
                <CakeBuildAnimation
                  team={battleTeams.team1}
                  color="bg-pink-50 border-pink-200"
                  delayStart={0}
                />

                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.35 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg"
                  >
                    VS
                  </motion.div>
                  <motion.i
                    initial={{ rotate: -25, opacity: 0 }}
                    animate={{ rotate: [0, -8, 8, -8, 0], opacity: 1 }}
                    transition={{ delay: 0.55, repeat: Infinity, duration: 1.5 }}
                    className="fas fa-crossed-swords text-2xl text-gray-500"
                  ></motion.i>
                </div>

                <CakeBuildAnimation
                  team={battleTeams.team2}
                  color="bg-purple-50 border-purple-200"
                  delayStart={0.18}
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-6 text-center text-sm text-gray-500"
              >
                Calcul des scores en cours...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal résultat */}
      <AnimatePresence>
        {showResult && matchResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeResult}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-2xl p-4 sm:p-5 w-[90vw] max-w-none m-4 relative max-h-[88dvh] overflow-y-auto border-2 border-pink-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_320px] gap-4 items-stretch">
                <div className="border-2 border-pink-200 rounded-2xl bg-gradient-to-b from-pink-50 to-white p-3">
                  <CakeBuildAnimation
                    team={matchResult.teamP1}
                    color="bg-pink-50 border-pink-200"
                    isWinner={matchResult.winner?.id === matchResult.teamP1?.id}
                    delayStart={0}
                  />
                </div>

                <div className="border-2 border-purple-200 rounded-2xl bg-gradient-to-b from-purple-50 to-white p-3">
                  <CakeBuildAnimation
                    team={matchResult.teamP2}
                    color="bg-purple-50 border-purple-200"
                    isWinner={matchResult.winner?.id === matchResult.teamP2?.id}
                    delayStart={0.18}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: constructionFinishedDelay, duration: 0.4 }}
                    className={`rounded-xl border-2 p-4 bg-white ${matchResult.winner?.id === matchResult.teamP1?.id ? 'border-emerald-400' : 'border-pink-200'}`}
                  >
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-black">Score Gateau 1</p>
                    <p className="text-sm text-gray-700 font-semibold truncate">{matchResult.teamP1?.name}</p>
                    <p className="text-4xl font-black text-pink-600 mt-1">{matchResult.score_player1}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: constructionFinishedDelay + 0.2, duration: 0.4 }}
                    className={`rounded-xl border-2 p-4 bg-white ${matchResult.winner?.id === matchResult.teamP2?.id ? 'border-emerald-400' : 'border-purple-200'}`}
                  >
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-black">Score Gateau 2</p>
                    <p className="text-sm text-gray-700 font-semibold truncate">{matchResult.teamP2?.name}</p>
                    <p className="text-4xl font-black text-purple-600 mt-1">{matchResult.score_player2}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: constructionFinishedDelay + 0.4, duration: 0.4 }}
                    className="rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-yellow-200 p-5 text-center"
                  >
                    <p className="uppercase tracking-wider text-xs text-gray-600 font-black">Resultat</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-2">
                      {matchResult.winner?.id === matchResult.teamP1?.id ? 'Victoire' : 'Defaite'}
                    </h3>
                    <p className="text-xl font-black mt-2">
                      {matchResult.money_won > 0 ? (
                        <span className="text-emerald-600">+{matchResult.money_won}$</span>
                      ) : (
                        <span className="text-rose-600">{matchResult.money_won}$</span>
                      )}
                    </p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: constructionFinishedDelay + 0.6, duration: 0.35 }}
                    onClick={closeResult}
                    className="mt-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 rounded-xl font-black hover:shadow-lg transition"
                  >
                    Fermer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
