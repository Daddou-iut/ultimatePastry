import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Cacher sur login et signin
  if (location.pathname === '/login' || location.pathname === '/signin') {
    return null;
  }

  const navItems = [
    { path: '/inventory', icon: 'hugeicons:cards-02', iconType: 'iconify', label: 'Cartes' },
    { path: '/teams', icon: 'mdi:cake', iconType: 'iconify', label: 'Gâteaux' },
    { path: '/matches', icon: 'fas fa-fire', iconType: 'fontawesome', label: 'Matchs' },
    { path: '/packs', icon: 'fas fa-gift', iconType: 'fontawesome', label: 'Packs' },
    { path: '/marketplace', icon: 'solar:shop-outline', iconType: 'iconify', label: 'Marketplace' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-pink-300 shadow-lg">
      <div className="flex justify-around gap-4 px-6 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1 px-4 py-3 rounded-lg border-2 font-bold transition
                ${isActive 
                  ? 'bg-pink-400 border-pink-500 text-white' 
                  : 'bg-pink-200 border-pink-300 hover:bg-pink-400 hover:text-white'}
              `}
            >
              {item.iconType === 'iconify' ? (
                <Icon icon={item.icon} className="text-xl" />
              ) : (
                <i className={`${item.icon} text-xl`}></i>
              )}
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

