import HeroSection from './pages/Hero'
import Navbar from './pages/Navbar'
import MainContent from './pages/MainContent'
import Certifications from './pages/Certifications'
import Footer from './pages/Footer'

function App() {
  return (
    <div className="relative w-full min-h-screen bg-[#09090b] text-zinc-100 selection:bg-white/10 selection:text-white antialiased">
      <Navbar />
      <HeroSection />
      <MainContent />
      <Certifications />
      <Footer />
    </div>
  )
}

export default App
