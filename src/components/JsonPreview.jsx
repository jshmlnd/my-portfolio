import { useMemo, useState } from 'react';
import { Braces, Check, Copy } from 'lucide-react';

const MAX_CHARS = 400_000; // safety cap for huge payloads

// Colorize one JSON value token (without its trailing comma)
const valueClass = (core) => {
  if (core === '{' || core === '}' || core === '[' || core === ']') return 'text-zinc-600';
  if (core.startsWith('"')) return 'text-emerald-300';
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(core)) return 'text-amber-300';
  if (core === 'true' || core === 'false' || core === 'null') return 'text-fuchsia-300';
  return 'text-zinc-400';
};

const JsonValue = ({ text }) => {
  const t = text.trimEnd();
  const hasComma = t.endsWith(',');
  const core = hasComma ? t.slice(0, -1) : t;
  return (
    <>
      <span className={valueClass(core)}>{core}</span>
      {hasComma && <span className="text-zinc-600">,</span>}
    </>
  );
};

const JsonLine = ({ line }) => {
  const kv = line.match(/^(\s*)"((?:[^"\\]|\\.)*)":\s?(.*)$/);
  if (kv) {
    const [, indent, key, rest] = kv;
    return (
      <>
        <span className="text-zinc-700">{indent}</span>
        <span className="text-sky-300">"{key}"</span>
        <span className="text-zinc-600">: </span>
        {rest ? <JsonValue text={rest} /> : null}
      </>
    );
  }
  return <JsonValue text={line} />;
};

const JsonPreview = ({ data, raw, name }) => {
  const [pretty, setPretty] = useState(true);
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    try {
      const out = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      return out.length > MAX_CHARS
        ? out.slice(0, MAX_CHARS) + '\n… truncated (payload too large to render fully)'
        : out;
    } catch {
      return raw ?? '';
    }
  }, [data, raw, pretty]);

  const size = useMemo(() => {
    const bytes = new Blob([raw ?? text]).size;
    return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
  }, [raw, text]);

  const topKeys = data && typeof data === 'object' ? Object.keys(data).length : 0;
  const lines = useMemo(() => text.split('\n'), [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0b]">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#232326] bg-[#0f0f10] shrink-0">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-zinc-400">
          <Braces size={12} className="text-emerald-500" />
          application/json
        </span>
        <span className="font-mono text-[11px] text-zinc-600">
          {topKeys} top-level {topKeys === 1 ? 'key' : 'keys'} · {size}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer select-none font-mono text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors">
            <input
              type="checkbox"
              checked={pretty}
              onChange={(e) => setPretty(e.target.checked)}
              className="w-3 h-3 accent-emerald-500 cursor-pointer"
            />
            Pretty-print
          </label>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141416] border border-[#27272a] font-mono text-[11px] text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-colors"
            title="Copy JSON"
          >
            {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4">
        {pretty ? (
          <pre className="font-mono text-[12px] leading-[1.55]">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-9 shrink-0 pr-3 text-right select-none text-zinc-700/80">{i + 1}</span>
                <code className="whitespace-pre text-zinc-300">
                  <JsonLine line={line} />
                </code>
              </div>
            ))}
          </pre>
        ) : (
          <pre className="font-mono text-[12px] leading-5 whitespace-pre-wrap break-all text-zinc-400">{text}</pre>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#232326] bg-[#0f0f10] shrink-0">
        <span className="font-mono text-[11px] tracking-wide text-zinc-600 truncate block">
          {name} · JSON response · rendered natively
        </span>
      </div>
    </div>
  );
};

export default JsonPreview;
