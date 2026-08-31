import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GitCommitHorizontal, FolderGit, Copy, Check, ExternalLink, Globe, Layers, Server, RefreshCw, Lock, Monitor } from 'lucide-react';
import {
  SiReact,
  SiTailwindcss,
  SiDaisyui,
  SiNodedotjs,
  SiMongodb,
  SiExpress,
  SiSocketdotio,
  SiAxios,
  SiVercel,
  SiAnilist,
  SiFramer,
  SiCloudinary,
  SiReactrouter,
  SiCloudflare,
} from 'react-icons/si';
import { Box, Play } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const projects = {
  counseling: {
    name: 'University Mental Health Support System',
    role: 'Full Stack Developer',
    url: 'https://ust-legazpi-mhss.onrender.com',
    year: '2024',
    highlight: 'Real-time counseling & academic guidance',
    frontend: [
      { icon: <SiReact size="16" />, label: 'React' },
      { icon: <SiTailwindcss size="16" />, label: 'Tailwind' },
      { icon: <SiDaisyui size="16" />, label: 'DaisyUI' },
    ],
    backend: [
      { icon: <SiNodedotjs size="16" />, label: 'Node.js' },
      { icon: <SiMongodb size="16" />, label: 'MongoDB' },
      { icon: <SiExpress size="16" />, label: 'Express' },
      { icon: <SiSocketdotio size="16" />, label: 'Socket.io' },
    ],
    description:
      'Web application for university counseling and academic guidance. Real-time messaging with Socket.io, role-based access, and a clean, accessible UI. Backend on Node/Express/MongoDB, frontend on React + Tailwind.',
  },
  portfolio: {
    name: 'Personal Portfolio Website',
    role: 'Frontend Developer',
    url: 'https://my-portfolio-tau-six-64.vercel.app/',
    year: '2024',
    highlight: 'Design-forward personal site',
    frontend: [
      { icon: <SiReact size="16" />, label: 'React' },
      { icon: <SiTailwindcss size="16" />, label: 'Tailwind' },
      { icon: <SiDaisyui size="16" />, label: 'DaisyUI' },
    ],
    backend: '',
    description: 'Personal portfolio with deliberate typography, motion, and a terminal-inspired interaction model. Built for speed and clarity.',
  },
  animei: {
    name: 'Animei: Free Anime Streaming Website',
    role: 'Full Stack Developer',
    url: 'https://animei-snowy.vercel.app/',
    year: '2024',
    highlight: 'Streaming UI · AniList API',
    frontend: [
      { icon: <SiReact size="16" />, label: 'React' },
      { icon: <SiTailwindcss size="16" />, label: 'Tailwind' },
      { icon: <SiDaisyui size="16" />, label: 'DaisyUI' },
      { icon: <SiAnilist size="16" />, label: 'AniList API' },
    ],
    backend: [
      { icon: <SiAxios size="16" />, label: 'Axios' },
      { icon: <SiVercel size="16" />, label: 'Vercel Functions' },
    ],
    description: 'Free anime streaming experience with modern UI and fast content discovery. Integrated with AniList API and Vercel serverless functions.',
  },
  smors: {
    name: 'SMORS Collection',
    role: 'Full Stack Developer',
    url: 'https://smors-collection.joshuaklein-malonda.workers.dev/',
    year: '2025',
    highlight: 'E-commerce · Admin back office',
    frontend: [
      { icon: <SiReact size="16" />, label: 'React' },
      { icon: <SiTailwindcss size="16" />, label: 'Tailwind' },
      { icon: <SiDaisyui size="16" />, label: 'DaisyUI' },
      { icon: <Box size="16" />, label: 'Zustand' },
      { icon: <SiFramer size="16" />, label: 'Framer Motion' },
      { icon: <SiReactrouter size="16" />, label: 'React Router' },
    ],
    backend: [
      { icon: <SiNodedotjs size="16" />, label: 'Node.js' },
      { icon: <SiExpress size="16" />, label: 'Express' },
      { icon: <SiMongodb size="16" />, label: 'MongoDB' },
      { icon: <SiCloudinary size="16" />, label: 'Cloudinary' },
    ],
    description:
      'Thrifted fashion storefront with full admin suite: product management, manual GCash/BDO/BPI verification, J&T order tracking, and restoration/customs intake. Cloudflare Workers + Render.',
  },
  meishortsai: {
    name: 'MeiShortsAI',
    role: 'Full Stack Developer',
    url: 'https://mei-shorts-ai.vercel.app/',
    year: '2025',
    highlight: 'Netflix-style streaming · HLS',
    frontend: [
      { icon: <SiReact size="16" />, label: 'React' },
      { icon: <SiTailwindcss size="16" />, label: 'Tailwind' },
      { icon: <SiDaisyui size="16" />, label: 'DaisyUI' },
      { icon: <Box size="16" />, label: 'Zustand' },
      { icon: <SiFramer size="16" />, label: 'Framer Motion' },
      { icon: <Play size="16" />, label: 'hls.js' },
    ],
    backend: [
      { icon: <SiAxios size="16" />, label: 'Axios' },
      { icon: <SiCloudflare size="16" />, label: 'Cloudflare Workers API' },
    ],
    description:
      'Cinematic short-drama streaming for VibeShort. Ken Burns hero, genre-aware search, custom HLS player with PiP, My List & continue watching, and autoplay-next for binge sessions.',
  },
};

