import { Routes, Route } from 'react-router-dom'
import HeroSection from './pages/Hero'
import Navbar from './pages/Navbar'
import Repositories from './pages/Repositories'
import NpmPackage from './pages/NpmPackage'
import Certifications from './pages/Certifications'
import Contact from './pages/Contact'
import Footer from './pages/Footer'
import Game from './pages/game/Game'
import Lobby from './pages/game/Lobby'
import CustomCursor from './components/CustomCursor'
import { useSoundProvider } from './hooks/useSound'

function SoundProvider() {
  useSoundProvider();
  return null;
}

function Portfolio() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Repositories />
      <NpmPackage />
      <Certifications />
      <Contact />
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="relative w-full min-h-screen bg-[#09090b] text-zinc-100 selection:bg-white/10 selection:text-white antialiased">
      <CustomCursor />
      <SoundProvider />
      <Routes>
        <Route path="/game" element={<Game />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="*" element={<Portfolio />} />
      </Routes>
    </div>
  )
}

export default App
