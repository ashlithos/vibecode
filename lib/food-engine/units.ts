/** Unit vocabulary and Chinese-numeral parsing, shared by the recipe parser and inventory quantity parser. */

/** Units recognized when parsing a "name + quantity + unit" line, longest-first so regex alternation prefers e.g. "大勺" over "勺". */
export const UNIT_VOCAB = [
  "毫升",
  "大勺",
  "小勺",
  "汤匙",
  "茶匙",
  "kg",
  "ml",
  "斤",
  "两",
  "包",
  "袋",
  "个",
  "只",
  "条",
  "片",
  "勺",
  "杯",
  "盒",
  "瓶",
  "罐",
  "把",
  "棵",
  "头",
  "桶",
  "块",
  "根",
  "朵",
  "打",
  "克",
  "升",
  "tbsp",
  "tsp",
  "cup",
  "oz",
  "lb",
  "pcs",
  "pack",
  "g",
  "L",
].sort((a, b) => b.length - a.length);

const CHINESE_DIGITS: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

/** Parses simple Chinese numerals: 一..九, 十, 十五, 二十, 二十五, 半 (=0.5). Returns null if not recognized. */
export function parseChineseNumeral(token: string): number | null {
  const t = token.trim();
  if (!t) return null;
  if (t === "半") return 0.5;
  if (t === "十") return 10;

  // e.g. "十五" (15), "二十" (20), "二十五" (25)
  const tenMatch = t.match(/^([一二三四五六七八九])?十([一二三四五六七八九])?$/);
  if (tenMatch) {
    const tens = tenMatch[1] ? CHINESE_DIGITS[tenMatch[1]] : 1;
    const ones = tenMatch[2] ? CHINESE_DIGITS[tenMatch[2]] : 0;
    return tens * 10 + ones;
  }

  if (t.length === 1 && t in CHINESE_DIGITS) {
    return CHINESE_DIGITS[t];
  }

  return null;
}

/** Parses a quantity token: Arabic numbers (incl. fractions like "1/2" and decimals), then falls back to Chinese numerals. */
export function parseNumberToken(token: string | undefined | null): number | null {
  if (!token) return null;
  const t = token.trim();
  if (!t) return null;

  const fraction = t.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    const denom = Number(fraction[2]);
    return denom === 0 ? null : Number(fraction[1]) / denom;
  }

  if (/^\d+(\.\d+)?$/.test(t)) {
    return Number(t);
  }

  return parseChineseNumeral(t);
}