const README_URL = 'https://raw.githubusercontent.com/jshmlnd/.github/main/profile/README.md';

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse p-4">
    <div className="h-5 bg-[#232326] rounded w-3/4" />
    <div className="h-3 bg-[#232326] rounded w-1/4" />
    <div className="flex gap-3 mt-2">
      <div className="h-3 bg-[#232326] rounded w-1/3" />
      <div className="h-3 bg-[#232326] rounded w-1/4" />
    </div>
    <div className="h-3 bg-[#232326] rounded w-full mt-2" />
    <div className="h-3 bg-[#232326] rounded w-5/6" />
  </div>
);

const MainContent = () => {
  const [selected, setSelected] = useState('smors');
  const [readmeContent, setReadmeContent] = useState('');
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [frameLoading, setFrameLoading] = useState(true);
  const [frameError, setFrameError] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const revealRef = useReveal();

  const handleCopy = () => {
    const text = activeProject?.url || activeProject?.name || '';
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeProject = selected ? projects[selected] : null;

  useEffect(() => {
    if (selected === 'readme' && !readmeContent) {
      setReadmeLoading(true);
      fetch(README_URL)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.text();
        })
        .then((md) => setReadmeContent(md))
        .catch(() => setReadmeContent('# Error\nFailed to load README.md'))
        .finally(() => setReadmeLoading(false));
    }
  }, [selected, readmeContent]);

  // Reset iframe state when switching projects
  useEffect(() => {
    setFrameLoading(true);
    setFrameError(false);
    // auto-detect blocked iframe after 6s (X-Frame-Options)
    const t = setTimeout(() => {
      // if still loading, assume blocked and show fallback
      setFrameLoading((prev) => {
        if (prev) setFrameError(true);
        return false;
      });
    }, 6000);
    return () => clearTimeout(t);
  }, [selected, frameKey]);

  const handleRefresh = () => {
    setFrameLoading(true);
    setFrameError(false);
    setFrameKey((k) => k + 1);
  };

  const sidebarItems = [
    { key: 'counseling', label: 'ust-legazpi-mhss', repo: 'jshmlnd/ust-legazpi-mhss' },
    { key: 'portfolio', label: 'my-portfolio', repo: 'jshmlnd/my-portfolio' },
    { key: 'animei', label: 'ani-mei', repo: 'jshmlnd/ani-mei' },
    { key: 'smors', label: 'smors-saas', repo: 'jshmlnd/smors-saas' },
    { key: 'meishortsai', label: 'MeiShortsAI', repo: 'jshmlnd/MeiShortsAI' },
  ];

  return (
    <section id="projects" className="bg-[#09090b] border-t border-[#1f1f23] px-6 py-16 lg:py-20">
      <div className="max-w-[1160px] mx-auto flex flex-col gap-10 reveal" ref={revealRef}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="mono-label">02 — Selected Work</p>
            <h2 className="text-[32px] sm:text-[40px] font-black tracking-[-0.03em] leading-none text-white">
              Products shipped <span className="text-zinc-500">end-to-end.</span>
            </h2>
            <p className="max-w-[560px] text-[14px] leading-6 text-zinc-400">
              A snapshot of full-stack work — frontend craft, API design, data modeling, and deployment. Select a
              repository to inspect the stack and preview the live site.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] tracking-wide text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-white/60" />
            5 repositories · Live previews
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Sidebar - Repositories (retained) */}
          <aside className="rounded-2xl border border-[#27272a] bg-[#0f0f10] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#232326] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit size={14} className="text-zinc-500" />
                <span className="font-mono text-[11px] tracking-widest uppercase font-semibold text-zinc-300">
                  Repositories
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1e] border border-[#27272a] text-zinc-500">
                  {sidebarItems.length}
                </span>
              </div>
              <GitCommitHorizontal size={14} className="text-zinc-600" />
            </div>

            <div className="p-2">
              <div className="px-2 py-2">
                <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-600">jshmlnd</p>
              </div>
              <ul className="space-y-1">
                {sidebarItems.map(({ key, repo }) => {
                  const isActive = selected === key;
                  const p = projects[key];
                  return (
                    <li key={key}>
                      <button
                        onClick={() => setSelected(key)}
                        className={`w-full text-left group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                          isActive
                            ? 'bg-white text-black border-white shadow-sm'
                            : 'bg-[#141416] border-transparent hover:bg-[#1a1a1e] hover:border-[#27272a] text-zinc-300'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            isActive ? 'bg-black text-white border-black' : 'bg-[#0f0f10] border-[#27272a] text-zinc-500 group-hover:text-zinc-300'
                          }`}
                        >
                          <FolderGit size={14} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className={`block font-mono text-[12px] font-medium truncate ${isActive ? 'text-black' : 'text-zinc-200'}`}>
                            {repo}
                          </span>
                          <span className={`block text-[11px] truncate ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>
                            {p.highlight} · {p.year}
                          </span>
                        </span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 p-3 rounded-xl bg-[#141416] border border-[#232326]">
                <p className="font-mono text-[11px] tracking-wide text-zinc-400">Terminal hint</p>
                <p className="font-mono text-[11px] text-zinc-500 mt-1">
                  <span className="text-zinc-300">$</span> select --repo to preview →
                </p>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Project meta card */}
            {activeProject && (
              <div className="rounded-2xl border border-[#27272a] bg-[#0f0f10] p-5 sm:p-6 animate-fade-in">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-white">{activeProject.name}</h3>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] font-mono text-[11px] tracking-wide text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {activeProject.role}
                      </span>
                    </div>
                    <p className="text-[13px] leading-6 text-zinc-400 max-w-[720px]">{activeProject.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={activeProject.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-colors"
                    >
                      <Globe size={14} />
                      Live site
                      <ExternalLink size={12} className="text-zinc-500" />
                    </a>
                  </div>
                </div>

                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  {activeProject.frontend && (
                    <div className="rounded-xl border border-[#232326] bg-[#141416] p-3.5">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Layers size={12} className="text-zinc-500" />
                        <span className="font-mono text-[11px] tracking-widest uppercase text-zinc-500">Frontend</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeProject.frontend.map(({ icon, label }) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#0f0f10] border border-[#27272a] text-zinc-300 text-xs font-medium"
                          >
                            <span className="text-zinc-500">{icon}</span>
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeProject.backend ? (
                    <div className="rounded-xl border border-[#232326] bg-[#141416] p-3.5">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Server size={12} className="text-zinc-500" />
                        <span className="font-mono text-[11px] tracking-widest uppercase text-zinc-500">Backend / Infra</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeProject.backend.map(({ icon, label }) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#0f0f10] border border-[#27272a] text-zinc-300 text-xs font-medium"
                          >
                            <span className="text-zinc-500">{icon}</span>
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#27272a] bg-transparent p-3.5 flex items-center gap-2 text-zinc-500">
                      <Server size={12} />
                      <span className="font-mono text-xs">Frontend-only deployment</span>
                    </div>
                  )}
                </div>
                </div>
              )}

            {/* Mockup Web Window — live repository preview — responsive across viewports */}
            <div className="rounded-[20px] border border-[#27272a] bg-[#0f0f10] overflow-hidden flex flex-col w-full shadow-[0_16px_48px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.03)_inset]">
              {/* Window chrome — tabs + controls */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#232326] bg-[#141416] shrink-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/10" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black/10" />
                </div>
                {/* Tab */}
                <div className="hidden sm:flex items-center gap-2 -mb-3 self-stretch">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-[#0f0f10] border border-[#27272a] border-b-transparent text-xs font-medium text-zinc-300 max-w-[220px]">
                    <Monitor size={12} className="text-zinc-500 shrink-0" />
                    <span className="truncate">{activeProject ? activeProject.name : 'Preview'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <div className="w-px h-4 bg-[#27272a] ml-1" />
                </div>
                <div className="ml-auto hidden lg:flex items-center gap-1.5 font-mono text-[10px] tracking-wide uppercase text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Web Preview
                </div>
              </div>

              {/* Address bar */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#0f0f10] border-b border-[#232326] shrink-0">
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleRefresh}
                    disabled={!activeProject}
                    className="w-7 h-7 rounded-full bg-[#141416] border border-[#27272a] flex items-center justify-center text-zinc-500 hover:text-white hover:border-[#3f3f46] disabled:opacity-40 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={12} className={frameLoading ? 'animate-spin' : ''} />
                  </button>
                  <div className="hidden sm:flex items-center gap-1 text-zinc-600">
                    <span className="w-4 h-4 rounded-full bg-[#141416] border border-[#27272a] flex items-center justify-center">‹</span>
                    <span className="w-4 h-4 rounded-full bg-[#141416] border border-[#27272a] flex items-center justify-center">›</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141416] border border-[#27272a] max-w-[560px] mx-auto">
                  <Lock size={12} className="text-emerald-500 shrink-0" />
                  <Globe size={12} className="text-zinc-600 shrink-0 hidden sm:block" />
                  <span className="font-mono text-[12px] text-zinc-300 truncate">
                    {activeProject ? activeProject.url.replace('https://', '') : 'select a repository to preview'}
                  </span>
                  <span className="ml-auto hidden sm:inline-flex items-center gap-1 font-mono text-[10px] tracking-wide uppercase text-zinc-500 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {activeProject && (
                    <>
                      <button
                        onClick={handleCopy}
                        className="w-7 h-7 rounded-full bg-[#141416] border border-[#27272a] flex items-center justify-center text-zinc-500 hover:text-white hover:border-[#3f3f46] transition-colors"
                        title="Copy URL"
                      >
                        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                      <a
                        href={activeProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-100 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Viewport — responsive height for mobile → desktop (clamp + breakpoints) */}
              <div className="relative overflow-hidden bg-[#0a0a0b] w-full shrink-0 h-[clamp(380px,50vh,520px)] sm:h-[clamp(420px,52vh,560px)] lg:h-[clamp(500px,55vh,640px)]">
                {selected === 'readme' ? (
                  readmeLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <div className="h-full overflow-y-auto">
                      <article className="markdown-body p-6">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{readmeContent}</ReactMarkdown>
                      </article>
                    </div>
                  )
                ) : activeProject && activeProject.url ? (
                  <>
                    <iframe
                      key={frameKey}
                      src={activeProject.url}
                      className="absolute inset-0 w-full h-full border-0 bg-white"
                      title={activeProject.name}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                      onLoad={() => {
                        setFrameLoading(false);
                        setFrameError(false);
                      }}
                      onError={() => {
                        setFrameLoading(false);
                        setFrameError(true);
                      }}
                    />
                    {/* Loading overlay */}
                    {frameLoading && (
                      <div className="absolute inset-0 bg-[#0a0a0b] flex flex-col items-center justify-center gap-3 p-6">
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
                        <p className="font-mono text-xs tracking-wide text-zinc-500">Loading preview…</p>
                        <p className="font-mono text-[11px] text-zinc-600 truncate max-w-[300px]">{activeProject.url}</p>
                      </div>
                    )}
                    {/* Blocked / error fallback */}
                    {frameError && !frameLoading && (
                      <div className="absolute inset-0 bg-[#0f0f10]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#141416] border border-[#27272a] flex items-center justify-center text-zinc-500">
                          <Monitor size={20} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-white">Preview can’t be embedded</p>
                          <p className="text-xs leading-5 text-zinc-500 max-w-[360px]">
                            This site blocks embedding via <span className="font-mono text-zinc-400">X-Frame-Options</span>. Open it directly for the full experience.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={activeProject.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-colors"
                          >
                            Open live site <ExternalLink size={12} />
                          </a>
                          <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#27272a] bg-[#141416] text-xs font-medium text-zinc-300 hover:border-[#3f3f46] hover:text-white transition-colors"
                          >
                            <RefreshCw size={12} /> Retry
                          </button>
                        </div>
                        <p className="font-mono text-[11px] tracking-wide text-zinc-600">
                          {activeProject.name} · {activeProject.url.replace('https://', '')}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#141416] border border-[#27272a] flex items-center justify-center text-zinc-600">
                      <FolderGit size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-sm text-zinc-300">
                        <span className="text-white">$</span> select --project to preview
                      </p>
                      <p className="text-xs text-zinc-500">Choose a repository from the explorer to launch its live web window.</p>
                    </div>
                    <div className="flex gap-2 font-mono text-[11px] text-zinc-600">
                      <span>jshmlnd@portfolio</span>
                      <span className="text-zinc-700">·</span>
                      <span>zsh</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div className="px-4 py-2.5 border-t border-[#232326] bg-[#0f0f10] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-mono text-[11px] tracking-wide text-zinc-500 truncate">
                    {activeProject ? `${activeProject.name} — ${activeProject.year} · ${activeProject.highlight}` : 'No selection'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-zinc-600 hidden sm:inline shrink-0">
                  {frameLoading ? 'Loading…' : frameError ? 'Blocked · open externally' : 'Preview · sandboxed iframe'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainContent;
