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

  const rarityColors = {
    'common': 'border-gray-400',
    'uncommon': 'border-yellow-600',
    'rare': 'border-silver-400',
    'epic': 'border-yellow-400'
  };
  
  const rarityBg = {
    'common': 'bg-gray-100',
    'uncommon': 'bg-yellow-50',
    'rare': 'bg-gray-50',
    'epic': 'bg-gradient-to-br from-yellow-100 to-orange-100'
  };
  
  const borderClass = rarityColors[card.rarity] || 'border-gray-400';
  const bgClass = rarityBg[card.rarity] || 'bg-transparent';

  const wrapperSize = compact ? 'w-40 h-56 p-2' : 'w-60 h-80 p-3';
  const visualHeight = compact ? 'h-36' : 'h-64';
  const statsHeight = compact ? 'h-16' : 'h-20';
  const statTextSize = compact ? 'text-xs' : 'text-sm';

  return (
    <motion.div
      className={`${bgClass} ${borderClass} border-4 rounded-xl shadow-lg ${wrapperSize} flex flex-col items-center justify-between cursor-pointer`}
      
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
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
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
