/** Normalizes a freeform ingredient name for dictionary lookup: strips emoji/punctuation/noise words, collapses whitespace. */

// Common qualifier/noise words that don't identify the ingredient itself.
const NOISE_WORDS = [
  "适量",
  "少许",
  "少量",
  "新鲜的?",
  "新鲜",
  "切好的?",
  "切片",
  "切块",
  "切丝",
  "洗净的?",
  "洗净",
  "大概",
  "约",
  "左右",
];

const NOISE_RE = new RegExp(NOISE_WORDS.join("|"), "g");

// Rough emoji + pictograph ranges.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu;

export function normalizeName(raw: string): string {
  return raw
    .replace(EMOJI_RE, "")
    .replace(NOISE_RE, "")
    .replace(/[·•\-*_/\\|()（）:：,，、.。!！?？"'"'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
