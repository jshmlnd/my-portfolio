# Comprehensive System Architecture & Design Specification: Wordle Clone ("WordCraft")

A production-grade, highly available, and scalable architecture specification for a Wordle-style daily word game platform.

---

## Executive Summary

This specification outlines the technical architecture, data models, algorithm implementations, API contracts, security practices, and deployment topology for **WordCraft**—a web-based daily word guessing game.

### Architectural Goals
- **Sub-100ms Latency:** Instant response times for word verification and guess evaluations.
- **Offline-First Resilience:** Graceful local gameplay support with eventual cloud synchronization.
- **Fairness & Security:** Robust mitigation against solution extraction, time-travel exploits, and leaderboard tampering.
- **Cost Efficiency:** Serverless-friendly edge architecture with minimal database write amplification.

---

## 1. High-Level Architecture

The platform follows an **Edge-First Serverless/Micro-Services Architecture** leveraging Edge Networks for asset delivery and static evaluation logic, paired with an API cluster for user accounts, global statistics, and authenticated anti-cheat game completion validation.

```
                                      +------------------------+
                                      |     Client Browser     |
                                      |  (React/Next.js PWA)   |
                                      +-----------+------------+
                                                  |
                                    +-------------+-------------+
                                    |                           |
                            Static Assets /             API Calls / Sync
                           Deterministic Evaluation     (HTTPS/WSS)
                                    |                           |
                                    v                           v
                        +-----------------------+   +-----------------------+
                        |     CDN / Edge        |   |    API Gateway        |
                        | (Cloudflare / Vercel) |   | (Kong / Cloudflare)   |
                        +-----------------------+   +-----------+-----------+
                                                                |
                                             +------------------+------------------+
                                             |                                     |
                                             v                                     v
                                 +-----------------------+             +-----------------------+
                                 |  Game Engine Service  |             |  User & Stats Service |
                                 |  (Node.js / Go API)   |             |  (Node.js / Go API)   |
                                 +-----------+-----------+             +-----------+-----------+
                                             |                                     |
                                 +-----------+-----------+                         |
                                 |                       |                         |
                                 v                       v                         v
                     +-----------------------+ +-------------------+   +-----------------------+
                     |  Redis Cluster        | | Key Vault / KMS   |   | PostgreSQL Database   |
                     | (Leaderboards/Cache)  | | (Daily Word Keys) |   | (User Accounts/Stats) |
                     +-----------------------+ +-------------------+   +-----------------------+
```

### Component Breakdown

| Layer | Technology Choice | Core Responsibility |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React), TypeScript, Tailwind CSS, Zustand | Interactive grid UI, keyboard state management, sound FX, local state caching. |
| **Edge Layer** | Cloudflare Workers / Vercel Edge Functions | SSR HTML delivery, caching word banks, validating timestamp headers. |
| **API Layer** | Node.js (Fastify) or Go (Gin) microservices | Session authentication, game completion verification, statistics calculation. |
| **Caching/KV** | Upstash Redis or Redis Cluster | Active daily word lookup, rate limiting, real-time leaderboard caching. |
| **Database** | PostgreSQL (Supabase / AWS RDS Aurora) | Persisted user accounts, historical puzzle logs, lifetime statistics. |

---

## 2. Dynamic Puzzle Resolution & Seed Engine

To ensure daily puzzles are deterministic globally without exposing the full answer key to client reverse-engineering, WordCraft utilizes a seed-based offset calculation coupled with backend HMAC verification.

### Answer Selection Mechanics
1. **Word Bank Separation:** Two distinct lists:
   - **Target Words (~2,300 words):** Curated, well-known 5-letter words used for answers.
   - **Allowed Guesses (~10,600 words):** Extended list of valid English words accepted as guesses.
2. **Offset Resolution Formula:**

$$\text{Puzzle Index} = (\text{Epoch Days since Base Date}) \pmod {\text{Target Words Count}}$$

where Epoch Days is calculated relative to UTC midnight ($00:00:00\text{ UTC}$).

