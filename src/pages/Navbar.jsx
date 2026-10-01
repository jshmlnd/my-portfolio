import { ArrowUpRight } from 'lucide-react';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { siGithub } from 'simple-icons';
import { navItems } from './navItems';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareLinkedin } from '@fortawesome/free-brands-svg-icons';

const Navbar = () => {
  const [active, setActive] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [activeRect, setActiveRect] = useState({ left: 0, width: 0 });
  const [hoverRect, setHoverRect] = useState({ left: 0, width: 0 });
  const activeRef = useRef('hero');
  const hoveredRef = useRef(null);
  activeRef.current = active;
  hoveredRef.current = hovered;
  // True while a nav click's rAF scroll animation is running — the scroll-spy
  // stays quiet so the pill glides once, straight to the target (no mid-scroll hops).
  // Counter so overlapping animations don't clear each other's guard.
  const programmaticScroll = useRef(0);

  useEffect(() => {
    // rAF-throttled + change-gated: setting identical state bails out of the
    // re-render, so scrolling no longer re-renders the blurred header on every
    // scroll event (that re-render storm was a big part of the jank).
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setScrolled(window.scrollY > 8);
        setMobileOpen((prev) => (prev ? false : prev));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Position-based scroll-spy: exactly one deterministic answer per frame.
    // (The old IntersectionObserver fired on every enter/exit of its margin band
    // and flapped active between sections during fast scrolls — jagged pill.)
    let ticking = false;
    const update = () => {
      ticking = false;
      if (programmaticScroll.current > 0) return;
      const line = window.innerHeight * 0.4;
      let current = navItems[0].id;
      for (const { id } of navItems) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
        current = navItems[navItems.length - 1].id;
      }
      setActive((prev) => (prev === current ? prev : current));
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

  // Measure pill positions for soft slide — targetId-aware to avoid stale closure
  const updateActiveRect = (targetId = active) => {
    const el = itemRefs.current[targetId];
    const nav = navRef.current;
    if (!el || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setActiveRect({
      // nav.clientLeft: abs children position from the padding box, not the border box
      left: rect.left - navRect.left - nav.clientLeft,
      width: rect.width,
    });
  };

  const updateHoverRect = (id) => {
    const el = itemRefs.current[id];
    const nav = navRef.current;
    if (!el || !nav || !id) return;
    const navRect = nav.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setHoverRect({
      left: rect.left - navRect.left - nav.clientLeft,
      width: rect.width,
    });
  };

  // Measure synchronously when active changes. CSS transitions start from the
  // last committed style, so no rAF deferral is needed — and this keeps the
  // pill slide independent of frame timing (one frame faster, too).
  useLayoutEffect(() => {
    updateActiveRect(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    // resize + late font-swap re-measure only — active/hovered changes are handled
    // by the layout effect above and the direct hover handlers (no duplicate work)
    const onResize = () => {
      updateActiveRect(activeRef.current);
      if (hoveredRef.current) updateHoverRect(hoveredRef.current);
    };
    window.addEventListener('resize', onResize);
    const t = setTimeout(onResize, 50);
    // Re-measure once webfonts finish loading — pill width depends on text metrics
    if (document.fonts?.ready) document.fonts.ready.then(() => updateActiveRect(activeRef.current));
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 72;
    const start = window.scrollY;
    const distance = y - start;
    const duration = 550;
    let startTime = null;
    programmaticScroll.current += 1;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      window.scrollTo(0, start + distance * ease);
      if (p < 1) requestAnimationFrame(step);
      else programmaticScroll.current -= 1;
    };
    requestAnimationFrame(step);
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${scrolled
          ? 'bg-[#09090b]/80 backdrop-blur-xl border-[#232326]'
          : 'bg-transparent border-transparent'
        }`}
    >
      <div className="max-w-[1160px] mx-auto px-6 h-[64px] flex items-center justify-between gap-6">
        {/* Left: wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('#hero');
          }}
          className="flex items-center gap-3 shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-mono font-bold text-[13px] tracking-tighter">
            &lt;/&gt;
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-mono font-semibold text-[13px] tracking-tight text-white group-hover:text-zinc-200 transition-colors">
              jshmlnd.dev
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-500">
              Full-stack Dev
            </span>
          </div>
          <span className="sm:hidden font-mono font-semibold text-[13px] text-white">jshmlnd</span>
        </a>

        {/* Center nav - desktop */}
        <nav
          ref={navRef}
          onMouseLeave={() => setHovered(null)}
          className="hidden md:flex relative items-center gap-1 p-1 rounded-full bg-[#18181b] border border-[#27272a]"
          aria-label="Primary"
        >
          {/* Active slide indicator — springy, compositor-driven (transform, not left/width) */}
          <div
            aria-hidden
            className={`nav-pill ${activeRect.width ? 'nav-pill-ready' : ''} absolute top-1 bottom-1 left-0 bg-white rounded-full shadow-sm pointer-events-none will-change-transform`}
            style={{
              transform: `translateX(${activeRect.left}px)`,
              width: activeRect.width,
              opacity: activeRect.width ? 1 : 0,
            }}
          />

          {/* Hover slide indicator — softer & lighter */}
          <div
            aria-hidden
            className="nav-pill-hover absolute top-1 bottom-1 left-0 bg-white/[0.06] rounded-full pointer-events-none will-change-transform"
            style={{
              transform: `translateX(${hoverRect.left}px)`,
              width: hoverRect.width,
              opacity: hovered && hovered !== active ? 1 : 0,
            }}
          />

          {navItems.map(({ label, href, id }) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                ref={(el) => {
                  if (el) itemRefs.current[id] = el;
                }}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={() => {
                  setHovered(id);
                  updateHoverRect(id);
                }}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => {
                  setHovered(id);
                  updateHoverRect(id);
                }}
                onBlur={() => setHovered(null)}
                onClick={(e) => {
                  e.preventDefault();
                  // Clear hover during the active slide so the white pill is unobstructed
                  // — fixes: click while still hovering didn't appear to animate
                  const wasHoveringTarget = hovered === id;
                  if (wasHoveringTarget) setHovered(null);
                  setActive(id); // layout effect + CSS transition handle the slide
                  scrollTo(href);
                  // restore hover if pointer is still over the target after slide
                  if (wasHoveringTarget) {
                    setTimeout(() => {
                      const el = itemRefs.current[id];
                      if (el && el.matches(':hover')) {
                        setHovered(id);
                        updateHoverRect(id);
                      }
                    }, 460);
                  }
                }}
                className={`relative z-10 px-4 py-1.5 rounded-full text-[13px] font-medium select-none active:scale-[0.97] transition-colors duration-200 ${isActive ? 'text-black' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                <span className="relative inline-flex items-center">
                  {label}
                </span>
              </a>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 pl-3 pr-1 py-1 rounded-full bg-[#18181b] border border-[#27272a]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] tracking-wide text-zinc-400 pr-2">
              Available for Internships
            </span>
            <a
              href="https://github.com/jshmlnd"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d={siGithub.path} />
              </svg>
            </a>
          </div>
          <a
            href="https://www.linkedin.com/in/jshmlnd/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hire me on LinkedIn"
            className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white text-[13px] hover:bg-zinc-200 transition-colors"
          >
            <span className="text-black font-medium">Hire Me</span> <FontAwesomeIcon icon={faSquareLinkedin} size="lg" style={{color: "rgb(30,144,255)",}} />
          </a>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Menu"
          >
            <span className="space-y-1">
              <span className={`block w-4 h-0.5 bg-current transition-transform ${mobileOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
              <span className={`block w-4 h-0.5 bg-current transition-opacity ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-4 h-0.5 bg-current transition-transform ${mobileOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#232326] bg-[#0f0f10]/95 backdrop-blur-xl animate-slide-down">
          <div className="px-6 py-4 flex flex-col gap-2">
            {navItems.map(({ label, href, id }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(href);
                }}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${active === id
                    ? 'bg-white text-black border-white'
                    : 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:border-[#3f3f46] hover:text-white'
                  }`}
              >
                {label}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Available for internships — 2027
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
