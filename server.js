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
});

// ─── Word Bank (same as client) ────────────────────────────────────
import { TARGET_WORDS } from './src/pages/game/wordbank.js';

// ─── In-memory lobby storage ───────────────────────────────────────
const lobbies = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function evaluateGuess(guess, target) {
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

function pickRandomWords(count) {
  const pool = [...TARGET_WORDS];
  const picked = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx].toUpperCase());
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
    const score = i < 3 ? pts[i] : 1;
    p.roundScore = score;
    p.totalScore = (p.totalScore || 0) + score;
    results.push({ id: p.id, name: p.name, score, totalScore: p.totalScore, finishOrder: i + 1, status: 'won' });
  });
  lobby.players.filter(p => p.status !== 'won').forEach(p => {
    p.roundScore = 0;
    results.push({ id: p.id, name: p.name, score: 0, totalScore: p.totalScore || 0, finishOrder: null, status: p.status });
  });
  return results;
}

function getLeaderboard(lobby) {
  return lobby.players
    .map(p => ({ id: p.id, name: p.name, totalScore: p.totalScore || 0 }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

function startRound(io, lobby) {
  lobby.currentRound = (lobby.currentRound || 0) + 1;
  lobby.target = lobby.words[lobby.currentRound - 1];
  lobby.wordLength = lobby.target.length;
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
    name: p.name,
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

  socket.on('create-lobby', ({ playerName, settings }, cb) => {
    let code;
    do { code = generateCode(); } while (lobbies.has(code));

    const lobbySettings = {
      rounds: Math.min(Math.max(parseInt(settings?.rounds) || 3, 1), 10),
      timePerRound: Math.min(Math.max(parseInt(settings?.timePerRound) || 60, 15), 180),
    };

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

  socket.on('join-lobby', ({ code, playerName }, cb) => {
    const lobby = lobbies.get(code);
    if (!lobby) return cb({ ok: false, error: 'Lobby not found' });
    if (lobby.status !== 'waiting') return cb({ ok: false, error: 'Game already in progress' });
    if (lobby.players.length >= 8) return cb({ ok: false, error: 'Lobby is full (max 8)' });

    lobby.players.push({
      id: socket.id,
      name: playerName || `Player ${lobby.players.length + 1}`,
      guesses: [],
      evaluations: [],
      status: 'playing',
      finishedAt: null,
    });
    currentLobby = code;
    socket.join(code);
    cb({ ok: true, isHost: false });
    broadcastPlayers(io, code);
    console.log(`[Lobby ${code}] ${playerName} joined (${lobby.players.length} players)`);
  });

  socket.on('start-game', () => {
    if (!currentLobby) return;
    const lobby = lobbies.get(currentLobby);
    if (!lobby || lobby.hostId !== socket.id) return;
    if (lobby.status !== 'waiting') return;

    lobby.words = pickRandomWords(lobby.settings.rounds);
    lobby.players.forEach(p => { p.totalScore = 0; });

    // Tell Lobby clients to redirect to the game page
    io.to(lobby.code).emit('game-started');

    // Small delay so Lobby has time to redirect before round-started fires
    setTimeout(() => startRound(io, lobby), 500);
    console.log(`[Lobby ${currentLobby}] Game started — ${lobby.settings.rounds} rounds`);
  });

  // Late-joining: send current round state to a socket that just connected
  socket.on('join-game', ({ code, playerName }, cb) => {
    const lobby = lobbies.get(code);
    if (!lobby) return cb?.({ ok: false, error: 'Lobby not found' });

    socket.join(code);
    currentLobby = code;

    // Re-add player if they were removed (e.g. host navigated from Lobby to Game)
    const existing = lobby.players.find(p => p.name === playerName);
    if (existing) {
      // Update socket ID so guesses route to the new connection
      existing.id = socket.id;
    } else {
      // New player joining mid-game
      lobby.players.push({
        id: socket.id,
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

    const player = lobby.players.find((p) => p.id === socket.id);
    if (!player || player.status !== 'playing') return;

    const evaluation = evaluateGuess(guess.toUpperCase(), lobby.target);
    player.guesses.push(guess.toUpperCase());
    player.evaluations.push(evaluation);

    const won = guess.toUpperCase() === lobby.target;
    if (won) {
      player.status = 'won';
      player.finishedAt = Date.now();
      player.finishOrder = ++lobby.finishCount;
    } else if (player.guesses.length >= lobby.wordLength + 1) {
      player.status = 'lost';
      player.finishedAt = Date.now();
    }

    cb({ ok: true, evaluation, status: player.status });
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
server.listen(PORT, () => {
  console.log(`\n  🎮 WordCraft Multiplayer Server`);
  console.log(`  ────────────────────────────────`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Ready for lobbies!\n`);
});