```typescript
// Core Offset Resolution Logic
const EPOCH_START_TIMESTAMP = Date.UTC(2026, 0, 1); // Jan 1, 2026

export function getPuzzleNumber(targetDate: Date = new Date()): number {
  const utcNow = Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate()
  );
  const diffInMs = utcNow - EPOCH_START_TIMESTAMP;
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

export function getDailyWordIndex(puzzleNumber: number, totalWords: number): number {
  // Linear Congruential Pseudo-Random Permutation to prevent predictable sequential words
  const a = 1103515245;
  const c = 12345;
  const m = Math.pow(2, 31);
  const permutedIndex = (a * puzzleNumber + c) % m;
  return permutedIndex % totalWords;
}
```

---

## 3. Guess Evaluation Engine & Algorithm

The core evaluation algorithm handles exact character matches (**Green**), misplaced letters (**Yellow**), and non-existent letters (**Gray**), correctly managing **duplicate character occurrences**.

### Evaluation Rules Matrix
- **Correct (`GREEN`):** Letter exists in the target word at the exact position.
- **Present (`YELLOW`):** Letter exists in the target word, but position is incorrect AND the occurrence count has not been exhausted by prior `GREEN` or `YELLOW` allocations.
- **Absent (`GRAY`):** Letter does not exist in the target word, or all occurrences have been satisfied.

### Two-Pass Algorithm (TypeScript)

```typescript
export type EvaluationResult = 'GREEN' | 'YELLOW' | 'GRAY';

export interface EvaluatedLetter {
  letter: string;
  result: EvaluationResult;
}

export function evaluateGuess(guessWord: string, targetWord: string): EvaluatedLetter[] {
  const guess = guessWord.toUpperCase();
  const target = targetWord.toUpperCase();
  
  if (guess.length !== 5 || target.length !== 5) {
    throw new Error("Invalid word length: must be exactly 5 letters.");
  }

  const result: EvaluationResult[] = new Array(5).fill('GRAY');
  const targetLetterCounts: Record<string, number> = {};

  // Build target letter frequency map
  for (const char of target) {
    targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
  }

  // PASS 1: Identify all exact positional matches (GREEN)
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'GREEN';
      targetLetterCounts[guess[i]] -= 1;
    }
  }

  // PASS 2: Identify misplaced matches (YELLOW) and non-matches (GRAY)
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'GREEN') continue;

    const char = guess[i];
    if (targetLetterCounts[char] && targetLetterCounts[char] > 0) {
      result[i] = 'YELLOW';
      targetLetterCounts[char] -= 1;
    } else {
      result[i] = 'GRAY';
    }
  }

  return guess.split('').map((letter, index) => ({
    letter,
    result: result[index],
  }));
}
```

---

## 4. Data Models & Database Schema

The database relies on PostgreSQL with strict relational constraints and optimized indexing for daily aggregate aggregation.

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(32) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255), -- NULL for guest accounts
    is_guest BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily Puzzles Catalog
CREATE TABLE puzzles (
    puzzle_number INT PRIMARY KEY,
    puzzle_date DATE UNIQUE NOT NULL,
    target_word_hash VARCHAR(64) NOT NULL, -- SHA-256 of target word + salt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Game History & Attempts
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    puzzle_number INT NOT NULL REFERENCES puzzles(puzzle_number),
    status VARCHAR(12) NOT NULL CHECK (status IN ('IN_PROGRESS', 'WON', 'LOST')),
    guess_count INT NOT NULL DEFAULT 0 CHECK (guess_count BETWEEN 0 AND 6),
    guesses JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of strings e.g. ["CRANE", "TOWER"]
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_puzzle UNIQUE (user_id, puzzle_number)
);

-- Aggregate User Statistics (Materialized / Aggregated Pattern)
CREATE TABLE user_statistics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    games_played INT NOT NULL DEFAULT 0,
    games_won INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    max_streak INT NOT NULL DEFAULT 0,
    guess_1_count INT NOT NULL DEFAULT 0,
    guess_2_count INT NOT NULL DEFAULT 0,
    guess_3_count INT NOT NULL DEFAULT 0,
    guess_4_count INT NOT NULL DEFAULT 0,
    guess_5_count INT NOT NULL DEFAULT 0,
    guess_6_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_game_sessions_user_puzzle ON game_sessions(user_id, puzzle_number);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_puzzles_date ON puzzles(puzzle_date);
