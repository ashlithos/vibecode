import Fuse from "fuse.js";
import type { CanonicalIngredient } from "./types";
import { normalizeName } from "./normalize";

export interface DictionaryIndex {
  fuse: Fuse<CanonicalIngredient>;
  ingredients: CanonicalIngredient[];
}

export function buildIndex(dict: CanonicalIngredient[]): DictionaryIndex {
  const fuse = new Fuse(dict, {
    keys: ["canonicalName", "synonyms"],
    threshold: 0.35,
    includeScore: true,
    ignoreLocation: true,
  });
  return { fuse, ingredients: dict };
}

export interface ResolveResult {
  ingredient: CanonicalIngredient | null;
  score: number; // 1 = exact/substring match, 0 = no match
}

/** Resolves a freeform ingredient name to a canonical dictionary entry: exact match, then longest-substring match, then fuzzy fallback. */
export function resolveIngredient(name: string, index: DictionaryIndex): ResolveResult {
  const normalized = normalizeName(name);
  if (!normalized) return { ingredient: null, score: 0 };

  // Pass 1: exact match against canonical name / synonyms, checked across the *whole* dictionary
  // before falling through — this must not be short-circuited by pass 2's substring check below,
  // otherwise an early short entry could shadow the correct exact match later in the list.
  for (const ingredient of index.ingredients) {
    for (const candidate of [ingredient.canonicalName, ...ingredient.synonyms]) {
      if (normalizeName(candidate) === normalized) {
        return { ingredient, score: 1 };
      }
    }
  }

  // Pass 2: substring match (true synonyms like 生抽/酱油 can differ entirely in characters, so this
  // catches cases pass 1 misses). Requires candidate length >= 2 and picks the *longest* candidate
  // match across the whole dictionary, so e.g. "洋葱" doesn't get shadowed by "葱" (a real, shorter,
  // unrelated ingredient) just because 葱 happens to appear earlier or be a substring.
  let best: { ingredient: CanonicalIngredient; length: number } | null = null;
  for (const ingredient of index.ingredients) {
    for (const candidate of [ingredient.canonicalName, ...ingredient.synonyms]) {
      const normalizedCandidate = normalizeName(candidate);
      if (normalizedCandidate.length < 2) continue;
      if (normalized.includes(normalizedCandidate) || normalizedCandidate.includes(normalized)) {
        if (!best || normalizedCandidate.length > best.length) {
          best = { ingredient, length: normalizedCandidate.length };
        }
      }
    }
  }
  if (best) return { ingredient: best.ingredient, score: 1 };

  // Pass 3: fuzzy fallback for near-misses (typos, minor variants).
  const results = index.fuse.search(normalized);
  if (results.length > 0 && results[0].score !== undefined) {
    return { ingredient: results[0].item, score: 1 - results[0].score };
  }

  return { ingredient: null, score: 0 };
}
