import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, Check, ExternalLink, Package, Box, Layers, Cpu, Database, Terminal, FileCode2, Globe, RefreshCw, Clock } from 'lucide-react';
import { siNpm, siGithub } from 'simple-icons';
import { useReveal } from '../hooks/useReveal';

const NPM_API_BASE = 'https://npmjsapi.joshuaklein-malonda.workers.dev';
const NPM_REGISTRY_PACKAGES = `${NPM_API_BASE}/registry/packages`;
const NPM_PACKAGE_DETAIL = (name) => `${NPM_API_BASE}/package?name=${encodeURIComponent(name)}`;

const NpmPackage = () => {
  const [copied, setCopied] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [detail, setDetail] = useState(null);
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
      const pkgs = json.data?.packages || json.packages || [];
      setPackages(pkgs);
      setLastFetched(new Date());

      // Auto-select first package and fetch its detail
      const first = pkgs[0];
      if (first) {
        setPkg((prev) => prev || first);
        try {
          const detailRes = await fetch(NPM_PACKAGE_DETAIL(first.name), { signal: controller.signal });
          if (detailRes.ok) {
            const d = await detailRes.json();
            if (d?.data) setDetail(d.data);
          }
        } catch {
          // Detail fetch is non-critical — ignore
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch packages');
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

  const displayPkg = pkg || {
    name: '@zjkm666/scraperapi',
    version: '1.0.1',
    description: 'Generate a customizable Express scraping API from any URL — just name it and point it.',
    keywords: ['scraper', 'api', 'express', 'cheerio', 'playwright', 'generator'],
    links: { npm: 'https://www.npmjs.com/package/@zjkm666/scraperapi', repository: 'https://github.com/jshmlnd/zjkm666-package' },
    date: new Date().toISOString(),
  };
  const versions = detail?.versions || ['1.0.1'];
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
            <p className="mono-label">03 — Packages</p>
            <h2 className="text-[32px] sm:text-[40px] font-black tracking-[-0.03em] leading-none text-white">
              Install. <span className="text-zinc-500">Run. </span>
            Deploy.</h2>
            <p className="max-w-[560px] text-[14px] leading-6 text-zinc-400">
              My first npm package — a CLI + library to generate customizable Express scraping APIs from any URL. Declarative endpoints, Playwright for JS-rendered sites, and built-in cache.
            </p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#0f0f10] px-3 py-1.5 font-mono text-[11px] tracking-wide text-zinc-500">
            <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-[#CB3837] animate-pulse'}`} />
            {loading ? 'Loading…' : error ? 'Offline · fallback' : (
              <span className="flex items-center gap-2">
                npm · Public · v{displayPkg.version} · {packages.length} pkg{packages.length !== 1 ? 's' : ''}
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

        {/* Main showcase card */}
        <div className="rounded-[20px] border border-[#27272a] bg-[#0f0f10] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-[#232326] bg-[#141416]">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#CB3837] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                  <path d={siNpm.path} />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[18px] font-semibold tracking-tight text-white font-mono">{displayPkg.name}</h3>
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
                href={displayPkg.links?.repository?.replace('git+', '').replace('.git', '') || 'https://github.com/jshmlnd/zjkm666-package'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-colors"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d={siGithub.path} /></svg>
                GitHub
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-0">
            {/* Left: info */}
            <div className="p-6 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-[#232326]">
              {/* Install */}
              <div className="space-y-3">
                <p className="mono-label !text-zinc-400">Install</p>
                <div className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-[#09090b] border border-[#27272a] font-mono text-sm">
                  <span className="text-zinc-500 select-none">$</span>
                  <code className="flex-1 text-zinc-200 truncate">npm i {displayPkg.name}</code>
                  <button
                    onClick={() => handleCopy(`npm i ${displayPkg.name}`, 'install')}
                    className="w-7 h-7 rounded-lg bg-[#1a1a1e] border border-[#27272a] flex items-center justify-center text-zinc-500 hover:text-white hover:border-[#3f3f46] transition-colors shrink-0"
                    title="Copy"
                  >
                    {copied === 'install' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
                <div className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-[#09090b] border border-[#27272a] font-mono text-xs sm:text-sm">
                  <span className="text-zinc-500 select-none">$</span>
                  <code className="flex-1 text-zinc-300 truncate">npx {displayPkg.name} myShopAPI https://quotes.toscrape.com</code>
                  <button
                    onClick={() => handleCopy(`npx ${displayPkg.name} myShopAPI https://quotes.toscrape.com`, 'npx')}
                    className="w-7 h-7 rounded-lg bg-[#1a1a1e] border border-[#27272a] flex items-center justify-center text-zinc-500 hover:text-white hover:border-[#3f3f46] transition-colors shrink-0"
                    title="Copy"
                  >
                    {copied === 'npx' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="font-mono text-[11px] leading-4 text-zinc-600">
                  Scaffold via <span className="text-zinc-400">npx {displayPkg.name}</span> or <span className="text-zinc-400">createScraperAPI()</span>. {detail?.keywords?.length || 9} keywords · {detail?.license || 'ISC'} · {error ? 'offline fallback' : 'live from registry'}
                </p>
              </div>

              {/* Stats — live */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: displayPkg.version, v: 'Latest', sub: timeAgo },
                  { k: `${versions.length}`, v: 'Versions', sub: versions.join(' · ') || '1.0.1' },
                  { k: detail?.license || 'ISC', v: 'License', sub: detail ? `${packages.length} pkg${packages.length !== 1 ? 's' : ''}` : 'Public' },
                ].map(({ k, v, sub }) => (
                  <div key={`${k}-${v}`} className="rounded-xl border border-[#232326] bg-[#141416] p-3 text-center">
                    <div className="font-mono text-sm font-semibold text-white truncate">{k}</div>
                    <div className="text-[11px] font-medium text-zinc-300">{v}</div>
                    <div className="font-mono text-[10px] tracking-wide uppercase text-zinc-500 truncate">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Terminal, title: 'CLI Scaffolder', desc: 'npx → Express project in seconds' },
                  { icon: Layers, title: 'Declarative', desc: 'CSS selectors + buildUrl' },
                  { icon: Cpu, title: 'Playwright', desc: 'JS-rendered SPA support' },
                  { icon: Database, title: 'Cache', desc: 'node-cache per-endpoint' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="rounded-xl border border-[#232326] bg-[#141416] p-3.5 flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0f0f10] border border-[#27272a] flex items-center justify-center text-zinc-400 shrink-0">
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-none">{title}</p>
                      <p className="text-[11px] leading-4 text-zinc-500 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {(displayPkg.keywords || ['scraper', 'api', 'express', 'cheerio', 'playwright', 'generator']).slice(0, 8).map((k) => (
                  <span key={k} className="px-2.5 py-1 rounded-full bg-[#141416] border border-[#232326] font-mono text-[11px] tracking-wide text-zinc-500">
                    {k}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: code preview */}
            <div className="bg-[#09090b] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <FileCode2 size={14} className="text-zinc-500" />
                <span className="font-mono text-[11px] tracking-widest uppercase font-semibold text-zinc-400">api.config.js — declarative endpoints</span>
                <span className="ml-auto font-mono text-[10px] tracking-wide px-2 py-1 rounded-full bg-[#1a1a1e] border border-[#27272a] text-zinc-500">editable</span>
              </div>

              <div className="rounded-xl border border-[#232326] bg-[#0f0f10] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#232326] bg-[#141416]">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                  <span className="ml-3 font-mono text-[11px] tracking-wide text-zinc-500">api.config.js</span>
                  <button
                    onClick={() => handleCopy(`module.exports = {\n  name: 'myShopAPI',\n  sourceUrl: 'https://quotes.toscrape.com',\n  endpoints: [{\n    method: 'GET',\n    path: '/quotes',\n    selector: '.quote',\n    fields: { text: '.text', author: '.author' }\n  }]\n}`, 'code')}
                    className="ml-auto w-6 h-6 rounded-lg bg-[#0f0f10] border border-[#27272a] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                  >
                    {copied === 'code' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                  </button>
                </div>
                <pre className="p-4 font-mono text-[12px] leading-5 overflow-x-auto">
                  <code className="text-zinc-300">
                    <span className="text-zinc-500">{'//'} api.config.js</span>{'\n'}
                    <span className="text-[#a78bfa]">module</span>.<span className="text-zinc-300">exports</span> <span className="text-zinc-500">=</span> {'{'}<br />
                    {'  '}<span className="text-zinc-400">name</span>: <span className="text-[#a6e3a1]">'myShopAPI'</span>,<br />
                    {'  '}<span className="text-zinc-400">sourceUrl</span>: <span className="text-[#a6e3a1]">'https://quotes.toscrape.com'</span>,<br />
                    {'  '}<span className="text-zinc-400">endpoints</span>: [<br />
                    {'    {'}<br />
                    {'      '}<span className="text-zinc-400">method</span>: <span className="text-[#a6e3a1]">'GET'</span>, <span className="text-zinc-400">path</span>: <span className="text-[#a6e3a1]">'/quotes'</span>,<br />
                    {'      '}<span className="text-zinc-400">selector</span>: <span className="text-[#a6e3a1]">'.quote'</span>,<br />
                    {'      '}<span className="text-zinc-400">fields</span>: {'{'} <span className="text-zinc-400">text</span>: <span className="text-[#a6e3a1]">'.text'</span>, <span className="text-zinc-400">author</span>: <span className="text-[#a6e3a1]">'.author'</span> {'}'}<br />
                    {'    }'}<br />
                    {'  ]'}<br />
                    {'}'}
                  </code>
                </pre>
              </div>

              <div className="rounded-xl border border-[#232326] bg-[#141416] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Box size={12} className="text-zinc-500" />
                  <span className="font-mono text-[11px] tracking-widest uppercase text-zinc-500">Library usage</span>
                </div>
                <pre className="font-mono text-[11px] leading-5 text-zinc-400 overflow-x-auto">
                  <code>
                    <span className="text-zinc-500">const</span> {'{'} createScraperAPI {'}'} <span className="text-zinc-500">=</span> <span className="text-[#89dceb]">require</span>(<span className="text-[#a6e3a1]">'{displayPkg.name}'</span>);{'\n'}
                    <span className="text-zinc-500">const</span> app <span className="text-zinc-500">=</span> <span className="text-[#89dceb]">createScraperAPI</span>({'{'} name, sourceUrl, endpoints {'}'});{'\n'}
                    app.<span className="text-[#89dceb]">listen</span>(3000);
                  </code>
                </pre>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono tracking-wide text-zinc-600">
                <Globe size={12} />
                Generated structure: <span className="text-zinc-400">api.config.js · server.js · scraper.js</span>
              </div>
            </div>
          </div>

          {/* Bottom meta — live */}
          <div className="px-6 py-3 bg-[#141416] border-t border-[#232326] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="font-mono text-[11px] tracking-wide text-zinc-500 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
              Published {timeAgo} ·{' '}
              <a
                href={displayPkg.links?.repository?.replace('git+', '').replace('.git', '') || 'https://github.com/jshmlnd/zjkm666-package'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white underline decoration-zinc-700 underline-offset-4"
              >
                {(displayPkg.links?.repository || 'github.com/jshmlnd/zjkm666-package').replace('git+', '').replace('https://', '').replace('.git', '')}
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
        <div className="grid sm:grid-cols-3 gap-3">
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
                  className="group flex items-center gap-3 rounded-2xl border border-[#27272a] bg-[#0f0f10] p-4 hover:border-[#CB3837]/30 hover:bg-[#141416] transition-colors"
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
                href={displayPkg.links?.repository?.replace('git+', '').replace('.git', '') || 'https://github.com/jshmlnd/zjkm666-package'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-[#27272a] bg-[#0f0f10] p-4 hover:border-white/20 hover:bg-[#141416] transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={siGithub.path} /></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">View on GitHub</p>
                  <p className="text-xs text-zinc-500 truncate">{(displayPkg.links?.repository || 'github.com/jshmlnd/zjkm666-package').replace('git+', '').replace('https://', '').replace('.git', '')}</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-zinc-600 group-hover:text-zinc-300 shrink-0" />
              </a>
              {packages.length < 3 && (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#27272a] bg-transparent p-4">
                  <div className="w-9 h-9 rounded-xl border border-dashed border-[#27272a] flex items-center justify-center text-zinc-600 shrink-0">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">{packages.length === 1 ? 'More packages soon' : 'Registry live'}</p>
                    <p className="text-xs text-zinc-600">{packages.length} package{packages.length !== 1 ? 's' : ''} · via registry</p>
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
