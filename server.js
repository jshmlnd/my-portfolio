import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

// ─── Word Bank (same as client) ────────────────────────────────────
import { TARGET_WORDS, WORD_CLUES, getWordLetters, normalizeWord } from './src/pages/game/wordbank.js';

// ─── In-memory lobby storage ───────────────────────────────────────
const lobbies = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function evaluateGuess(guess, target) {
  guess = guess.replace(/\s/g, '');
  target = target.replace(/\s/g, '');
  const len = target.length;
  const result = Array(len).fill('absent');
  const targetCounts = {};
  for (const c of target) targetCounts[c] = (targetCounts[c] || 0) + 1;
  for (let i = 0; i < len; i++) {
    if (guess[i] === target[i]) { result[i] = 'correct'; targetCounts[guess[i]]--; }
  }
  for (let i = 0; i < len; i++) {
    if (result[i] === 'correct') continue;
    if (targetCounts[guess[i]] && targetCounts[guess[i]] > 0) { result[i] = 'present'; targetCounts[guess[i]]--; }
  }
  return result;
}

function createPlayerKey() {
  return `player_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function canonicalizeWord(word) {
  return normalizeWord(word).replace(/[-\s]/g, '').toUpperCase();
}

function isValidMultiplayerGuess(guess, expectedLength) {
  const cleanGuess = (guess || '').toUpperCase().replace(/\s/g, '');
  if (!cleanGuess || cleanGuess.length !== expectedLength) return false;
  const allowedWords = new Set(TARGET_WORDS.map((word) => canonicalizeWord(word)));
  return allowedWords.has(cleanGuess);
}

function pickRandomWords(count) {
  const pool = [...TARGET_WORDS];
  const picked = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(normalizeWord(pool[idx]));
    pool.splice(idx, 1);
  }
  return picked;
}

function calculateRoundScores(lobby) {
  const winners = lobby.players
    .filter(p => p.status === 'won')
    .sort((a, b) => a.finishOrder - b.finishOrder);
  const pts = [20, 10, 5];
  const results = [];
  winners.forEach((p, i) => {
    const score = i < 3 ? pts[i] : 2;
    p.roundScore = score;
    p.totalScore = (p.totalScore || 0) + score;
    results.push({
      id: p.id,
      playerId: p.playerKey,
      name: p.name,
      score,
      totalScore: p.totalScore,
      finishOrder: i + 1,
      status: 'won',
    });
  });
  lobby.players.filter(p => p.status !== 'won').forEach(p => {
    p.roundScore = 0;
    results.push({
      id: p.id,
      playerId: p.playerKey,
      name: p.name,
      score: 0,
      totalScore: p.totalScore || 0,
      finishOrder: null,
      status: p.status,
    });
  });
  return results;
}

function getLeaderboard(lobby) {
  return lobby.players
    .map(p => ({ id: p.id, playerId: p.playerKey, name: p.name, totalScore: p.totalScore || 0 }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

function startRound(io, lobby) {
  lobby.currentRound = (lobby.currentRound || 0) + 1;
  lobby.target = lobby.words[lobby.currentRound - 1];
  lobby.wordLength = getWordLetters(lobby.target).length;
  lobby.clue = lobby.clues[lobby.currentRound - 1];
  lobby.timeRemaining = lobby.settings.timePerRound;
  lobby.finishCount = 0;

  lobby.players.forEach(p => {
    p.guesses = [];
    p.evaluations = [];
    p.status = 'playing';
    p.finishedAt = null;
    p.roundScore = 0;
    p.finishOrder = null;
  });

  lobby.status = 'playing';

  io.to(lobby.code).emit('round-started', {
    wordLength: lobby.wordLength,
    roundNumber: lobby.currentRound,
    totalRounds: lobby.settings.rounds,
    timeRemaining: lobby.timeRemaining,
    clue: lobby.clue,
  });

  lobby.timerInterval = setInterval(() => {
    lobby.timeRemaining--;
    io.to(lobby.code).emit('timer-update', { timeRemaining: lobby.timeRemaining });
    if (lobby.timeRemaining <= 0) {
      endRound(io, lobby);
    }
  }, 1000);

  broadcastPlayers(io, lobby.code);
  console.log(`[Lobby ${lobby.code}] Round ${lobby.currentRound}/${lobby.settings.rounds} — word length: ${lobby.wordLength}`);
}

function endRound(io, lobby) {
  clearInterval(lobby.timerInterval);
  lobby.timerInterval = null;

  lobby.players.forEach(p => {
    if (p.status === 'playing') {
      p.status = 'lost';
      p.finishedAt = Date.now();
    }
  });

  const results = calculateRoundScores(lobby);
  const lb = getLeaderboard(lobby);

  io.to(lobby.code).emit('round-over', {
    roundNumber: lobby.currentRound,
    word: lobby.target,
    results,
    leaderboard: lb,
  });

  lobby.status = 'round-over';

  if (lobby.currentRound < lobby.settings.rounds) {
    setTimeout(() => {
      if (lobby.status === 'round-over') startRound(io, lobby);
    }, 5000);
  } else {
    setTimeout(() => {
      io.to(lobby.code).emit('game-over', { leaderboard: lb });
      lobby.status = 'finished';
      console.log(`[Lobby ${lobby.code}] Game over`);
    }, 5000);
  }

  broadcastPlayers(io, lobby.code);
}

function broadcastPlayers(io, lobbyCode) {
  const lobby = lobbies.get(lobbyCode);
  if (!lobby) return;
  const players = lobby.players.map((p) => ({
    id: p.id,
    playerId: p.playerKey,
    name: p.name,
    isHost: p.id === lobby.hostId,
    guessCount: p.guesses.length,
    status: p.status,
    finishedAt: p.finishedAt || null,
    totalScore: p.totalScore || 0,
    roundScore: p.roundScore || 0,
    finishOrder: p.finishOrder || null,
  }));
  io.to(lobbyCode).emit('players-update', players);
}

// ─── Socket.io ─────────────────────────────────────────────────────
io.on('connection', (socket) => {
  let currentLobby = null;

  socket.on('create-lobby', ({ playerName, settings, playerId }, cb) => {
    let code;
    do { code = generateCode(); } while (lobbies.has(code));

    const lobbySettings = {
      rounds: Math.min(Math.max(parseInt(settings?.rounds) || 3, 1), 10),
      timePerRound: Math.min(Math.max(parseInt(settings?.timePerRound) || 60, 15), 180),
    };
    const hostPlayerKey = playerId || createPlayerKey();
    socket.data.playerKey = hostPlayerKey;

    const lobby = {
      code,
      hostId: socket.id,
      settings: lobbySettings,
      status: 'waiting',
      currentRound: 0,
      words: [],
      target: null,
      wordLength: 5,
      players: [{
        id: socket.id,
        playerKey: hostPlayerKey,
        name: playerName || 'Player 1',
        guesses: [],
        evaluations: [],
        status: 'playing',
        finishedAt: null,
        totalScore: 0,
        roundScore: 0,
        finishOrder: null,
      }],
      timerInterval: null,
      timeRemaining: 0,
      createdAt: Date.now(),
    };
    lobbies.set(code, lobby);
    currentLobby = code;
    socket.join(code);
    cb({ ok: true, code, isHost: true, settings: lobbySettings });
    broadcastPlayers(io, code);
    console.log(`[Lobby ${code}] Created by ${playerName} — rounds: ${lobbySettings.rounds}, time: ${lobbySettings.timePerRound}s`);
  });

  socket.on('join-lobby', ({ code, playerName, playerId }, cb) => {
    const lobby = lobbies.get(code);
    if (!lobby) return cb({ ok: false, error: 'Lobby not found' });
    if (lobby.status !== 'waiting') return cb({ ok: false, error: 'Game already in progress' });
    if (lobby.players.length >= 30) return cb({ ok: false, error: 'Lobby is full (max 30)' });

    const resolvedPlayerKey = playerId || createPlayerKey();
    socket.data.playerKey = resolvedPlayerKey;

    const existing = lobby.players.find((p) => p.playerKey === resolvedPlayerKey);
    if (existing) {
      existing.id = socket.id;
      existing.name = playerName || existing.name || 'Player';
    } else {
      lobby.players.push({
        id: socket.id,
        playerKey: resolvedPlayerKey,
        name: playerName || `Player ${lobby.players.length + 1}`,
        guesses: [],
        evaluations: [],
        status: 'playing',
        finishedAt: null,
        totalScore: 0,
        roundScore: 0,
      });
    }
    currentLobby = code;
    socket.join(code);
    cb({ ok: true, isHost: false });
    broadcastPlayers(io, code);
    console.log(`[Lobby ${code}] ${playerName || 'Player'} joined (${lobby.players.length} players)`);
  });

  socket.on('start-game', () => {
    if (!currentLobby) return;
    const lobby = lobbies.get(currentLobby);
    if (!lobby || lobby.hostId !== socket.id) return;
    if (lobby.status !== 'waiting') return;

    lobby.words = pickRandomWords(lobby.settings.rounds);
    lobby.clues = lobby.words.map((word) => WORD_CLUES[TARGET_WORDS.find((target) => normalizeWord(target) === word)] || 'Think about the meaning of this word.');
    lobby.players.forEach(p => { p.totalScore = 0; });

    // Tell Lobby clients to redirect to the game page
    io.to(lobby.code).emit('game-started');

    // Small delay so Lobby has time to redirect before round-started fires
    setTimeout(() => startRound(io, lobby), 500);
    console.log(`[Lobby ${currentLobby}] Game started — ${lobby.settings.rounds} rounds`);
  });

  // Late-joining: send current round state to a socket that just connected
  socket.on('join-game', ({ code, playerName, playerId }, cb) => {
    const lobby = lobbies.get(code);
    if (!lobby) return cb?.({ ok: false, error: 'Lobby not found' });

    socket.join(code);
    currentLobby = code;

    const resolvedPlayerKey = playerId || socket.data.playerKey || createPlayerKey();
    socket.data.playerKey = resolvedPlayerKey;

    const existingBySocket = lobby.players.find(p => p.id === socket.id);
    const existingByKey = lobby.players.find(p => p.playerKey === resolvedPlayerKey);

    if (existingByKey) {
      existingByKey.id = socket.id;
      existingByKey.name = playerName || existingByKey.name || 'Player';
    } else if (existingBySocket) {
      existingBySocket.playerKey = resolvedPlayerKey;
      existingBySocket.name = playerName || existingBySocket.name || 'Player';
    } else {
      lobby.players.push({
        id: socket.id,
        playerKey: resolvedPlayerKey,
        name: playerName || `Player ${lobby.players.length + 1}`,
        guesses: [],
        evaluations: [],
        status: 'playing',
        finishedAt: null,
        totalScore: 0,
        roundScore: 0,
        finishOrder: null,
      });
    }

    // Update hostId if needed
    if (lobby.hostId && !lobby.players.find(p => p.id === lobby.hostId)) {
      lobby.hostId = lobby.players[0].id;
    }

    if (lobby.status === 'playing' && lobby.target) {
      socket.emit('round-started', {
        wordLength: lobby.wordLength,
        roundNumber: lobby.currentRound,
        totalRounds: lobby.settings.rounds,
        timeRemaining: lobby.timeRemaining,
        clue: lobby.clue,
      });
    } else if (lobby.status === 'round-over') {
      const results = calculateRoundScores(lobby);
      const lb = getLeaderboard(lobby);
      socket.emit('round-over', {
        roundNumber: lobby.currentRound,
        word: lobby.target,
        results,
        leaderboard: lb,
      });
    } else if (lobby.status === 'finished') {
      const lb = getLeaderboard(lobby);
      socket.emit('game-over', { leaderboard: lb });
    }

    broadcastPlayers(io, code);
    cb?.({ ok: true });
    console.log(`[Lobby ${code}] Socket ${socket.id} (${playerName}) joined game (${lobby.status})`);
  });

  socket.on('submit-guess', ({ guess }, cb) => {
    if (!currentLobby) return;
    const lobby = lobbies.get(currentLobby);
    if (!lobby || lobby.status !== 'playing') return;

    const player = lobby.players.find((p) => p.id === socket.id || p.playerKey === socket.data.playerKey);
    if (!player || player.status !== 'playing') return;

    const normalizedGuess = (guess || '').toUpperCase().replace(/\s/g, '');
    if (!isValidMultiplayerGuess(normalizedGuess, lobby.wordLength) || player.guesses.includes(normalizedGuess)) {
      return cb({ ok: false, error: 'Invalid guess' });
    }

    const evaluation = evaluateGuess(normalizedGuess, lobby.target);
    player.guesses.push(normalizedGuess);
    player.evaluations.push(evaluation);

    const won = normalizedGuess === lobby.target.replace(/\s/g, '');
    if (won) {
      player.status = 'won';
      player.finishedAt = Date.now();
      player.finishOrder = ++lobby.finishCount;
    } else if (player.guesses.length >= lobby.wordLength + 1) {
      player.status = 'lost';
      player.finishedAt = Date.now();
    }

    cb({ ok: true, evaluation, status: player.status, guessCount: player.guesses.length });
    broadcastPlayers(io, currentLobby);

    const allDone = lobby.players.every((p) => p.status !== 'playing');
    if (allDone) endRound(io, lobby);
  });

  socket.on('disconnect', () => {
    if (!currentLobby) return;
    const lobby = lobbies.get(currentLobby);
    if (!lobby) return;

    lobby.players = lobby.players.filter((p) => p.id !== socket.id);

    // Only delete lobby if it's still waiting and now empty
    // If the game is in progress, keep it alive so the player can rejoin via join-game
    if (lobby.players.length === 0) {
      if (lobby.status === 'waiting') {
        clearInterval(lobby.timerInterval);
        lobbies.delete(currentLobby);
        console.log(`[Lobby ${currentLobby}] Deleted (empty, was waiting)`);
        return;
      }
      // Game in progress but all sockets gone — schedule cleanup after 30s
      setTimeout(() => {
        const l = lobbies.get(currentLobby);
        if (l && l.players.length === 0) {
          clearInterval(l.timerInterval);
          lobbies.delete(currentLobby);
          console.log(`[Lobby ${currentLobby}] Deleted (abandoned mid-game)`);
        }
      }, 30000);
    }

    if (lobby.hostId === socket.id) {
      lobby.hostId = lobby.players[0]?.id || null;
    }

    if (lobby.status === 'playing') {
      const allDone = lobby.players.every((p) => p.status !== 'playing');
      if (allDone && lobby.players.length > 0) endRound(io, lobby);
    }

    broadcastPlayers(io, lobby.code);
    console.log(`[Lobby ${currentLobby}] Player disconnected (${lobby.players.length} remaining)`);
  });
});

// ─── Serve static files in production ──────────────────────────────
app.use(express.static(join(__dirname, 'dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🎮 Multiplayer Server Running`);
  console.log(`  ────────────────────────────────`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Ready for lobbies!\n`);
});
