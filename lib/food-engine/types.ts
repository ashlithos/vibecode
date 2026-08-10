/** Shared types for the food engine: parsing, dictionary matching, and quantity/matching logic. */

export interface CanonicalIngredient {
  id: string;
  canonicalName: string;
  synonyms: string[];
  isSeasoning: boolean;
  category?: string | null;
  /** unit -> grams, e.g. {"包":10,"个":60} */
  unitGrams: Record<string, number>;
  /** fallback grams when the parsed unit isn't in unitGrams (or no unit was found) */
  defaultGrams: number;
}

/** The result of parsing a single freeform line like "五包海苔" or "盐 适量". */
export interface ParsedQuantity {
  rawText: string;
  /** The ingredient name as detected, before dictionary normalization. */
  name: string;
  quantityValue: number | null;
  unit: string | null;
  confidence: "high" | "medium" | "low";
}

/** A parsed quantity resolved against the canonical ingredient dictionary. */
export interface ResolvedIngredient extends ParsedQuantity {
  canonicalIngredientId: string | null;
  matchedCanonicalName: string | null;
  matchScore: number; // 0..1, 1 = exact/substring match
  estimatedGrams: number;
  isSeasoning: boolean;
}

export type MatchBucket = "full" | "minor-missing" | "major-missing";

export interface RecipeMatchResult {
  recipeId: string;
  recipeTitle: string;
  bucket: MatchBucket;
  have: ResolvedIngredient[];
  missingMain: ResolvedIngredient[];
  missingMinor: ResolvedIngredient[];
}
