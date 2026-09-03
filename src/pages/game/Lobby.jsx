import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Users, Play, Copy, Check, Loader2, Link2, Coffee } from 'lucide-react';
import { io } from 'socket.io-client';

const getServerUrl = () => window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://game-server-wl53.onrender.com';

export default function Lobby() {
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('wc_name') || '');
  const [view, setView] = useState('menu'); // menu | create | join | waiting | playing
  const [lobbyCode, setLobbyCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [rounds, setRounds] = useState(3);
  const [timePerRound, setTimePerRound] = useState(60);
  const [linkCopied, setLinkCopied] = useState(false);
  const [searchParams] = useSearchParams();
  const socketRef = useRef(null);

  // Connect to server
  useEffect(() => {
    const s = io(getServerUrl(), { transports: ['websocket', 'polling'] });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      setConnecting(false);
    });
    s.on('connect_error', () => {
      setConnecting(false);
      setError('Cannot connect to server. Is it running?');
    });

    s.on('players-update', (p) => {
      setPlayers(p);
      setIsHost(p.some((player) => player.id === s.id && player.isHost));
    });

    s.on('game-started', () => {
      setView('playing');
    });

    s.on('game-over', () => {});

    return () => { s.disconnect(); };
  }, []);

  // Auto-fill join code from invite link
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) {
      setJoinCode(joinCode.toUpperCase());
      setView('join');
    }
  }, [searchParams]);

  const saveName = (name) => {
    setPlayerName(name);
    localStorage.setItem('wc_name', name);
  };

  const getPlayerId = () => {
    const key = 'wc_player_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const next = globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `player_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, next);
    return next;
  };

  const createLobby = () => {
    if (!playerName.trim()) return setError('Enter your name');
    if (!socketRef.current) return setError('Connecting to server...');
    setError('');
    setConnecting(true);
    socketRef.current.emit('create-lobby', {
      playerName: playerName.trim(),
      playerId: getPlayerId(),
      settings: { rounds, timePerRound },
    }, (res) => {
      setConnecting(false);
      if (res.ok) {
        setLobbyCode(res.code);
        setIsHost(true);
        setView('waiting');
      }
    });
  };

  const joinLobby = useCallback(() => {
    if (!playerName.trim()) return setError('Enter your name');
    if (!joinCode.trim()) return setError('Enter a lobby code');
    setError('');
    setConnecting(true);
    socketRef.current.emit('join-lobby', {
      code: joinCode.trim().toUpperCase(),
      playerName: playerName.trim(),
      playerId: getPlayerId(),
    }, (res) => {
      setConnecting(false);
      if (res.ok) {
        setLobbyCode(joinCode.trim().toUpperCase());
        setIsHost(false);
        setView('waiting');
      } else {
        setError(res.error);
      }
    });
  }, [joinCode, playerName]);

  const startGame = () => {
    if (socketRef.current) socketRef.current.emit('start-game');
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/lobby?join=${lobbyCode}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(lobbyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // When game starts, redirect to game with lobby params
  useEffect(() => {
    if (view === 'playing' && lobbyCode) {
      window.location.href = `/game?lobby=${lobbyCode}`;
    }
  }, [view, lobbyCode]);

  // ─── MENU VIEW ─────────────────────────────────────────────────
  if (view === 'menu') {
    return (
      <div className="relative min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased">
        <div className="absolute inset-0 bg-grid opacity-[0.2] bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_50%_-10%,rgba(250,250,250,0.04),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 max-w-[440px] mx-auto px-4 flex flex-col min-h-screen">
          <header className="flex items-center h-14 shrink-0">
            <a href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="font-mono text-xs tracking-wide">Leave Sandbox</span>
            </a>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center pb-20">
            <div className="w-full space-y-6">
              <div className="text-center space-y-2">
                <h1 className="font-bold text-3xl tracking-tight text-white">
                  Create a<span className="text-emerald-500"> Lobby</span>
                </h1>
                <p className="text-sm text-zinc-500">Create a lobby and challenge your friends.</p>
                <a href="https://www.buymeacoffee.com/jshmlnd" target="_blank" rel="noopener noreferrer" className="animate-pulse text-md text-emerald-500 hover:text-emerald-300 transition-colors">
                Buy me a coffee! <Coffee size={16} className="inline-block ml-1" />
              </a>
              </div>

              {/* Name input */}
              <div className="space-y-2">
                <label className="font-mono text-[11px] tracking-widest uppercase text-zinc-500 pl-3">Display Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => saveName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-[#141416] border border-[#27272a] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#3f3f46] transition-colors font-mono"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 font-mono">{error}</p>
              )}

              {/* Game Settings */}
              <div className="space-y-3 p-4 rounded-xl bg-[#141416] border border-[#27272a]">
                <p className="font-mono text-[11px] tracking-widest uppercase text-zinc-500">Game Settings</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Rounds</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setRounds(Math.max(1, rounds - 1))} className="w-8 h-8 rounded-lg bg-[#232326] border border-[#3f3f46] text-zinc-400 hover:text-white font-mono text-sm">−</button>
                    <span className="w-8 text-center font-mono text-sm text-white font-bold">{rounds}</span>
                    <button onClick={() => setRounds(Math.min(10, rounds + 1))} className="w-8 h-8 rounded-lg bg-[#232326] border border-[#3f3f46] text-zinc-400 hover:text-white font-mono text-sm">+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Time / Round</span>
                  <select
                    value={timePerRound}
                    onChange={(e) => setTimePerRound(parseInt(e.target.value))}
                    className="px-3 py-1.5 rounded-lg bg-[#232326] border border-[#3f3f46] text-sm text-white font-mono focus:outline-none focus:border-[#52525b]"
                  >
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={90}>1m 30s</option>
                    <option value={120}>2m</option>
                    <option value={150}>2m 30s</option>
                    <option value={180}>3m</option>
                  </select>
                </div>
              </div>

              {/* Create / Join */}
              <div className="space-y-3">
                <button
                  onClick={createLobby}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors"
                >
                  <Play size={16} />
                  Create Lobby
                </button>

                <button
                  onClick={() => { if (!playerName.trim()) return setError('Enter your name'); setView('join'); }}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-[#27272a] bg-[#141416] text-sm font-medium text-zinc-200 hover:bg-[#1e1e21] hover:border-[#3f3f46] transition-colors"
                >
                  <Users size={16} />
                  Join Lobby
                </button>
              </div>

              {connecting && (
                <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                  <Loader2 size={14} className="animate-spin" />
                  Connecting to server...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── JOIN VIEW ─────────────────────────────────────────────────
  if (view === 'join') {
    return (
      <div className="relative min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased">
        <div className="absolute inset-0 bg-grid opacity-[0.2] bg-grid-fade pointer-events-none" />

        <div className="relative z-10 max-w-[440px] mx-auto px-4 flex flex-col min-h-screen">
          <header className="flex items-center h-14 shrink-0">
            <button onClick={() => { setView('menu'); setError(''); }} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="font-mono text-xs tracking-wide">Back</span>
            </button>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center pb-20">
            <div className="w-full space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-mono font-bold text-2xl tracking-tight text-white">Join Lobby</h2>
                <p className="text-sm text-zinc-500">Enter the 5-letter code from your friend</p>
              </div>

              {!playerName.trim() && (
                <div className="space-y-2">
                  <label className="font-mono text-[11px] tracking-widest uppercase text-zinc-500">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => saveName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={20}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-[#141416] border border-[#27272a] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#3f3f46] transition-colors font-mono"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="font-mono text-[11px] tracking-widest uppercase text-zinc-500 pl-3">Lobby Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
                  placeholder="XXXXX"
                  maxLength={5}
                  autoFocus={!!playerName.trim()}
                  className="w-full px-4 py-4 rounded-xl bg-[#141416] border border-[#27272a] text-center text-2xl font-mono font-bold text-white tracking-[0.3em] placeholder:text-zinc-700 placeholder:tracking-[0.3em] focus:outline-none focus:border-[#3f3f46] transition-colors uppercase"
                />
              </div>

              {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

              <button
                onClick={joinLobby}
                disabled={!playerName.trim() || joinCode.length !== 5 || connecting}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {connecting ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
                Join Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── WAITING ROOM ──────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased">
      <div className="absolute inset-0 bg-grid opacity-[0.2] bg-grid-fade pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_50%_-10%,rgba(250,250,250,0.04),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-[720px] mx-auto px-4 flex flex-col min-h-screen">
        <header className="flex items-center h-14 shrink-0">
          <button onClick={() => { window.location.href = '/lobby'; }} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="font-mono text-xs tracking-wide">Leave</span>
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center pb-20">
          <div className="w-full space-y-6">
            <div className="text-center space-y-3">
              <h2 className="font-mono font-bold text-2xl tracking-tight text-white">
                Waiting Room
              </h2>

              {/* Lobby code display */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#141416] border border-[#27272a]">
                <span className="font-mono text-[11px] tracking-widest uppercase text-zinc-500">Code</span>
                <span className="font-mono text-2xl font-bold text-white tracking-[0.25em]">{lobbyCode}</span>
                <button onClick={copyCode} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#232326] transition-colors">
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>

              <p className="text-xs text-zinc-600">Share this code with friends to join</p>

              {/* Invite Link */}
              {isHost && (
                <button
                  onClick={copyInviteLink}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#27272a] bg-[#141416] text-xs font-mono text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-colors"
                >
                  {linkCopied ? <Check size={12} className="text-emerald-500" /> : <Link2 size={12} />}
                  {linkCopied ? 'Link copied!' : 'Copy invite link'}
                </button>
              )}

              {/* Game Settings Display */}
              <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-zinc-500">
                <span>{rounds} round{rounds !== 1 ? 's' : ''}</span>
                <span className="text-zinc-700">·</span>
                <span>{timePerRound}s / round</span>
              </div>
            </div>

            {/* Players list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-widest uppercase text-zinc-500 pl-3">Players</span>
                <span className="font-mono text-xs text-zinc-600 pr-4">{players.length}/30</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[min(58vh,520px)] overflow-y-auto pr-1">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#141416] border border-[#27272a]">
                    <div className="w-8 h-8 rounded-full bg-[#232326] flex items-center justify-center font-mono text-xs font-bold text-zinc-400">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white truncate">{p.name}</span>
                      {p.id === socket?.id && (
                        <span className="ml-2 text-[10px] font-mono text-zinc-600">(you)</span>
                      )}
                    </div>
                    {p.isHost && (
                      <span className="text-[10px] font-mono text-emerald-500 tracking-wider uppercase">host</span>
                    )}
                  </div>
                ))}
              </div>

              {players.length < 2 && (
                <p className="text-center text-xs text-zinc-600 py-4">
                  Waiting for more players to join...
                </p>
              )}
            </div>

            {/* Start button (host only) */}
            {isHost ? (
              <button
                onClick={startGame}
                disabled={players.length < 1}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play size={16} />
                Start Game
              </button>
            ) : (
              <div className="text-center py-3 text-sm text-zinc-500 font-mono">
                Waiting for host to start...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
