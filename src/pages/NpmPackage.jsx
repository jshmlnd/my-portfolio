import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, Check, ExternalLink, Package, Box, Layers, Cpu, Database, Terminal, FileCode2, Globe, RefreshCw, Clock } from 'lucide-react';
import { siNpm, siGithub } from 'simple-icons';
import { useReveal } from '../hooks/useReveal';
import { reportClientError } from '../utils/reportClientError';

const NPM_API_BASE = 'https://npmjsapi.joshuaklein-malonda.workers.dev';
const NPM_REGISTRY_PACKAGES = `${NPM_API_BASE}/registry/packages`;
const NPM_PACKAGE_DETAIL = (name) => `${NPM_API_BASE}/package?name=${encodeURIComponent(name)}`;

const cleanUrl = (url) => url?.replace('git+', '').replace(/\.git$/, '');

// Tiny highlighter: comments, strings and a few keywords are enough for the snippets below.
const TOKENS = /(\/\/.*|'[^']*'|"[^"]*"|\b(?:const|import|from|export|function|return|module|require)\b)/g;
const highlight = (code) =>
  code.split(TOKENS).map((t, i) => {
    if (i % 2 === 0) return t;
    const cls = t.startsWith('//') ? 'text-zinc-500' : /^['"]/.test(t) ? 'text-[#a6e3a1]' : 'text-[#a78bfa]';
    return <span key={i} className={cls}>{t}</span>;
  });

const SCRAPER_CONFIG = `// api.config.js
module.exports = {
  name: 'myShopAPI',
  sourceUrl: 'https://quotes.toscrape.com',
  endpoints: [
    {
      method: 'GET', path: '/quotes',
      selector: '.quote',
      fields: { text: '.text', author: '.author' }
    }
  ]
}`;

const ZJKM_UI_USAGE = `import { ShimmerButton } from "zjkm-ui/shimmer-button";
import { Toaster, toast } from "zjkm-ui/toaster";

export function Cta() {
  return (
    <>
      <ShimmerButton onClick={() => toast("Saved")}>
        Get started
      </ShimmerButton>
      <Toaster />
    </>
  );
}`;

// Hand-written content per package; anything not listed falls back to the registry README.
const SHOWCASE = {
  '@zjkm666/scraperapi': {
    commands: ['npm i @zjkm666/scraperapi', 'npx @zjkm666/scraperapi myShopAPI https://quotes.toscrape.com'],
    hint: 'Scaffold via npx or call createScraperAPI() from code.',
    features: [
      { icon: Terminal, title: 'CLI Scaffolder', desc: 'npx → Express project in seconds' },
      { icon: Layers, title: 'Declarative', desc: 'CSS selectors + buildUrl' },
      { icon: Cpu, title: 'Playwright', desc: 'JS-rendered SPA support' },
      { icon: Database, title: 'Cache', desc: 'node-cache per-endpoint' },
    ],
    code: { title: 'api.config.js — declarative endpoints', file: 'api.config.js', source: SCRAPER_CONFIG },
    extra: {
      title: 'Library usage',
      source: "const { createScraperAPI } = require('@zjkm666/scraperapi');\nconst app = createScraperAPI({ name, sourceUrl, endpoints });\napp.listen(3000);",
    },
    note: ['Generated structure:', 'api.config.js · server.js · scraper.js'],
  },
  'zjkm-ui': {
    commands: ['npm i zjkm-ui'],
    hint: 'Import each component from its own path, e.g. zjkm-ui/shimmer-button.',
    features: [
      { icon: FileCode2, title: 'One file each', desc: 'Styles included, no CSS setup' },
      { icon: Layers, title: 'Per-path imports', desc: 'zjkm-ui/<component-name>' },
      { icon: Cpu, title: 'React 19', desc: '"use client" for the App Router' },
      { icon: Globe, title: 'Playground', desc: 'Every component live at ui.zjkm.tech' },
    ],
    code: { title: 'Cta.tsx — per-component imports', file: 'Cta.tsx', source: ZJKM_UI_USAGE },
    note: ['Docs:', 'ui.zjkm.tech/docs/components'],
  },
};

const NpmPackage = () => {
  const [copied, setCopied] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [details, setDetails] = useState({});
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const revealRef = useReveal();
  const abortRef = useRef(null);
  const intervalRef = useRef(null);
  const POLL_INTERVAL = 60_000; // 1 minute

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Fetch packages from NPM Worker API
  const fetchPackages = useCallback(async (isPoll = false) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!isPoll) setLoading(true);
    setError(null);

    try {
      const res = await fetch(NPM_REGISTRY_PACKAGES, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPackages(json.data?.packages || json.packages || []);
      setLastFetched(new Date());
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch packages');
        reportClientError('npm-packages', err);
      }
    } finally {
      if (!isPoll) setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchPackages();
    intervalRef.current = setInterval(() => fetchPackages(true), POLL_INTERVAL);
    return () => {
      clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchPackages]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchPackages();
  };

  const pkg = packages.find((p) => p.name === selectedName) || packages[0];
  const displayPkg = pkg || {
    name: '@zjkm666/scraperapi',
    version: '1.0.1',
    description: 'Generate a customizable Express scraping API from any URL — just name it and point it.',
    keywords: ['scraper', 'api', 'express', 'cheerio', 'playwright', 'generator'],
    links: { npm: 'https://www.npmjs.com/package/@zjkm666/scraperapi', repository: 'https://github.com/jshmlnd/zjkm666-package' },
    date: new Date().toISOString(),
  };
  const detail = details[displayPkg.name];

  // Registry detail (versions, license) is fetched once per package, when it is first shown.
  useEffect(() => {
    if (!pkg || details[pkg.name]) return;
    const controller = new AbortController();
    fetch(NPM_PACKAGE_DETAIL(pkg.name), { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => d?.data && setDetails((prev) => ({ ...prev, [pkg.name]: d.data })))
      .catch((err) => {
        // Detail fetch is non-critical — the card falls back to list data
        if (err.name !== 'AbortError') reportClientError('npm-package-detail', err);
      });
    return () => controller.abort();
  }, [pkg, details]);

  const show = SHOWCASE[displayPkg.name] || {
    commands: [`npm i ${displayPkg.name}`],
    hint: '',
    features: [],
    code: detail?.readmeSnippet ? { title: 'README', file: 'README.md', source: detail.readmeSnippet } : null,
  };
  const repoUrl = cleanUrl(displayPkg.links?.repository);
  const siteUrl = repoUrl || displayPkg.links?.homepage || displayPkg.links?.npm;
  const siteLabel = (siteUrl || '').replace('https://', '');
  const license = detail?.license?.startsWith('SEE LICENSE') ? 'Custom' : detail?.license || '—';
  const versions = detail?.versions || [displayPkg.version];
  const timeAgo = (() => {
    try {
      const d = new Date(displayPkg.date);
      const diff = Date.now() - d.getTime();
      const h = Math.floor(diff / 3600000);
      if (h < 24) return `${h}h ago`;
      const days = Math.floor(h / 24);
      return `${days}d ago`;
    } catch {
      return '4h ago';
    }
  })();

  return (
    <section id="packages" className="bg-[#09090b] border-t border-[#1f1f23] px-6 py-16 lg:py-20">
      <div className="max-w-[1160px] mx-auto flex flex-col gap-10 reveal" ref={revealRef}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="mono-label">04 — Packages</p>
            <h2 className="text-[32px] sm:text-[40px] font-black tracking-[-0.03em] leading-none text-white">
              Install. <span className="text-zinc-500">Configure. </span>
            Deploy.</h2>
            <p className="max-w-[560px] text-[14px] leading-6 text-zinc-400">
              Packages I publish on npm: a CLI that scaffolds Express scraping APIs, and a library of animated React components. Pick one to see how it installs and works.
            </p>
          </div>
          <div className="hidden sm:inline-flex self-start lg:self-auto items-center gap-2 rounded-full border border-[#27272a] bg-[#0f0f10] px-3 py-1.5 font-mono text-[11px] tracking-wide text-zinc-500">
            <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-[#CB3837] animate-pulse'}`} />
            {loading ? 'Loading…' : error ? 'Offline · fallback' : (
              <span className="flex items-center gap-2">
                npm · Public · {packages.length} pkg{packages.length !== 1 ? 's' : ''}
                {lastFetched && (
                  <span className="flex items-center gap-1 text-zinc-600">
                    <Clock size={10} />
                    {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </span>
            )}
            {isRefreshing && <span className="w-3 h-3 rounded-full border-2 border-zinc-700 border-t-[#CB3837] animate-spin" />}
          </div>
        </div>

        {packages.length > 1 && (
          <div role="tablist" aria-label="npm package" className="self-start max-w-full overflow-x-auto inline-flex p-1 rounded-full bg-[#141416] border border-[#27272a] -mb-4">
            {packages.map((p) => (
              <button
                key={p.name}
                role="tab"
                aria-selected={p.name === displayPkg.name}
                onClick={() => setSelectedName(p.name)}
                className={`shrink-0 px-3 sm:px-4 py-1.5 rounded-full font-mono text-[12px] sm:text-[13px] font-medium transition-colors ${
                  p.name === displayPkg.name ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Main showcase card */}
        <div role={packages.length > 1 ? 'tabpanel' : undefined} className="rounded-[20px] border border-[#27272a] bg-[#0f0f10] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-5 border-b border-[#232326] bg-[#141416]">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#CB3837] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                  <path d={siNpm.path} />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[16px] sm:text-[18px] font-semibold tracking-tight text-white font-mono [overflow-wrap:anywhere]">{displayPkg.name}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] tracking-widest uppercase font-medium">
                    v{displayPkg.version} · Public
                  </span>
                {(loading || isRefreshing) && <span className="w-3 h-3 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />}
                </div>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{displayPkg.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={displayPkg.links?.npm || `https://www.npmjs.com/package/${displayPkg.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CB3837] text-white text-xs font-semibold hover:bg-[#b8302e] transition-colors"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d={siNpm.path} /></svg>
                npm
                <ExternalLink size={12} className="opacity-80" />
              </a>
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-colors"
              >
                {repoUrl ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d={siGithub.path} /></svg>
                ) : (
                  <Globe size={14} />
                )}
                {repoUrl ? 'GitHub' : 'Docs'}
              </a>
            </div>
          </div>

          <div className="grid min-w-0 lg:grid-cols-[1.05fr_0.95fr] gap-0">
            {/* Left: info */}
            <div className="min-w-0 p-4 sm:p-6 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-[#232326]">
              {/* Install */}
              <div className="space-y-3">
                <p className="mono-label !text-zinc-400">Install</p>
                {show.commands.map((cmd, i) => (
                  <div key={cmd} className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-[#09090b] border border-[#27272a] font-mono text-xs sm:text-sm">
                    <span className="text-zinc-500 select-none">$</span>
                    <code className={`flex-1 truncate ${i === 0 ? 'text-zinc-200' : 'text-zinc-300'}`}>{cmd}</code>
                    <button
                      onClick={() => handleCopy(cmd, `cmd-${i}`)}
                      className="w-7 h-7 rounded-lg bg-[#1a1a1e] border border-[#27272a] flex items-center justify-center text-zinc-500 hover:text-white hover:border-[#3f3f46] transition-colors shrink-0"
                      title="Copy"
                    >
                      {copied === `cmd-${i}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
                <p className="font-mono text-[11px] leading-4 text-zinc-500">
                  {show.hint && <span className="text-zinc-400">{show.hint} </span>}
                  {(detail?.keywords || displayPkg.keywords || []).length} keywords · {license} · {error ? 'offline fallback' : 'live from registry'}
                </p>
              </div>

              {/* Stats — live */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { k: displayPkg.version, v: 'Latest', sub: timeAgo },
                  { k: `${versions.length}`, v: 'Versions', sub: versions.join(' · ') },
                  { k: license, v: 'License', sub: `${packages.length} pkg${packages.length !== 1 ? 's' : ''}` },
                ].map(({ k, v, sub }) => (
                  <div key={v} className="rounded-xl border border-[#232326] bg-[#141416] px-2 py-3 sm:p-3 text-center min-w-0">
                    <div className="font-mono text-sm font-semibold text-white truncate">{k}</div>
                    <div className="text-[11px] font-medium text-zinc-300">{v}</div>
                    <div className="font-mono text-[10px] tracking-wide uppercase text-zinc-500 truncate">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Features */}
              {show.features.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {show.features.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="rounded-xl border border-[#232326] bg-[#141416] p-3.5 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0f0f10] border border-[#27272a] flex items-center justify-center text-zinc-400 shrink-0">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white leading-none">{title}</p>
                        <p className="text-[11px] leading-4 text-zinc-500 mt-1">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(displayPkg.keywords || []).slice(0, 8).map((k) => (
                  <span key={k} className="px-2.5 py-1 rounded-full bg-[#141416] border border-[#232326] font-mono text-[11px] tracking-wide text-zinc-500">
                    {k}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: code preview */}
            <div className="min-w-0 bg-[#09090b] p-4 sm:p-6 flex flex-col gap-4">
              {show.code && (
                <>
                  <div className="flex items-center gap-2">
                    <FileCode2 size={14} className="text-zinc-500" />
                    <span className="font-mono text-[11px] tracking-widest uppercase font-semibold text-zinc-400 truncate">{show.code.title}</span>
                    <span className="ml-auto font-mono text-[10px] tracking-wide px-2 py-1 rounded-full bg-[#1a1a1e] border border-[#27272a] text-zinc-500">editable</span>
                  </div>

                  <div className="rounded-xl border border-[#232326] bg-[#0f0f10] overflow-hidden">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#232326] bg-[#141416]">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                      <span className="ml-3 font-mono text-[11px] tracking-wide text-zinc-500">{show.code.file}</span>
                      <button
                        onClick={() => handleCopy(show.code.source, 'code')}
                        className="ml-auto w-6 h-6 rounded-lg bg-[#0f0f10] border border-[#27272a] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                        title="Copy code"
                      >
                        {copied === 'code' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      </button>
                    </div>
                    <pre className="p-4 font-mono text-[12px] leading-5 overflow-x-auto">
                      <code className="text-zinc-300">{highlight(show.code.source)}</code>
                    </pre>
                  </div>
                </>
              )}

              {show.extra && (
                <div className="rounded-xl border border-[#232326] bg-[#141416] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Box size={12} className="text-zinc-500" />
                    <span className="font-mono text-[11px] tracking-widest uppercase text-zinc-500">{show.extra.title}</span>
                  </div>
                  <pre className="font-mono text-[11px] leading-5 text-zinc-400 overflow-x-auto">
                    <code>{highlight(show.extra.source)}</code>
                  </pre>
                </div>
              )}

              {show.note && (
                <div className="flex items-center gap-2 text-[11px] font-mono tracking-wide text-zinc-600">
                  <Globe size={12} />
                  {show.note[0]} <span className="text-zinc-400">{show.note[1]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom meta — live */}
          <div className="px-4 sm:px-6 py-3 bg-[#141416] border-t border-[#232326] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="font-mono text-[11px] tracking-wide text-zinc-500 flex items-center gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
              Published {timeAgo} ·{' '}
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-white underline decoration-zinc-700 underline-offset-4"
              >
                {siteLabel}
              </a>
              {error && <span className="text-amber-400">· offline</span>}
            </p>
            <div className="flex items-center gap-3">
              {lastFetched && (
                <span className="font-mono text-[11px] tracking-wide text-zinc-600 hidden sm:flex items-center gap-1">
                  <Clock size={10} /> {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-[#1a1a1e] transition-colors disabled:opacity-40"
                title="Refresh packages"
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <span className="font-mono text-[11px] tracking-wide text-zinc-600 hidden sm:inline">
                {packages.length} package{packages.length !== 1 ? 's' : ''} · {loading ? 'loading…' : 'live'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats bar — live from registry */}
        <div className="grid min-w-0 sm:grid-cols-3 gap-3">
          {loading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-[72px] rounded-2xl bg-[#0f0f10] border border-[#27272a] animate-pulse" />)
          ) : error ? (
            <div className="sm:col-span-3 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Package size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-200">Failed to load packages</p>
                <p className="text-xs text-amber-200/70 font-mono">{error} · via {NPM_API_BASE.replace('https://', '')}</p>
              </div>
              <button
                onClick={handleManualRefresh}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 font-mono text-[11px] text-amber-200 hover:bg-amber-500/30 transition-colors shrink-0"
              >
                <RefreshCw size={10} className={isRefreshing ? 'animate-spin' : ''} /> Retry
              </button>
            </div>
          ) : (
            <>
              {packages.map((p) => (
                <a
                  key={p.name}
                  href={p.links?.npm || `https://www.npmjs.com/package/${p.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group min-w-0 flex items-center gap-3 rounded-2xl border border-[#27272a] bg-[#0f0f10] p-4 hover:border-[#CB3837]/30 hover:bg-[#141416] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#CB3837]/10 border border-[#CB3837]/20 flex items-center justify-center text-[#CB3837] group-hover:scale-105 transition-transform shrink-0">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={siNpm.path} /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-[#ff6b6b] transition-colors truncate">{p.name}</p>
                    <p className="text-xs text-zinc-500 truncate">v{p.version} · {p.description?.slice(0, 48) || 'npm package'}</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto text-zinc-600 group-hover:text-zinc-300 shrink-0" />
                </a>
              ))}
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group min-w-0 flex items-center gap-3 rounded-2xl border border-[#27272a] bg-[#0f0f10] p-4 hover:border-white/20 hover:bg-[#141416] transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  {repoUrl ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={siGithub.path} /></svg>
                  ) : (
                    <Globe size={16} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{repoUrl ? 'View on GitHub' : 'View docs'}</p>
                  <p className="text-xs text-zinc-500 truncate">{siteLabel}</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-zinc-600 group-hover:text-zinc-300 shrink-0" />
              </a>
              {packages.length < 2 && (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#27272a] bg-transparent p-4">
                  <div className="w-9 h-9 rounded-xl border border-dashed border-[#27272a] flex items-center justify-center text-zinc-600 shrink-0">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">More packages soon</p>
                    <p className="text-xs text-zinc-600">{packages.length} package · via registry</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default NpmPackage;
