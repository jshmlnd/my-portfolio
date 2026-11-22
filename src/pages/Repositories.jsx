import { useState } from 'react';
import { ArrowUpRight, ImageIcon } from 'lucide-react';
import {
  SiReact,
  SiTailwindcss,
  SiDaisyui,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiSocketdotio,
  SiVite,
  SiTypescript,
  SiElectron,
  SiCapacitor,
  SiSupabase,
  SiCloudflare,
  SiFramer,
} from 'react-icons/si';
import { useReveal } from '../hooks/useReveal';

const TECH = {
  react: [SiReact, 'React'],
  ts: [SiTypescript, 'TypeScript'],
  vite: [SiVite, 'Vite'],
  tailwind: [SiTailwindcss, 'Tailwind'],
  daisy: [SiDaisyui, 'DaisyUI'],
  motion: [SiFramer, 'Motion'],
  hls: [null, 'HLS.js'],
  node: [SiNodedotjs, 'Node.js'],
  express: [SiExpress, 'Express'],
  mongo: [SiMongodb, 'MongoDB'],
  socket: [SiSocketdotio, 'Socket.IO'],
  cloudflare: [SiCloudflare, 'Cloudflare'],
  electron: [SiElectron, 'Electron'],
  capacitor: [SiCapacitor, 'Capacitor'],
  supabase: [SiSupabase, 'Supabase'],
};

// Screenshots live in public/projects/. Drop a file there and set `image` to show it.
const PROJECTS = {
  institutional: [
    {
      name: 'SafeSpace',
      description: 'Anonymous mental health support for UST Legazpi students: chat or book a counselor.',
      href: 'https://ust-legazpi-mhss-bn96.onrender.com/',
      image: '/projects/safespace.png',
      stack: ['react', 'tailwind', 'node', 'express', 'mongo', 'socket'],
    },
  ],
  personal: [
    {
      name: 'MeiDrama',
      description: 'K-drama streaming with curated picks, genres and a personal list.',
      href: 'http://meidrama.steffijimei.me',
      image: '/projects/meidrama.png',
      stack: ['react', 'vite', 'tailwind', 'hls'],
    },
    {
      name: 'Animei',
      description: 'Anime to watch and manhwa to read in one place, no account needed.',
      href: 'https://animei.steffijimei.me/',
      image: '/projects/animei.png',
      stack: ['react', 'vite', 'tailwind', 'daisy', 'hls', 'cloudflare'],
    },
    {
      name: 'ID Photo Studio',
      description: 'Print-ready 1×1 and 2×2 inch ID photos, made on your device.',
      href: 'https://id-studio.zjkm.tech',
      image: '/projects/idstudio.png',
      stack: ['react', 'ts', 'vite', 'tailwind', 'motion'],
    },
    {
      name: 'zjkm-ui',
      description: 'Animated React components, one file each, yours to edit.',
      href: 'https://ui.zjkm.tech',
      image: '/projects/zjkmui.png',
      stack: ['react', 'ts'],
    },
    {
      name: 'Calify',
      description: 'A free music player for your own files on Windows and Android, with synced lyrics.',
      href: 'https://calify.zjkm.tech',
      image: '/projects/calify.png',
      stack: ['react', 'electron', 'capacitor', 'supabase'],
    },
    {
      name: 'Meiverse',
      description: 'A 3D isometric slice-of-life game with a social hub and minigames.',
      comingSoon: true,
    },
  ],
};

const TABS = [
  ['institutional', 'Institutional'],
  ['personal', 'Personal'],
];

const hatch = 'bg-[repeating-linear-gradient(135deg,#18181b_0_1px,transparent_1px_14px)]';

const ProjectCard = ({ name, description, href, image, stack = [], comingSoon }) => {
  const Tag = href ? 'a' : 'div';
  return (
    <Tag
      {...(href && { href, target: '_blank', rel: 'noopener noreferrer' })}
      className="group flex flex-col bg-[#0f0f10] hover:bg-[#141416] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[#232326]">
        {image ? (
          <img
            src={image}
            alt={`${name} home screen`}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400 ${hatch}`}>
            <ImageIcon size={22} strokeWidth={1.5} />
            <span className="text-[13px]">{comingSoon ? 'Coming soon' : 'Preview soon'}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-5 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold tracking-tight text-white">{name}</h3>
          {href && (
            <ArrowUpRight
              size={16}
              className="shrink-0 mt-0.5 text-zinc-500 transition-transform group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          )}
        </div>
        <p className="text-[14px] leading-6 text-zinc-400">{description}</p>
        {stack.length > 0 && (
          <ul className="mt-auto pt-3 flex flex-wrap gap-1.5" aria-label={`${name} tech stack`}>
            {stack.map((key) => {
              const [Icon, label] = TECH[key];
              return (
                <li
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#18181b] border border-[#27272a] font-mono text-[11px] text-zinc-400"
                >
                  {Icon && <Icon size={11} className="text-zinc-500" aria-hidden="true" />}
                  {label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Tag>
  );
};

// Hatched cells that close the last grid row so it never shows a bare gap.
const Fillers = ({ count, cols, className }) =>
  Array.from({ length: (cols - (count % cols)) % cols }, (_, i) => (
    <div key={`${cols}-${i}`} aria-hidden="true" className={`bg-[#0f0f10] ${hatch} ${className}`} />
  ));

const Repositories = () => {
  const [tab, setTab] = useState('personal');
  const revealRef = useReveal();
  const items = PROJECTS[tab];

  return (
    <section id="projects" className="bg-[#09090b] border-t border-[#1f1f23] px-6 py-16 lg:py-20">
      <div className="max-w-[1160px] mx-auto flex flex-col gap-10 reveal" ref={revealRef}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <p className="mono-label">03 — Projects</p>
          <h2 className="text-[32px] sm:text-[40px] font-black tracking-[-0.03em] leading-none text-white">Shipped <span className="text-zinc-500">work</span></h2>
          <p className="max-w-[560px] text-[14px] leading-6 text-zinc-400">Apps, games and websites built by jshmlnd.</p>
        </div>

        <div role="tablist" aria-label="Project type" className="self-start lg:self-auto inline-flex p-1 rounded-full bg-[#141416] border border-[#27272a]">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors ${
                tab === key ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        </div>

        <div
          role="tabpanel"
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#27272a] border border-[#27272a] rounded-2xl overflow-hidden"
        >
          {items.map((p) => (
            <ProjectCard key={p.name} {...p} />
          ))}
          <Fillers count={items.length} cols={2} className="hidden sm:block lg:hidden" />
          <Fillers count={items.length} cols={3} className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
};

export default Repositories;
