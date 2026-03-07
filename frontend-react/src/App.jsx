import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Card } from './components/Card'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { Inventory } from './pages/Inventory'
import { Login } from './pages/Login'
import { SignIn } from './pages/SignIn'
import { Game } from './pages/Game'
import { Teams } from './pages/Teams'
import { Packs } from './pages/Packs'
import { Matches } from './pages/Matches'
import { Marketplace } from './pages/Marketplace'
import './App.css'

function App() {
  // Exemples de cartes de ton jeu
  const sampleCards = [
    {
      id: 1,
      family: 'base',
      name: 'Génoise Vanille',
      rarity: 'common',
      gout: 45,
      technique: 38,
      esthetique: 52,
      flavor: 'vanilla'
    },
    {
      id: 2,
      family: 'glaze',
      name: 'Glaçage Caramel',
      rarity: 'uncommon',
      gout: 85,
      technique: 70,
      esthetique: 80,
      flavor: 'caramel'
    },
    {
      id: 3,
      family: 'cream',
      name: 'Crème Pistache',
      rarity: 'rare',
      gout: 88,
      technique: 78,
      esthetique: 85,
      flavor: 'pistachio'
    },
    {
      id: 4,
      family: 'filling',
      name: 'Ganache Fruit',
      rarity: 'rare',
      gout: 80,
      technique: 75,
      esthetique: 75,
      flavor: 'fruit'
    },
    {
      id: 5,
      family: 'decoration',
      name: 'Décor Neutre',
      rarity: 'common',
      gout: 50,
      technique: 55,
      esthetique: 80,
      flavor: 'neutral'
    },
    {
      id: 6,
      family: 'base',
      name: 'Biscuit Citron',
      rarity: 'epic',
      gout: 95,
      technique: 90,
      esthetique: 92,
      flavor: 'lemon'
    }
  ];

  return (
    <BrowserRouter>
      {/* Header avec menu, argent, profil et déconnexion */}
      <Header />

      {/* Routes */}
      <Routes>
        {/* Page d'accueil - Profil du joueur */}
        <Route path="/" element={<Game />} />

        {/* Page Inventaire */}
        <Route path="/inventory" element={<Inventory />} />
        
        {/* Page Gâteaux/Teams */}
        <Route path="/teams" element={<Teams />} />
        
        {/* Page Matchs */}
        <Route path="/matches" element={<Matches />} />
        
        {/* Page Packs */}
        <Route path="/packs" element={<Packs />} />
        
        {/* Page Marketplace */}
        <Route path="/marketplace" element={<Marketplace />} />
        
        {/* Page Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Page Sign In (Inscription) */}
        <Route path="/signin" element={<SignIn />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  )
}

export default App
