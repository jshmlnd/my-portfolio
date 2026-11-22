import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import HeroSection from './pages/Hero'
import About from './pages/About'
import Navbar from './pages/Navbar'
import CustomCursor from './components/CustomCursor'
import DeferredSection from './components/DeferredSection'
import { SoundContext, useSoundProvider } from './hooks/useSound'

const Repositories = lazy(() => import('./pages/Repositories'))
const NpmPackage = lazy(() => import('./pages/NpmPackage'))
const Certifications = lazy(() => import('./pages/Certifications'))
const Contact = lazy(() => import('./pages/Contact'))
const Footer = lazy(() => import('./pages/Footer'))

function SoundProvider({ children }) {
  const sound = useSoundProvider();
  return <SoundContext.Provider value={sound}>{children}</SoundContext.Provider>;
}

const SectionFallback = () => <div className="h-24 bg-[#09090b]" aria-hidden="true" />;

function Portfolio() {
  return (
    <div className="md:flex">
      <Navbar />
      {/* pl-14 keeps content clear of the fixed 56px icon rail on phones; on md+ the sidebar is in the flow */}
      <main className="flex-1 min-w-0 pl-14 md:pl-0">
      <HeroSection />
      <About />
      <DeferredSection><Suspense fallback={<SectionFallback />}><Repositories /></Suspense></DeferredSection>
      <DeferredSection><Suspense fallback={<SectionFallback />}><NpmPackage /></Suspense></DeferredSection>
      <DeferredSection><Suspense fallback={<SectionFallback />}><Certifications /></Suspense></DeferredSection>
      <DeferredSection><Suspense fallback={<SectionFallback />}><Contact /></Suspense></DeferredSection>
      <DeferredSection><Suspense fallback={<SectionFallback />}><Footer /></Suspense></DeferredSection>
      </main>
    </div>
  );
}

function App() {
  return (
    <div className="relative w-full min-h-screen bg-[#09090b] text-zinc-100 selection:bg-white/10 selection:text-white antialiased">
      <SoundProvider>
        <CustomCursor />
        <Routes>
          <Route path="*" element={<Portfolio />} />
        </Routes>
      </SoundProvider>
    </div>
  )
}

export default App
