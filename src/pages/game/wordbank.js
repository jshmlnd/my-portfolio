/**
 * WordCraft — Customizable Word Bank
 *
 * Edit the TARGET_WORDS array below to customize your game.
 *
 * TARGET_WORDS: 5-letter words used as daily puzzle answers (~2,300 recommended)
 *
 * All words must be exactly 5 letters and contain only A–Z characters.
 * Words are case-insensitive at runtime.
 *
 * Guess validation is done via the Dictionary API:
 * https://dictionary-api.joshuaklein-malonda.workers.dev/exists/:word
 */

// ─── Target Words (answers) ────────────────────────────────────────
// These are the words that can be chosen as the daily puzzle solution.
export const TARGET_WORDS = [
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again',
];

// ─── Seed Configuration ────────────────────────────────────────────
// Change this date to shift the entire puzzle calendar.
// Words rotate in order from TARGET_WORDS based on days since this epoch.
export const EPOCH_START = new Date(Date.UTC(2026, 0, 1)); // Jan 1, 2026

// ─── Game Configuration ────────────────────────────────────────────
export const GAME_CONFIG = {
  maxGuesses: 6,
  wordLength: 5,
  revealDelay: 150, // ms between each tile flip animation
  shakeDelay: 180,  // ms for shake animation on invalid guess
};
