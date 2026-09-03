import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, X, Users, Coffee, Gamepad2, PartyPopper, Timer, Trophy, Skull, Hourglass, Medal } from 'lucide-react';
import { io } from 'socket.io-client';
import { TARGET_WORDS, WORD_CLUES, EPOCH_START, GAME_CONFIG, getWordLetters, normalizeWord } from './wordbank';

// ─── Helpers ───────────────────────────────────────────────────────
function getDailyWord() {
  const now = new Date();
  const utcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceEpoch = Math.floor((utcMs - EPOCH_START.getTime()) / (1000 * 60 * 60 * 24));
  const idx = Math.abs(daysSinceEpoch) % TARGET_WORDS.length;
  return normalizeWord(TARGET_WORDS[idx]);
}

function getPuzzleNumber() {
  const now = new Date();
  const utcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((utcMs - EPOCH_START.getTime()) / (1000 * 60 * 60 * 24));
}

function evaluateGuess(guess, target) {
  guess = guess.replace(/\s/g, '');
  target = target.replace(/\s/g, '');
  const len = target.length;
  const result = Array(len).fill('absent');
  const targetCounts = {};
  for (const c of target) targetCounts[c] = (targetCounts[c] || 0) + 1;

  for (let i = 0; i < len; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      targetCounts[guess[i]]--;
    }
  }
  for (let i = 0; i < len; i++) {
    if (result[i] === 'correct') continue;
    if (targetCounts[guess[i]] && targetCounts[guess[i]] > 0) {
      result[i] = 'present';
      targetCounts[guess[i]]--;
    }
  }
  return result;
}

