/**
 * WordCraft — Customizable Word Bank
 *
 * Edit the TARGET_WORDS array below to customize your game.
 *
 * TARGET_WORDS: words used as daily puzzle answers (~2,300 recommended)
 *
 * Hyphens are displayed and guessed as spaces at runtime.
 *
 * Guess validation is done via the Dictionary API:
 * https://dictionary-api.joshuaklein-malonda.workers.dev/exists/:word
 */

// ─── Target Words (answers) ────────────────────────────────────────
// These are the words that can be chosen as the daily puzzle solution.
export const TARGET_WORDS = [
  'ethics',
  'human-acts',
  'acts-of-man',
  'morality',
  'habits',
  'virtue',
  'values',
  'rationality',
  'integrity',
  'character',
  'moral-compass',
  'culture',
  'cultural-norms',
  'pakikisama',
  'hiya',
  'utang-na-loob',
  'paggalang',
  'delicadeza',
  'bayanihan',
  'amor-propio',
  'padrino-system',
];

export const WORD_CLUES = {
  'ethics': 'Principles that guide what is right and wrong.',
  'human-acts': 'Actions that proceeds from knowledge and deliberate consent of the will.',
  'acts-of-man': 'Actions that happen without deliberate choice.',
  'morality': 'Beliefs about good and bad conduct.',
  'habits': 'Patterns of behavior repeated over time.',
  'virtue': 'A quality considered morally good.',
  'values': 'Principles that shape choices and priorities.',
  'rationality' : 'The quality of being based on reason or logic.',
  'integrity' : 'The quality of being honest and having strong moral principles.',
  'character' : 'It was initially used as a mark impressed upon a coin.',
  'moral-compass' : 'A person’s ability to judge what is right and wrong and act accordingly.',
  'culture' : 'It includes all the things individuals learn while growing up among particular group.',
  'cultural-norms' : 'Are the shared, sanctioned, and integrated systems of beliefs and practices that are passed down through generations.',
  'pakikisama' : 'A filipino characteristic. It is treating others as equal, and with respect and integrity.',
  'hiya' : 'A common filipino value. This is a sense of social propriety and it conforms with established cultural standards.',
  'utang-na-loob' : 'Typically embedded in the Filipino culture. One should not forget to consider the good acts of others may have done.',
  'paggalang' : 'The value of showing respect and honor to others especially elders.',
  'delicadeza' : 'It is defined as acting in a manner which is refined or being delicate in taste.',
  'bayanihan' : 'A common filipino value. The spirit of unity and cooperation in working towards a common goal.',
  'amor-propio' : 'A spanish term meaning caring for oneself, or self-love. That prevents a person from swallowing their pride.',
  'padrino-system' : 'Filipino culture and politics. Is the system of value in which one gets support, endorsement, or political appointment through family affiliation.'
};

export function normalizeWord(word) {
  return word.replace(/-/g, ' ').toUpperCase();
}

export function getWordLetters(word) {
  return normalizeWord(word).match(/[A-Z]/g) || [];
}

// ─── Seed Configuration ────────────────────────────────────────────
// Change this date to shift the entire puzzle calendar.
// Words rotate in order from TARGET_WORDS based on days since this epoch.
export const EPOCH_START = new Date(Date.UTC(2026, 0, 1)); // Jan 1, 2026

// ─── Game Configuration ────────────────────────────────────────────
export const GAME_CONFIG = {
  maxGuesses: 6,
  revealDelay: 150, // ms between each tile flip animation
  shakeDelay: 180,  // ms for shake animation on invalid guess
};
