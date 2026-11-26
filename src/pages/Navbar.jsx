import { useState, useEffect, useRef } from 'react';
import { PillNavbar } from 'zjkm-ui/pill-navbar';
import { Volume2, VolumeX } from 'lucide-react';
import { siGithub } from 'simple-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareLinkedin } from '@fortawesome/free-brands-svg-icons';
import { navItems } from './navItems';
import { useSoundControls } from '../hooks/useSound';

const links = navItems.map(({ label, href }) => ({ label, href }));
const sections = ['#hero', ...links.map((l) => l.href)];

// The sticky header's height, so jumps land below it (it is taller on phones, where the nav wraps to a second row).
const headerOffset = () => document.querySelector('header')?.offsetHeight ?? 0;

const Navbar = () => {
  const [current, setCurrent] = useState('#hero');
  // True while a click's rAF scroll animation runs, so the scroll-spy doesn't flicker through sections.
  const programmaticScroll = useRef(0);
  const mobileRow = useRef(null);
  const sound = useSoundControls();

  // Keep the active link in view in the phone row, which scrolls sideways.
  useEffect(() => {
    const row = mobileRow.current;
    const link = row?.querySelector('a[aria-current="page"]');
    if (!row || !link || !row.offsetParent) return;
    const { left, right } = link.getBoundingClientRect();
    const box = row.getBoundingClientRect();
    // Instant: a smooth row scroll gets cancelled by the page's own animated scroll running at the same time.
    if (left < box.left + 24) row.scrollLeft += left - box.left - 24;
    else if (right > box.right - 24) row.scrollLeft += right - box.right + 24;
  }, [current]);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      if (programmaticScroll.current > 0) return;
      const line = window.innerHeight * 0.4;
      let next = '#hero';
      for (const href of sections) {
        const el = document.querySelector(href);
        if (el && el.getBoundingClientRect().top <= line) next = href;
      }
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) next = sections[sections.length - 1];
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
      const target = el.getBoundingClientRect().top + window.scrollY - (href === '#hero' ? 0 : headerOffset());
      window.scrollTo(0, start + (target - start) * ease);
      if (p < 1) requestAnimationFrame(step);
      else programmaticScroll.current -= 1;
    };
    requestAnimationFrame(step);
  };

  const onNavigate = (href, e) => {
    e.preventDefault();
    scrollTo(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232326] bg-[#09090b]/80 backdrop-blur-xl">
      <div className="max-w-[1160px] mx-auto px-6 h-[64px] flex items-center justify-between gap-6">
        <a href="#hero" onClick={(e) => onNavigate('#hero', e)} className="flex items-center gap-3 shrink-0 group" aria-label="jshmlnd.dev, back to top">
          <span className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-mono font-bold text-[13px] tracking-tighter">
            &lt;/&gt;
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-mono font-semibold text-[13px] tracking-tight text-white group-hover:text-zinc-200 transition-colors">jshmlnd.dev</span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-500">Full-stack Dev</span>
          </span>
        </a>

        {/* Hide via a wrapper: the component's own display rule outranks Tailwind's layered `hidden`. */}
        <div className="hidden md:block">
          <PillNavbar links={links} current={current} onNavigate={onNavigate} label="Primary" className="site-pill-nav" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://github.com/jshmlnd"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-colors"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
              <path d={siGithub.path} />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/jshmlnd/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hire me on LinkedIn"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[13px] font-medium text-black hover:bg-zinc-200 transition-colors"
          >
            Hire Me <FontAwesomeIcon icon={faSquareLinkedin} size="lg" style={{ color: 'rgb(30,144,255)' }} />
          </a>
          <button
            type="button"
            onClick={() => sound?.[sound.enabled ? 'disable' : 'enable']()}
            className="w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-colors"
            aria-label={sound?.enabled ? 'Mute interface sounds' : 'Enable interface sounds'}
            aria-pressed={sound?.enabled || false}
            title={sound?.enabled ? 'Mute interface sounds' : 'Enable interface sounds'}
          >
            {sound?.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      {/* Phones: the five links don't fit beside the logo, so they get their own scrollable row. */}
      <div ref={mobileRow} className="md:hidden overflow-x-auto px-4 pb-3 flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PillNavbar links={links} current={current} onNavigate={onNavigate} label="Primary" className="site-pill-nav shrink-0 mx-auto" />
      </div>
    </header>
  );
};

export default Navbar;