function loadGameState() {
  try {
    const raw = localStorage.getItem('wordcraft_game');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveGameState(state) {
  try { localStorage.setItem('wordcraft_game', JSON.stringify(state)); } catch {}
}

// ─── Keyboard Layout ───────────────────────────────────────────────
const KB_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

// ─── Color map ─────────────────────────────────────────────────────
const TILE_COLORS = {
  correct: 'bg-emerald-600 border-emerald-600 text-white',
  present: 'bg-yellow-500 border-yellow-500 text-white',
  absent:  'bg-[#3f3f46] border-[#3f3f46] text-white',
  idle:    'bg-[#18181b] border-[#3f3f46] text-white',
};

const KEY_COLORS = {
  correct: 'bg-emerald-600 text-white border-emerald-700',
  present: 'bg-yellow-500 text-white border-yellow-600',
  absent:  'bg-[#27272a] text-zinc-500 border-[#3f3f46]',
  idle:    'bg-[##111111] text-zinc-200 border-[#3f3f46] hover:bg-[#27272a]',
};

// ─── Main Component ────────────────────────────────────────────────
const Game = () => {
  const puzzleNumber = useMemo(() => getPuzzleNumber(), []);

  const [guesses, setGuesses] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // playing | won | lost
  const [evaluations, setEvaluations] = useState([]);
  const [flippingRow, setFlippingRow] = useState(-1);
  const [revealedTiles, setRevealedTiles] = useState(new Set());
  const [shakeRow, setShakeRow] = useState(-1);
  const [toast, setToast] = useState('');
  const [showLeaveToast, setShowLeaveToast] = useState(false);
  const [keyStatus, setKeyStatus] = useState({});
  const [viewportWidth, setViewportWidth] = useState(() => document.documentElement.clientWidth);
  const inputRef = useRef(null);
  const toastTimer = useRef(null);

  // ─── Multiplayer state ─────────────────────────────────────────
  const [searchParams] = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const isMultiplayer = !!lobbyCode;
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [multiplayerWord, setMultiplayerWord] = useState(null);
  const [wordClue, setWordClue] = useState('');
  const [showPlayers, setShowPlayers] = useState(false);
  const [waitingForServer, setWaitingForServer] = useState(false);

  // Round & timer state (multiplayer)
  const [wordLength, setWordLength] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [roundResults, setRoundResults] = useState(null);
  const [showRoundResults, setShowRoundResults] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  const target = useMemo(() => isMultiplayer ? (multiplayerWord || 'A'.repeat(wordLength)) : getDailyWord(), [isMultiplayer, multiplayerWord, wordLength]);
  const wordLetters = useMemo(() => getWordLetters(target), [target]);
  const wordLen = wordLetters.length;
  const wordBreaks = useMemo(() => {
    const breaks = new Set();
    let letterIndex = 0;
    target.split(' ').slice(0, -1).forEach((part) => {
      letterIndex += part.length;
      breaks.add(letterIndex - 1);
    });
    return breaks;
  }, [target]);
  const clue = isMultiplayer
    ? wordClue
    : WORD_CLUES[TARGET_WORDS.find((word) => normalizeWord(word) === target)] || '';

  // ─── Multiplayer socket connection ────────────────────────────
  useEffect(() => {
    if (!isMultiplayer) return;
    const SERVER_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : 'https://game-server-wl53.onrender.com';
    const s = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('players-update', (p) => setPlayers(p));

    s.on('round-started', ({ wordLength: wl, roundNumber, totalRounds: tr, timeRemaining: trl, clue }) => {
      setWordLength(wl);
      setCurrentRound(roundNumber);
      setTotalRounds(tr);
      setTimeRemaining(trl);
      setWordClue(clue || '');
      setGuesses([]);
      setCurrentInput('');
      setGameStatus('playing');
      setEvaluations([]);
      setKeyStatus({});
      setFlippingRow(-1);
      setRevealedTiles(new Set());
      setRoundResults(null);
      setShowRoundResults(false);
      setIsGameOver(false);
      setRedirectCountdown(0);
      showToast(`Round ${roundNumber}/${tr} — ${wl} letters`, Gamepad2);
    });

    s.on('timer-update', ({ timeRemaining: trl }) => {
      setTimeRemaining(trl);
    });

    s.on('round-over', ({ roundNumber, word, results, leaderboard: lb }) => {
      setRoundResults({ roundNumber, word, results });
      setShowRoundResults(true);
      setLeaderboard(lb);
      setMultiplayerWord(word);
    });

    s.on('game-over', ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      setIsGameOver(true);
      setShowLeaderboard(true);
      setShowRoundResults(false);
    });

    // Request current round state (handles late join after game already started)
    const savedName = localStorage.getItem('wc_name') || 'Player';
    s.emit('join-game', { code: lobbyCode, playerName: savedName }, (res) => {
      if (res && !res.ok) {
        showToast('Lobby not found');
      }
    });

    return () => { s.disconnect(); };
  }, [isMultiplayer, lobbyCode]);

  useEffect(() => {
    if (!isGameOver) {
      setRedirectCountdown(0);
      return;
    }

    setRedirectCountdown(8);
    const redirectTimer = setInterval(() => {
      setRedirectCountdown((seconds) => {
        if (seconds <= 1) {
          clearInterval(redirectTimer);
          window.location.href = '/lobby';
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => clearInterval(redirectTimer);
  }, [isGameOver]);

  // Restore game state on mount (single player only)
  useEffect(() => {
    if (isMultiplayer) return;
    const saved = loadGameState();
    if (saved && saved.puzzleNumber === puzzleNumber) {
      setGuesses(saved.guesses || []);
      setEvaluations(saved.evaluations || []);
      setGameStatus(saved.gameStatus || 'playing');
      // Always start with clean input — partial typing shouldn't persist
      setCurrentInput('');
      // Re-save without currentInput if it was previously stored
      if (saved.currentInput) {
        saveGameState({ puzzleNumber, guesses: saved.guesses, evaluations: saved.evaluations, gameStatus: saved.gameStatus });
      }
      // Rebuild key statuses
      if (saved.evaluations) {
        const ks = {};
        saved.guesses.forEach((g, gi) => {
          saved.evaluations[gi].forEach((e, ci) => {
            const prio = { correct: 2, present: 1, absent: 0 };
            if (prio[e] > (prio[ks[g[ci]]] ?? -1)) ks[g[ci]] = e;
          });
        });
        setKeyStatus(ks);
      }
    }
  }, [puzzleNumber]);

  // Persist on change (skip in multiplayer — server is source of truth)
  useEffect(() => {
    if (isMultiplayer) return;
    if (guesses.length > 0) {
      saveGameState({ puzzleNumber, guesses, evaluations, gameStatus });
    }
  }, [guesses, evaluations, gameStatus, puzzleNumber, isMultiplayer]);

  // Focus hidden input
  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    focus();
    document.addEventListener('click', focus);
    return () => document.removeEventListener('click', focus);
  }, []);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(document.documentElement.clientWidth);
    window.addEventListener('resize', updateViewportWidth);
    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);

  const showToast = useCallback((message, Icon = null) => {
    setToast({ message, Icon });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // Shared guess animation & state logic (used by both single & multiplayer)
  const performGuess = useCallback((word, ev, serverStatus) => {
    const newGuesses = [...guesses, word];
    const newEvals = [...evaluations, ev];
    const rowIdx = guesses.length;

    // Update key statuses immediately
    const newKeyStatus = { ...keyStatus };
    const prio = { correct: 2, present: 1, absent: 0 };
    ev.forEach((e, i) => {
      if (prio[e] > (prio[newKeyStatus[word[i]]] ?? -1)) {
        newKeyStatus[word[i]] = e;
      }
    });

    // Reset any previous flip state
    setRevealedTiles(new Set());
    setCurrentInput('');

    // Force a render with letters visible in idle state before flipping
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlippingRow(rowIdx);

        for (let i = 0; i < wordLen; i++) {
          setTimeout(() => {
            setRevealedTiles((prev) => new Set([...prev, i]));
          }, i * GAME_CONFIG.revealDelay);
        }

        setTimeout(() => {
          setGuesses(newGuesses);
          setEvaluations(newEvals);
          setKeyStatus(newKeyStatus);
          setFlippingRow(-1);
          setRevealedTiles(new Set());

          const won = serverStatus === 'won' || (!isMultiplayer && word === target.replace(/\s/g, ''));
          const lost = serverStatus === 'lost' || (!isMultiplayer && newGuesses.length >= (wordLen + 1) && !won);

          if (won) {
            setGameStatus('won');
            showToast('Brilliant!', PartyPopper);
          } else if (lost) {
            setGameStatus('lost');
            if (!isMultiplayer) {
              setTimeout(() => showToast(`The word was ${target}`), 1200);
            }
          }
        }, 5 * GAME_CONFIG.revealDelay + 200);
      });
    });
  }, [guesses, evaluations, target, keyStatus, isMultiplayer, showToast, wordLen]);

  const submitGuess = useCallback(async () => {
    const word = currentInput.toUpperCase().replace(/\s/g, '');
    if (word.length !== wordLen) {
      showToast('Not enough letters');
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(-1), GAME_CONFIG.shakeDelay);
      return;
    }

    // In multiplayer, skip client-side validation — server handles it
    if (isMultiplayer && socket) {
      setWaitingForServer(true);
      socket.emit('submit-guess', { guess: word }, (response) => {
        setWaitingForServer(false);
        if (!response || !response.ok) {
          showToast('Invalid guess');
          return;
        }
        setPlayers((currentPlayers) => currentPlayers.map((player) => (
          player.id === socket.id
            ? { ...player, guessCount: response.guessCount, status: response.status }
            : player
        )));
        performGuess(word, response.evaluation, response.status);
      });
      return;
    }

    // Single-player: validate word via API (fail open if unreachable)
    const isTargetWord = TARGET_WORDS.some((targetWord) => normalizeWord(targetWord) === word);
    if (!isTargetWord) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`https://dictionary-api.joshuaklein-malonda.workers.dev/exists/${encodeURIComponent(word.toLowerCase())}`, { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        if (!data.exists) {
          showToast('Not in word list');
          setShakeRow(guesses.length);
          setTimeout(() => setShakeRow(-1), GAME_CONFIG.shakeDelay);
          return;
        }
      } catch {
        // API unreachable — fail open, accept the word
      }
    }

    const ev = evaluateGuess(word, target);
    performGuess(word, ev, word === target.replace(/\s/g, '') ? 'won' : guesses.length + 1 >= (wordLen + 1) ? 'lost' : 'playing');
  }, [currentInput, guesses, evaluations, target, keyStatus, isMultiplayer, socket, showToast, wordLen]);

  // Keyboard handler
  const handleKey = useCallback((key) => {
    if (gameStatus !== 'playing') return;
    if (flippingRow !== -1) return;
    if (waitingForServer) return;
    if (showRoundResults || showLeaderboard) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === '⌫' || key === 'BACKSPACE') {
      setCurrentInput((p) => p.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentInput.length < wordLen) {
      setCurrentInput((p) => p + key);
    }
  }, [gameStatus, flippingRow, waitingForServer, submitGuess, currentInput, wordLen, showRoundResults, showLeaderboard]);

  // Physical keyboard listener
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.code === 'Space' ? 'SPACE' : e.key.toUpperCase());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-white/10 selection:text-white antialiased">
      {/* Background grid + gradient */}
      <div className="absolute inset-0 bg-grid opacity-[0.2] bg-grid-fade pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_50%_-10%,rgba(250,250,250,0.04),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_400px_at_20%_60%,rgba(16,185,129,0.04),transparent_60%)] pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-sm font-medium text-zinc-200 shadow-xl">
            {toast.Icon && <toast.Icon size={15} className="text-emerald-400" />}
            {toast.message}
          </div>
        </div>
      )}

      {showLeaveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[min( calc(100vw-2rem),20rem)] animate-fade-in">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-zinc-200 shadow-xl">
            <span>Leave Game?</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => { window.location.href = '/lobby'; }}
                className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                Leave
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveToast(false)}
                className="rounded-md border border-[#3f3f46] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-[520px] mx-auto px-4 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between h-14 shrink-0">
          <a
            href="/lobby"
            onClick={(event) => {
              event.preventDefault();
              setShowLeaveToast(true);
            }}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-mono text-xs tracking-wide hidden sm:inline">Leave</span>
          </a>

          <a href="https://buymeacoffee.com/jshmlnd" className="font-mono font-light text-sm tracking-wide text-emerald-500">
            Buy me a coffee!<Coffee size={14} className="inline-block ml-1" />
          </a>

          <div className="flex items-center gap-2">
            {isMultiplayer && (
              <button
                onClick={() => setShowPlayers(!showPlayers)}
                className="relative p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-[#18181b] transition-colors"
                aria-label="Players"
              >
                <Users size={18} />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center text-[8px] font-mono font-bold text-white">
                  {players.length}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Lobby badge + round info */}
        {isMultiplayer && (
          <div className="flex items-center justify-center gap-2 pb-3 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141416] border border-[#27272a] text-[11px] font-mono text-zinc-400 tracking-wider">
              <Users size={12} />
              LOBBY
              <span className="text-white font-bold">{lobbyCode}</span>
              <span className="text-zinc-600">·</span>
              <span>{players.length} player{players.length !== 1 ? 's' : ''}</span>
            </span>
          </div>
        )}
        {isMultiplayer && currentRound > 0 && (
          <div className="flex items-center justify-center gap-3 pb-2">
            <span className="text-[11px] font-mono text-zinc-500">
              Round {currentRound}/{totalRounds}
            </span>
            {timeRemaining !== null && (
              <span className={`text-[11px] font-mono font-bold ${timeRemaining <= 10 ? 'text-red-400' : timeRemaining <= 30 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                <Timer size={13} /> {timeRemaining}s
              </span>
            )}
          </div>
        )}
        {clue && (
          <p className="text-center text-xs text-zinc-500 pb-2">
            Clue: <span className="text-zinc-300">{clue}</span>
          </p>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-[#232326] mb-4" />

        {/* Grid */}
        <div className="flex-1 flex flex-col items-center justify-start pt-2">
          {(() => {
            const maxGuesses = GAME_CONFIG.maxGuesses;
            const tileGap = 5;
            const boardWidth = Math.min(460, Math.max(0, viewportWidth - 48));
            const tileSize = Math.max(1, Math.min(68, Math.floor((boardWidth - (wordLen - 1) * tileGap - wordBreaks.size * 8) / wordLen)));
            const tileFontSize = Math.max(8, Math.min(24, Math.floor(tileSize * 0.42)));
            return (
              <div className="flex w-full max-w-[460px] flex-col items-center gap-[5px] mb-6" style={{ width: boardWidth }}>
                {Array.from({ length: maxGuesses }).map((_, rowIdx) => {
                  const guess = guesses[rowIdx] || (rowIdx === guesses.length && gameStatus === 'playing' ? currentInput : '');
                  const isFlipping = flippingRow === rowIdx;
                  const isShaking = shakeRow === rowIdx;
                  const evalRow = evaluations[rowIdx];

                  return (
                    <div
                      key={rowIdx}
                      className={`grid ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                      style={{
                        width: '100%',
                        gridTemplateColumns: `repeat(${wordLetters.length}, minmax(0, 1fr))`,
                        columnGap: tileGap,
                      }}
                    >
                      {wordLetters.map((_, colIdx) => {
                        const letter = guess[colIdx] || '';
                        const isFlippingRow = isFlipping;
                        const isAlreadySubmitted = evalRow && !isFlippingRow;
                        const isCurrentlyRevealing = isFlippingRow && revealedTiles.has(colIdx);
                        const showColor = isAlreadySubmitted || isCurrentlyRevealing;
                        const colorClass = showColor && evalRow
                          ? TILE_COLORS[evalRow[colIdx]]
                          : letter
                          ? TILE_COLORS.idle
                          : 'bg-[#0f0f10] border-[#232326]';

                        return (
                          <div
                            key={colIdx}
                            style={{ height: tileSize, fontSize: tileFontSize }}
                            className={`flex min-w-0 items-center justify-center rounded-xl border-2 font-mono font-bold uppercase transition-colors duration-200 ${colorClass} ${
                              wordBreaks.has(colIdx) ? 'mr-2' : ''
                            } ${
                              isCurrentlyRevealing ? 'animate-[flipTile_0.3s_ease-in-out]' : ''
                            }`}
                          >
                            {letter}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Keyboard */}
        <div className="pb-6 pt-2 shrink-0">
          {KB_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-[5px] mb-[5px]">
              {row.map((key) => {
                const wide = key === 'ENTER' || key === '⌫' || key === 'SPACE';
                const status = keyStatus[key] || 'idle';
                return (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    className={`h-[52px] rounded-lg border font-mono text-xs font-semibold uppercase tracking-wider transition-colors select-none active:scale-95 ${
                      wide ? 'flex-[1.6] min-w-0' : 'flex-1 min-w-0'
                    } ${KEY_COLORS[status]}`}
                  >
                    {key === '⌫' ? '⌫' : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Players Panel (multiplayer) ─────────────────────────── */}
      {showPlayers && isMultiplayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPlayers(false)}>
          <div
            className="w-full max-w-[400px] rounded-2xl border border-[#27272a] bg-[#0f0f10] p-6 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-mono font-bold text-lg text-white">Players</h2>
              <button onClick={() => setShowPlayers(false)} className="p-1 text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
              {players.map((p) => {
                const isMe = socket && p.id === socket.id;
                const StatusIcon = p.status === 'won' ? Trophy : p.status === 'lost' ? Skull : Hourglass;
                return (
                  <div key={p.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isMe ? 'bg-[#141416] border-emerald-600/30' : 'bg-[#141416] border-[#27272a]'}`}>
                    <div className="w-9 h-9 rounded-full bg-[#232326] flex items-center justify-center font-mono text-sm font-bold text-zinc-300">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{p.name}</span>
                        {isMe && <span className="text-[10px] font-mono text-zinc-600">(you)</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-zinc-500">
                          {p.guessCount} guess{p.guessCount !== 1 ? 'es' : ''}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400">
                          {p.totalScore || 0} pts
                        </span>
                        {p.guessCount > 0 && (
                          <span className="text-[11px] font-mono text-zinc-600">·</span>
                        )}
                        {p.guessCount > 0 && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: Math.min(p.guessCount, 6) }).map((_, i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-600/60" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <StatusIcon size={17} className={p.status === 'won' ? 'text-yellow-400' : p.status === 'lost' ? 'text-red-400' : 'text-zinc-500'} />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#232326]">
              <p className="text-[11px] font-mono text-zinc-600 text-center">
                {players.filter(p => p.status === 'playing').length} still playing
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Round Results Overlay ──────────────────────────────── */}
      {showRoundResults && roundResults && !isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[400px] rounded-2xl border border-[#27272a] bg-[#0f0f10] p-6 shadow-2xl animate-scale-in">
            <div className="text-center mb-5">
              <h2 className="font-mono font-bold text-lg text-white">
                Round {roundResults.roundNumber} Over
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                The word was <span className="text-emerald-400 font-mono font-bold">{roundResults.word}</span>
              </p>
              {clue && <p className="text-xs text-zinc-600 mt-2">Clue: {clue}</p>}
            </div>

            <div className="space-y-2 mb-5">
              {roundResults.results.sort((a, b) => (a.finishOrder || 999) - (b.finishOrder || 999)).map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#141416] border border-[#27272a]">
                  <span className="text-sm font-mono text-zinc-400 w-6 text-center">
                    {r.finishOrder ? `#${r.finishOrder}` : '—'}
                  </span>
                  <span className="flex-1 text-sm font-medium text-white">{r.name}</span>
                  <span className={`text-sm font-mono font-bold ${r.score > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    +{r.score}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">
                    {r.totalScore} pts
                  </span>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-zinc-600 font-mono">
              Next round starting soon...
            </p>
          </div>
        </div>
      )}

      {/* ─── Final Leaderboard ───────────────────────────────────── */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => isGameOver && setShowLeaderboard(false)}>
          <div className="w-full max-w-[400px] rounded-2xl border border-[#27272a] bg-[#0f0f10] p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <h2 className="font-mono font-bold text-lg text-white">
                <span className="flex items-center justify-center gap-2">
                  {isGameOver && <Trophy size={18} className="text-yellow-400" />}
                  {isGameOver ? 'Final Leaderboard' : 'Leaderboard'}
                </span>
              </h2>
            </div>

            <div className="space-y-2">
              {leaderboard.map((p) => {
                const medalColor = p.rank === 1 ? 'text-yellow-400' : p.rank === 2 ? 'text-zinc-300' : 'text-amber-600';
                return (
                  <div key={p.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${p.rank === 1 ? 'bg-emerald-600/10 border-emerald-600/30' : 'bg-[#141416] border-[#27272a]'}`}>
                    <span className="flex items-center justify-center w-8 text-lg">
                      {p.rank <= 3 ? <Medal size={19} className={medalColor} /> : `#${p.rank}`}
                    </span>
                    <span className="flex-1 text-sm font-medium text-white">{p.name}</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{p.totalScore} pts</span>
                  </div>
                );
              })}
            </div>

            {isGameOver && (
              <div className="mt-5 pt-4 border-t border-[#232326] flex flex-col items-center gap-3">
                <p className="text-xs text-zinc-500 font-mono">
                  Returning to lobby in {redirectCountdown}s
                </p>
                <button
                  onClick={() => { window.location.href = '/lobby'; }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors"
                >
                  Back to Lobby
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes flipTile {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }
      `}</style>
    </div>
  );
};

export default Game;