```

---

## 5. API Interface Specification

### `POST /api/v1/game/submit-guess`
Validates and logs a user's guess attempt.

#### Request Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Request Payload
```json
{
  "puzzleNumber": 245,
  "guess": "CRANE",
  "clientTimestamp": "2026-09-03T12:00:00.000Z"
}
```

#### Response Payload (`200 OK`)
```json
{
  "puzzleNumber": 245,
  "guess": "CRANE",
  "validWord": true,
  "evaluation": [
    { "letter": "C", "result": "GRAY" },
    { "letter": "R", "result": "YELLOW" },
    { "letter": "A", "result": "GRAY" },
    { "letter": "N", "result": "GREEN" },
    { "letter": "E", "result": "GRAY" }
  ],
  "gameStatus": "IN_PROGRESS",
  "remainingAttempts": 5
}
```

#### Response Payload — Game Won (`200 OK`)
```json
{
  "puzzleNumber": 245,
  "guess": "TOWER",
  "validWord": true,
  "evaluation": [
    { "letter": "T", "result": "GREEN" },
    { "letter": "O", "result": "GREEN" },
    { "letter": "W", "result": "GREEN" },
    { "letter": "E", "result": "GREEN" },
    { "letter": "R", "result": "GREEN" }
  ],
  "gameStatus": "WON",
  "remainingAttempts": 3,
  "stats": {
    "gamesPlayed": 42,
    "winPercentage": 95.2,
    "currentStreak": 12,
    "maxStreak": 18
  }
}
```

---

## 6. Frontend State Management Architecture

The UI leverages a dual-layer synchronization model: instantaneous reactive rendering via local Zustand state, with background debounced persistence to IndexedDB/LocalStorage and HTTP API synchronization.

```
       [ Keypress Event ]
              |
              v
     [ Input Controller ]
              |
      +-------+-------+
      |               |
      v               v
 [ Validate ]   [ Reject ] -> Render Shake Animation
      |
      v
 [ Render Tile Flipping Animation ]
      |
      v
 [ Update Local State (Zustand) ]
      |
      +---------------+---------------+
      |                               |
      v                               v
 [ Persist IndexedDB ]       [ Sync to Backend API ]
```

---

## 7. Anti-Cheat & Security Framework

To protect leaderboard integrity and puzzle enjoyment, multiple layers of anti-cheat controls are enforced:

1. **Answer Obfuscation:** Target words are never shipped in bulk static client JS packages. Evaluation occurs locally via obscure hash verification or at API gateways.
2. **Clock Tampering Prevention:** Server timestamps dictate puzzle validity. Submissions with client timestamps differing by >300 seconds from UTC server time trigger re-synchronization.
3. **Payload Signing:** Requests contain an HMAC token derived from session keys and guess payloads to block script injection.
4. **Rate Limiting:** IP and Account-level bucket limits:
   - Max 10 valid guesses per minute per user.
   - Max 60 word-dictionary validation lookups per minute.

---

## 8. Deployment & CI/CD Pipeline

```
  [ GitHub Repository ]
            |
            v
   [ GitHub Actions CI ] 
   - Lint & TypeCheck
   - Unit Test Execution
   - Docker Container Builds
            |
            +-------------------+-------------------+
            |                                       |
            v                                       v
 [ Web App Deploy ]                       [ Database Migration ]
 (Vercel / Edge Network)                   (Prisma / Flyway Engine)
            |                                       |
            +-------------------+-------------------+
                                |
                                v
                       [ Production Cloud ]
```

### Infrastructure Summary
- **CDN / Edge Network:** Cloudflare Pages / Vercel Edge Runtime.
- **Application Server Platform:** AWS ECS (Fargate) or Fly.io container instances auto-scaled based on CPU/Request throughput.
- **Managed Database:** AWS Aurora PostgreSQL Serverless v2.
- **Monitoring & Observability:** Datadog for API metrics, Sentry for real-time frontend runtime error logging.
