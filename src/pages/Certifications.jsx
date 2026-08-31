import { Code2, ArrowUpRight, BadgeCheck, Award } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const certifications = [
  {
    name: 'Web Development Fundamentals',
    issuer: 'IBM SkillsBuild · Credly',
    year: '2026',
    url: 'https://www.credly.com/badges/bf0361c4-31fa-4687-9be5-36e32f40936a',
    icon: Code2,
    status: 'Verified',
  },
];

const iconColorMap = {
  Code2: 'text-zinc-300',
  BadgeCheck: 'text-emerald-500',
  Award: 'text-zinc-300',
};

const Certifications = () => {
  const revealRef = useReveal();

  return (
    <section id="certs" className="bg-[#09090b] border-t border-[#1f1f23] px-6 py-16 lg:py-20">
      <div className="max-w-[1160px] mx-auto flex flex-col gap-8 reveal" ref={revealRef}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="mono-label">04 — Credentials</p>
            <h2 className="text-[32px] sm:text-[40px] font-black tracking-[-0.03em] leading-none text-white">
              Certifications <span className="text-zinc-500">& learning.</span>
            </h2>
            <p className="max-w-[560px] text-[14px] leading-6 text-zinc-400">
              Formal recognition and continuous upskilling — verified on Credly. More in progress as I round out the
              full-stack foundation.
            </p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#0f0f10] px-3 py-1.5 font-mono text-[11px] tracking-wide text-zinc-500">
            <BadgeCheck size={14} className="text-emerald-500" />
            Verified · Credly
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map(({ name, issuer, year, url, icon: Icon, status }, i) => {
            const iconName = Icon?.displayName || Icon?.name || '';
            const colorClass = iconColorMap[iconName] || 'text-zinc-300';
            const Tag = url ? 'a' : 'div';
            const linkProps = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {};

            return (
              <Tag
                key={name}
                {...linkProps}
                className="group relative flex flex-col gap-4 rounded-2xl border border-[#27272a] bg-[#0f0f10] p-5 hover:bg-[#141416] hover:border-[#3f3f46] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)] animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0 ${colorClass} group-hover:border-[#3f3f46] transition-colors`}>
                    <Icon size={18} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] tracking-widest uppercase font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[14px] font-semibold leading-tight text-white group-hover:text-zinc-100 transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs text-zinc-500">{issuer}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#232326] mt-auto">
                  <span className="font-mono text-xs tracking-wide text-zinc-500">{year}</span>
                  {url ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] tracking-wide text-zinc-400 group-hover:text-white transition-colors">
                      Verify
                      <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-zinc-600">No link</span>
                  )}
                </div>
              </Tag>
            );
          })}

          {/* Placeholder for future certs - keeps grid balanced and shows ambition */}
          <div className="rounded-2xl border border-dashed border-[#27272a] bg-transparent p-5 flex flex-col gap-3 justify-center min-h-[164px]">
            <div className="w-10 h-10 rounded-xl border border-dashed border-[#27272a] flex items-center justify-center text-zinc-600">
              <Award size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">More certifications incoming</p>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Currently pursuing deeper backend, cloud, and systems design credentials.
              </p>
            </div>
            <span className="font-mono text-[11px] tracking-widest uppercase text-zinc-600">In progress</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1f1f23] bg-[#0f0f10] px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-xs tracking-wide text-zinc-500">
            Credentials are verified via Credly / issuer. Ask me about coursework and project work behind each badge.
          </p>
          <a
            href="https://www.credly.com/users/jshmlnd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            View Credly profile <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
