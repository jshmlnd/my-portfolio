import { siGithub, siFacebook } from 'simple-icons';

const socialLinks = [
  { icon: siGithub, url: 'https://www.github.com/jshmlnd', label: 'GitHub' },
  { icon: siFacebook, url: 'https://www.facebook.com/jkmalonda', label: 'Facebook' },
];

const Footer = () => {
  const scrollTo = (href) => {
    const el = document.querySelector(href);
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
      else history.replaceState(null, '', href);
    };
    requestAnimationFrame(step);
  };

  return (
    <footer className="border-t border-[#1f1f23] bg-[#09090b]">
      <div className="max-w-[1160px] mx-auto px-6">
        {/* top row */}
        <div className="flex flex-col lg:flex-row gap-8 py-10">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-mono font-bold text-xs">
                &lt;/&gt;
              </div>
              <div className="leading-none">
                <p className="font-mono text-sm font-semibold tracking-tight text-white">jshmlnd</p>
                <p className="font-mono text-[11px] tracking-widest uppercase text-zinc-500">Full-stack Developer</p>
              </div>
            </div>
            <p className="max-w-[420px] text-sm leading-6 text-zinc-500">
              Full-stack developer based in Legazpi City, PH. I build thoughtful, performant web products — and I’m
              always up for a good systems discussion.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#27272a] bg-[#0f0f10] font-mono text-[11px] tracking-wide text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Deployed
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-[#27272a] bg-[#0f0f10] font-mono text-[11px] tracking-wide text-zinc-500">
                Legazpi City, PH
              </span>
            </div>
          </div>

          <div className="flex gap-10 sm:gap-16">
            <div className="space-y-3">
              <p className="font-mono text-[11px] tracking-widest uppercase font-semibold text-zinc-400">Navigate</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#hero"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo('#hero');
                    }}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#projects"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo('#projects');
                    }}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    Work
                  </a>
                </li>
                <li>
                  <a
                    href="#packages"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo('#packages');
                    }}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    Package
                  </a>
                </li>
                <li>
                  <a
                    href="#certs"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo('#certs');
                    }}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    Certifications
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jshmlnd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    GitHub <span className="text-xs">↗</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[11px] tracking-widest uppercase font-semibold text-zinc-400">Contact</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:joshua.malonda11@gmail.com" className="text-zinc-500 hover:text-white transition-colors">
                    joshua.malonda11@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jshmlnd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    github.com/jshmlnd
                  </a>
                </li>
                <li className="flex gap-2 pt-1">
                  {socialLinks.map(({ icon, url, label }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-8 h-8 rounded-full bg-[#141416] border border-[#27272a] flex items-center justify-center text-zinc-500 hover:text-white hover:border-[#3f3f46] hover:bg-[#1a1a1e] transition-colors"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d={icon.path} />
                      </svg>
                    </a>
                  ))}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5 border-t border-[#1f1f23] font-mono text-xs tracking-wide text-zinc-600">
          <p>© {new Date().getFullYear()} jshmlnd — All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Built with React</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-zinc-700" />
            <span className="hidden sm:inline">Deployed with love. </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
