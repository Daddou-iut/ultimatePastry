import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
