import { useState, useEffect, useRef } from 'react';
import { CollapsibleSidebar } from 'zjkm-ui/collapsible-sidebar';
import { Home, User, LayoutGrid, Package, Award, Mail, Volume2, VolumeX } from 'lucide-react';
import { siGithub } from 'simple-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { navItems } from './navItems';
import { useSoundControls } from '../hooks/useSound';

const ICONS = { about: User, projects: LayoutGrid, packages: Package, certs: Award, contact: Mail };
const items = [
  { label: 'Home', href: '#hero', icon: <Home size={18} /> },
  ...navItems.map(({ label, href, id }) => {
    const Icon = ICONS[id];
    return { label, href, icon: <Icon size={18} /> };
  }),
];

// Same geometry as the sidebar's own rows, so icons line up in both states.
const rowButton =
  'w-full h-[38px] px-[10px] rounded-lg flex items-center gap-3 whitespace-nowrap text-[15px] text-zinc-200 hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-2 focus-visible:outline-white';
const rowIcon = 'w-[18px] flex justify-center shrink-0 text-zinc-400';

const BrandIcon = ({ path }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d={path} />
  </svg>
);

const Navbar = () => {
  const [current, setCurrent] = useState('#hero');
  // True while a click's rAF scroll animation runs, so the scroll-spy doesn't flicker through sections.
  const programmaticScroll = useRef(0);
  const sound = useSoundControls();

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      if (programmaticScroll.current > 0) return;
      const line = window.innerHeight * 0.4;
      let next = '#hero';
      for (const { href } of items) {
        const el = document.querySelector(href);
        if (el && el.getBoundingClientRect().top <= line) next = href;
      }
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) next = items[items.length - 1].href;
      setCurrent((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollTo = (href, tries = 0) => {
    const el = document.querySelector(href);
    if (!el) {
      // Section not rendered yet (lazy): load them all, then retry for up to ~2s while chunks arrive.
      if (tries === 0) window.dispatchEvent(new Event('deferred:load-all'));
      if (tries < 120) requestAnimationFrame(() => scrollTo(href, tries + 1));
      return;
    }
    const start = window.scrollY;
    const duration = 550;
    let startTime = null;
    programmaticScroll.current += 1;
    setCurrent(href);
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      // Re-measure each frame: lazy sections above the target can still be mounting and shift it.
      const target = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, start + (target - start) * ease);
      if (p < 1) requestAnimationFrame(step);
      else programmaticScroll.current -= 1;
    };
    requestAnimationFrame(step);
  };

  // The sidebar renders plain hash links; take over their clicks for the smooth scroll.
  const onNavClick = (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    scrollTo(link.getAttribute('href'));
    // On phones the expanded sidebar overlays the page; fold it back once a section is picked.
    // The component owns its state, so use its own toggle.
    const aside = e.currentTarget;
    if (window.matchMedia('(max-width: 767px)').matches && !aside.querySelector('nav[data-collapsed]')) {
      aside.querySelector('nav.site-sidebar-nav > button')?.click();
    }
  };

  return (
    <aside
      onClick={onNavClick}
      className="site-sidebar fixed md:sticky inset-y-0 left-0 top-0 z-50 h-dvh shrink-0 flex flex-col border-r border-[#232326] bg-[#09090b] text-zinc-400"
    >
      <a href="#hero" aria-label="jshmlnd.dev, back to top" className="mx-2 mt-3 mb-2 h-[38px] flex items-center gap-2 whitespace-nowrap">
        <span className="w-[38px] flex justify-center shrink-0">
          <span className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-mono font-bold text-[13px] tracking-tighter">
            &lt;/&gt;
          </span>
        </span>
        <span className="site-sidebar__label text-[17px] font-semibold tracking-tight text-white">jshmlnd.dev</span>
      </a>

      <CollapsibleSidebar
        items={items}
        current={current}
        label="Primary"
        defaultCollapsed={typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches}
        className="site-sidebar-nav flex-1"
      />

      <div className="flex flex-col gap-1 p-2 border-t border-[#232326]">
        <a href="https://github.com/jshmlnd" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub" className={rowButton}>
          <span className={rowIcon}><BrandIcon path={siGithub.path} /></span>
          <span className="site-sidebar__label">github</span>
        </a>
        <a href="https://www.linkedin.com/in/jshmlnd/" target="_blank" rel="noopener noreferrer" aria-label="Hire me on LinkedIn" title="Hire me on LinkedIn" className={rowButton}>
          <span className={rowIcon}><FontAwesomeIcon icon={faLinkedin} className="text-[16px]" /></span>
          <span className="site-sidebar__label">linkedin</span>
        </a>
        <button
          type="button"
          onClick={() => sound?.[sound.enabled ? 'disable' : 'enable']()}
          className={rowButton}
          aria-label={`Interface sounds: ${sound?.enabled ? 'on' : 'off'}`}
          aria-pressed={sound?.enabled || false}
          title={sound?.enabled ? 'Mute interface sounds' : 'Enable interface sounds'}
        >
          <span className={rowIcon}>{sound?.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</span>
          <span className="site-sidebar__label">{sound?.enabled ? 'on' : 'off'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
