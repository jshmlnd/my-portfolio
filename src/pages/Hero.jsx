import { useState, useEffect } from 'react';
import {
  siJavascript,
  siTypescript,
  siReact,
  siNextdotjs,
  siLua,
  siOpenjdk,
  siPython,
  siMongodb,
} from 'simple-icons';
import cv from '../assets/cv/Joshua_Klein_Malonda_Resume.pdf';
import { Download, MoveRight } from 'lucide-react';

const terminalTitle = 'jshmlnd — zsh — 80×24';

const personalDetails = ['Joshua Klein A. Malonda', 'BS Computer Science · Legazpi City, PH', 'University of Santo Tomas — Legazpi'];

const techStack = [
  { name: 'JavaScript', icon: siJavascript },
  { name: 'TypeScript', icon: siTypescript },
  { name: 'React', icon: siReact },
  { name: 'Next.js', icon: siNextdotjs },
  { name: 'Lua', icon: siLua },
  { name: 'Java', icon: siOpenjdk },
  { name: 'Python', icon: siPython },
  { name: 'MongoDB', icon: siMongodb },
];

const commands = [
  { cmd: 'whoami', delay: 0 },
  { cmd: 'cat techstack.txt', delay: 1200 },
  { cmd: 'echo $STATUS', delay: 2400 },
];

