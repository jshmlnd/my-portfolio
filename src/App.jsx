import HeroSection from './pages/Hero'
import Navbar from './pages/Navbar'
import MainContent from './pages/MainContent'
import Certifications from './pages/Certifications'
import Footer from './pages/Footer'

function App() {
  return (
    <div className="relative w-full bg-[#0d0221]">
        <Navbar />
        <HeroSection />
        <MainContent />
        <Certifications />
        <Footer />
    </div>
  )
}

export default App
