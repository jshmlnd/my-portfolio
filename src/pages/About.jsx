import { ArrowUpRight, Code2, Database, MapPin, Rocket } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const strengths = [
  {
    icon: Code2,
    title: 'Product interfaces',
    text: 'React, TypeScript, and thoughtful UI systems that stay usable beyond the demo.',
  },
  {
    icon: Database,
    title: 'Full-stack foundations',
    text: 'APIs, databases, authentication, and the practical wiring behind a reliable product.',
  },
  {
    icon: Rocket,
    title: 'Ship and improve',
    text: 'I care about clean handoffs, deployable work, and learning from what users actually need.',
  },
];

const timeline = [
  { label: 'Education', title: 'BS Computer Science', detail: 'University of Santo Tomas - Legazpi' },
  { label: 'Building now', title: 'Full-stack projects', detail: 'React interfaces, APIs, databases, and deployment workflows' },
  { label: 'Looking next', title: '2027 internship', detail: 'A team where I can contribute to a real product and keep growing' },
];

const About = () => {
  const revealRef = useReveal();

  return (
    <section id="about" className="bg-[#09090b] border-t border-[#1f1f23] px-6 py-16 lg:py-20">
      <div className="max-w-[1160px] mx-auto flex flex-col gap-8 reveal" ref={revealRef}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="mono-label">02 — About</p>
            <h2 className="text-[32px] sm:text-[40px] font-black tracking-[-0.03em] leading-none text-white">
              Build with <span className="text-zinc-500">intent.</span>
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#0f0f10] px-3 py-1.5 font-mono text-[11px] tracking-wide text-zinc-500 self-start lg:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Open to 2027 internships
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
          <div className="rounded-2xl border border-[#27272a] bg-[#0f0f10] p-6 sm:p-8 space-y-5">
            <p className="text-[15px] leading-7 text-zinc-300">
              I&apos;m Joshua, a Computer Science student at the University of Santo Tomas - Legazpi. I build web
              products that connect a clear interface to dependable backend systems, from the first sketch through
              deployment.
            </p>
            <p className="text-[14px] leading-6 text-zinc-500">
              I&apos;m looking for an internship or junior full-stack role where I can contribute to a real product,
              learn from experienced engineers, and take ownership of meaningful pieces of the work.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#141416] px-3 py-1.5 font-mono text-[11px] text-zinc-400">
                <MapPin size={12} className="text-indigo-400" /> Legazpi City, PH
              </span>
              <a
                href="mailto:joshua.malonda11@gmail.com"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#141416] px-3 py-1.5 font-mono text-[11px] text-zinc-400 hover:border-[#3f3f46] hover:text-white transition-colors"
              >
                Let&apos;s talk <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          <div className="grid gap-3">
            {strengths.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-[#27272a] bg-[#0f0f10] p-4">
                <div className="w-9 h-9 rounded-xl border border-[#27272a] bg-[#18181b] flex items-center justify-center text-zinc-300 shrink-0">
                  <Icon size={17} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="text-xs leading-5 text-zinc-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-[#0f0f10] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-600">A short timeline</p>
            <span className="font-mono text-[10px] text-zinc-600">where I am → where I&apos;m going</span>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {timeline.map(({ label, title, detail }, index) => (
              <div key={label} className="relative rounded-xl border border-[#232326] bg-[#141416] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center font-mono text-[10px] text-emerald-400">
                    0{index + 1}
                  </span>
                  <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-600">{label}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