const Hero = () => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [typedCmd, setTypedCmd] = useState('');
  const [cmdIndex, setCmdIndex] = useState(0);

  useEffect(() => {
    if (cmdIndex >= commands.length) return;
    const { cmd, delay } = commands[cmdIndex];
    let charIndex = 0;
    let timeoutId;
    const typeNext = () => {
      if (charIndex <= cmd.length) {
        setTypedCmd(cmd.slice(0, charIndex));
        charIndex++;
        timeoutId = setTimeout(typeNext, 45 + Math.random() * 30);
      } else {
        timeoutId = setTimeout(() => {
          setVisibleLines((p) => p + 1);
          setTypedCmd('');
          setCmdIndex((p) => p + 1);
        }, 420);
      }
    };
    timeoutId = setTimeout(typeNext, cmdIndex === 0 ? 700 : delay);
    return () => clearTimeout(timeoutId);
  }, [cmdIndex]);

  return (
    <section id="hero" className="relative overflow-hidden border-b border-[#232326] bg-[#09090b]">
      {/* subtle grid + fade */}
      <div className="absolute inset-0 bg-grid opacity-[0.35] bg-grid-fade pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_50%_-10%,rgba(250,250,250,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_400px_at_80%_40%,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-[1160px] mx-auto px-6 pt-10 pb-16 lg:pt-14 lg:pb-20">
        {/* top meta bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#18181b] px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] tracking-wide text-zinc-300">&#60;jshmlnd /&#62;</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-zinc-500">
            <span className="w-px h-3 bg-[#27272a]" />
            Legazpi City, PH 
          </span>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-start">
          {/* Left */}
          <div className="flex flex-col gap-6">
            <div className="space-y-4 animate-fade-in-up delay-100">
              <p className="mono-label !text-zinc-500">Full-stack Developer</p>
              <h1 className="font-black tracking-[-0.04em] leading-[0.88] text-[42px] sm:text-[56px] lg:text-[64px]">
                <span className="block text-white">Joshua Klein</span>
                <span className="block text-zinc-500">Malonda</span>
              </h1>
              <p className="mono-label !normal-case !tracking-normal !text-[13px] !text-zinc-500 font-mono">
                &#60;jshmlnd /&#62; — Building solutions for the love of the game.
              </p>
            </div>

            <p className="max-w-[560px] text-[15px] leading-7 text-zinc-400 animate-fade-in-up delay-200">
              I design and ship full-stack web products — from polished React interfaces and design systems to
              resilient Node.js APIs, data models, and deployment pipelines. I care about clean architecture, and code that lasts.
            </p>

            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('projects');
                  if (!el) return;
                  const navOffset = 72;
                  const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
                  const start = window.scrollY;
                  const distance = top - start;
                  const duration = 650;
                  let startTime = null;
                  const step = (ts) => {
                    if (startTime === null) startTime = ts;
                    const progress = Math.min((ts - startTime) / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    window.scrollTo(0, start + distance * ease);
                    if (progress < 1) requestAnimationFrame(step);
                    else history.replaceState(null, '', '#projects');
                  };
                  requestAnimationFrame(step);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors"
              >
                View selected work
                <span className="text-zinc-500"><MoveRight size={14} strokeWidth={3} /></span>
              </a>
              <a
                href={cv}
                download="Joshua_Klein_Malonda_Resume.pdf"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#27272a] bg-[#18181b] text-sm font-medium text-zinc-200 hover:bg-[#232326] hover:border-[#3f3f46] transition-colors"
              >
                Download CV
                <span className="font-mono text-xs text-zinc-500"><Download size="14px" strokeWidth="3px" /></span>
              </a>
              <a
                href="https://github.com/jshmlnd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-3 rounded-full border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-colors"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 0a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 0Z" />
                </svg>
              </a>
            </div>

            {/* Capability bar */}
            <div className="grid grid-cols-3 gap-3 pt-2 animate-fade-in-up delay-400">
              {[
                { k: '05+', v: 'Products shipped', sub: 'Full-stack' },
                { k: '8', v: 'Core technologies', sub: 'JS · TS · React' },
                { k: '100%', v: 'End-to-end ownership', sub: 'Design → Deploy' },
              ].map(({ k, v, sub }) => (
                <div key={k} className="rounded-2xl border border-[#27272a] bg-[#141416] p-4">
                  <div className="font-mono text-lg font-semibold tracking-tight text-white">{k}</div>
                  <div className="text-xs font-medium text-zinc-300 leading-tight mt-0.5">{v}</div>
                  <div className="font-mono text-[10px] tracking-wide uppercase text-zinc-500 mt-1">{sub}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1 animate-fade-in delay-500">
              {['Frontend', 'Backend', 'Database', 'Infra & Deploy'].map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#27272a] bg-[#0f0f10] font-mono text-[11px] tracking-wide text-zinc-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Terminal - retained & elevated */}
          <div className="relative lg:sticky lg:top-[88px] animate-fade-in-up delay-200">
            <div className="rounded-[20px] border border-[#27272a] bg-[#0f0f10] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)_inset]">
              {/* window chrome */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#232326] bg-[#141416]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/10" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black/10" />
                </div>
                <span className="font-mono text-[11px] tracking-wide text-zinc-500">{terminalTitle}</span>
                <span className="w-12 hidden sm:block" />
                {/* spacer for balance */}
              </div>

              {/* terminal body */}
              <div className="p-5 sm:p-6 font-mono text-[13px] leading-6">
                <div className="flex items-center gap-2 mb-4 text-[11px] font-mono tracking-widest uppercase text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  jshmlnd@portfolio — zsh
                  <span className="ml-auto hidden sm:inline text-zinc-600">UTF-8 · 80×24</span>
                </div>

                {/* whoami */}
                {visibleLines >= 1 && (
                  <div className="animate-fade-in">
                    <p className="flex gap-2">
                      <span className="text-zinc-500 shrink-0">❯</span>
                      <span className="text-zinc-200">whoami</span>
                    </p>
                    <div className="mt-2 pl-4 border-l border-[#232326] ml-1 space-y-1">
                      <p className="text-white font-medium">{personalDetails[0]}</p>
                      <p className="text-zinc-500 text-[12px]">{personalDetails[1]}</p>
                      <p className="text-zinc-500 text-[12px]">{personalDetails[2]}</p>
                    </div>
                  </div>
                )}

                {/* techstack */}
                {visibleLines >= 2 && (
                  <div className="mt-5 animate-fade-in">
                    <p className="flex gap-2">
                      <span className="text-zinc-500 shrink-0">❯</span>
                      <span className="text-zinc-200">cat techstack.txt</span>
                    </p>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {techStack.map(({ name, icon }) => (
                        <div
                          key={name}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-[#232326] bg-[#141416] hover:bg-[#1a1a1e] hover:border-[#2e2e32] transition-colors group"
                        >
                          <svg
                            role="img"
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="currentColor"
                            className="text-zinc-400 group-hover:text-white transition-colors shrink-0"
                          >
                            <path d={icon.path} />
                          </svg>
                          <span className="text-[12px] font-medium text-zinc-300 group-hover:text-white truncate">
                            {name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* status */}
                {visibleLines >= 3 && (
                  <div className="mt-5 animate-fade-in">
                    <p className="flex gap-2">
                      <span className="text-zinc-500 shrink-0">❯</span>
                      <span className="text-zinc-200">echo $STATUS</span>
                    </p>
                    <div className="mt-2 pl-4 border-l border-emerald-500/20 ml-1">
                      <p className="inline-flex items-center gap-2 text-emerald-400 text-[12px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Open to internships — 2027 · Full-stack roles
                      </p>
                    </div>
                  </div>
                )}

                {/* typing / idle */}
                <div className="mt-5 flex gap-2 items-center text-zinc-500">
                  <span className="shrink-0">❯</span>
                  {visibleLines < commands.length ? (
                    <>
                      <span className="text-zinc-200">{typedCmd}</span>
                      <span className="w-2 h-4 bg-white animate-blink ml-0.5" />
                    </>
                  ) : (
                    <span className="w-2 h-4 bg-white animate-blink" />
                  )}
                </div>

                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-[#1f1f23] font-mono text-[11px] text-zinc-600">
                  <span>⌘</span>
                  <span>Press</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1e] border border-[#27272a] text-zinc-400 text-[10px]">↵</kbd>
                  <span>to run</span>
                  <span className="ml-auto hidden sm:inline">No secrets here — just clean commits.</span>
                </div>
              </div>
            </div>

            {/* subtle under-glow */}
            <div className="absolute -inset-6 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_70%)] blur-xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
