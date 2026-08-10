import type { CanonicalIngredient, ParsedQuantity } from "./types";

/** Generic fallback when an ingredient has no dictionary match at all — never leave grams as null. */
export const GENERIC_FALLBACK_GRAMS = 100;

/**
 * Estimates grams for a parsed quantity given an (optional) resolved dictionary entry.
 * - Known ingredient + known unit -> quantityValue * unitGrams[unit]
 * - Known ingredient + unknown/missing unit -> (quantityValue ?? 1) * defaultGrams
 * - No ingredient match at all -> (quantityValue ?? 1) * GENERIC_FALLBACK_GRAMS
 */
export function estimateGrams(qty: ParsedQuantity, ingredient: CanonicalIngredient | null): number {
  const count = qty.quantityValue ?? 1;

  if (ingredient) {
    if (qty.unit && qty.unit in ingredient.unitGrams) {
      return count * ingredient.unitGrams[qty.unit];
    }
    return count * ingredient.defaultGrams;
  }

  return count * GENERIC_FALLBACK_GRAMS;
}
