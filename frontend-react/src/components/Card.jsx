import { motion } from 'framer-motion';
import { generateCardSVG } from '../cardGenerator';
import goutIcon from '../assets/gout.png';
import techIcon from '../assets/tech.png';
import esthetiqueIcon from '../assets/estethique.png';
import almondImg from '../assets/flavors/almond.jpg';
import butterImg from '../assets/flavors/butter.jpg';
import caramelImg from '../assets/flavors/caramel.png';
import cherryImg from '../assets/flavors/cherry.png';
import chocolateImg from '../assets/flavors/chocolate.png';
import creamImg from '../assets/flavors/cream.jpg';
import coffeeImg from '../assets/flavors/coffe.jpg';
import figImg from '../assets/flavors/fig.png';
import hazelnutImg from '../assets/flavors/hazelnut.jpg';
import lemonImg from '../assets/flavors/lemon.png';
import myrtilleImg from '../assets/flavors/myrtille.png';
import pistacheImg from '../assets/flavors/pistache.jpg';
import blueberryImg from '../assets/flavors/blueberry.png';
import strawberryImg from '../assets/flavors/strawberry.png';
import vanillaImg from '../assets/flavors/vanilla.jpg';
import appleImg from '../assets/flavors/apple.jpg';

/**
 * Card - Carte animée pour afficher une carte de jeu
 * Props:
 *   - card: objet avec { name, rarity, gout, technique, esthetique, flavor, family }
 *   - level: niveau de la carte (optionnel)
 *   - compact: version plus petite pour les grilles/modales
 */
export const Card = ({ card, level, compact = false }) => {
  const flavorBadgeIcons = {
    caramel: caramelImg,
    strawberry: strawberryImg,
    chocolate: chocolateImg,
    pistachio: pistacheImg,
    vanilla: vanillaImg,
    lemon: lemonImg,
    blueberry: blueberryImg,
    raspberry: myrtilleImg,
    cherry: cherryImg,
    butter: butterImg,
    cream: creamImg,
    apple: appleImg,
    fig: figImg,
    nut: hazelnutImg,
    coffee: coffeeImg,
    almond: almondImg,
    hazelnut: hazelnutImg,
    neutral: vanillaImg,
  };

  const flavorKey = (card.flavor || 'neutral').toLowerCase();
  const flavorBadge = flavorBadgeIcons[flavorKey] || flavorBadgeIcons.neutral;

  // Couleurs de bordure selon rareté
  const rarityStyles = {
    'common': {
      border: '#000000',
      bg: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      shadow: 'rgba(156, 163, 175, 0.4)'
    },
    'uncommon': {
      border: '#C0C0C0',
      bg: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
      shadow: 'rgba(192, 192, 192, 0.5)'
    },
    'rare': {
      border: '#CD7F32',
      bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      shadow: 'rgba(205, 127, 50, 0.4)'
    },
    'epic': {
      border: '#FFD700',
      bg: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
      shadow: 'rgba(255, 215, 0, 0.6)'
    }
  };
  
  const currentRarity = rarityStyles[card.rarity] || rarityStyles.common;

  const wrapperSize = compact ? 'w-40 h-56 p-2' : 'w-60 h-80 p-3';
  const visualHeight = compact ? 'h-36' : 'h-64';
  const statsHeight = compact ? 'h-16' : 'h-20';
  const statTextSize = compact ? 'text-xs' : 'text-sm';

  return (
    <motion.div
      className={`rounded-xl shadow-lg ${wrapperSize} flex flex-col items-center justify-between cursor-pointer`}
      style={{
        background: currentRarity.bg,
        borderWidth: '4px',
        borderStyle: 'solid',
        borderColor: currentRarity.border,
        boxShadow: `0 4px 6px ${currentRarity.shadow}`
      }}
      
      // Animation au chargement
      initial={{ opacity: 0, y: 50, rotateY: -45 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ 
        duration: 0.6, 
        type: 'spring',
        stiffness: 100 
      }}
      
      // Animation au hover
      whileHover={{ 
        y: compact ? -8 : -20,
        scale: compact ? 1.02 : 1.05,
        boxShadow: `0 25px 50px ${currentRarity.shadow}`,
        transition: { duration: 0.3 }
      }}
      
      // Animation au clic
      whileTap={{ scale: 0.95 }}
    >

      {/* Visual representation - main focus */}
      <motion.div
        className={`w-full ${visualHeight} rounded overflow-hidden relative`}
        whileHover={{ scale: compact ? 1.01 : 1.03 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: generateCardSVG(card) }}
        />
        {/* Badge Niveau */}
        {level && (
          <div className={`absolute top-1 right-1 bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-bold shadow-lg border-2 border-white ${compact ? 'text-xs' : 'text-sm'}`}>
            Niv. {level}
          </div>
        )}

        <div className={`absolute top-3/5 right-1 -translate-y-1/2 bg-white/90 border border-gray-200 rounded-full shadow-md ${compact ? 'w-7 h-7 p-0.5' : 'w-9 h-9 p-0.5'}`}>
          <img src={flavorBadge} alt={`saveur ${card.flavor || 'neutral'}`} className="w-full h-full object-cover rounded-full" />
        </div>
      </motion.div>

      {/* Stats - Colonnes remplies style StatBar */}
      <div className={`flex gap-1 justify-center w-full ${statsHeight} items-end`}>
        {/* Goût column */}
        <motion.div className="flex flex-col items-center justify-end flex-1 h-full gap-0.5">
          <div className="w-full flex-1 bg-gray-200 rounded-full overflow-hidden flex flex-col-reverse relative">
            <div
              className="w-full rounded-full"
              style={{ 
                background: 'linear-gradient(180deg, #ec4899, #1f2937)',
                height: `${(card.gout / 100) * 100}%`
              }}
            />
            <img src={goutIcon} alt="goût" className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} />
          </div>
          <span className={`font-bold text-gray-700 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {Math.round((card.gout / 100) * 100)}%
          </span>
        </motion.div>

        {/* Technique column */}
        <motion.div className="flex flex-col items-center justify-end flex-1 h-full gap-0.5">
          <div className="w-full flex-1 bg-gray-200 rounded-full overflow-hidden flex flex-col-reverse relative">
            <div
              className="w-full rounded-full"
              style={{ 
                background: 'linear-gradient(180deg, #a855f7, #1f2937)',
                height: `${(card.technique / 100) * 100}%`
              }}
            />
            <img src={techIcon} alt="technique" className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} />
          </div>
          <span className={`font-bold text-gray-700 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {Math.round((card.technique / 100) * 100)}%
          </span>
        </motion.div>

        {/* Esthétique column */}
        <motion.div className="flex flex-col items-center justify-end flex-1 h-full gap-0.5">
          <div className="w-full flex-1 bg-gray-200 rounded-full overflow-hidden flex flex-col-reverse relative">
            <div
              className="w-full rounded-full"
              style={{ 
                background: 'linear-gradient(180deg, #3b82f6, #1f2937)',
                height: `${(card.esthetique / 100) * 100}%`
              }}
            />
            <img src={esthetiqueIcon} alt="esthétique" className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} />
          </div>
          <span className={`font-bold text-gray-700 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {Math.round((card.esthetique / 100) * 100)}%
          </span>
        </motion.div>
        
      </div>
    </motion.div>
  );
};
