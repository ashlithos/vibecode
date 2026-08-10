/** Server-side glue: loads the canonical ingredient dictionary from the DB and resolves freeform/stored rows into ResolvedIngredient. */
import { db } from "../db/client";
import { canonicalIngredients, ingredientSynonyms } from "../db/schema";
import type { CanonicalIngredient, ParsedQuantity, ResolvedIngredient } from "./types";
import { buildIndex, resolveIngredient, type DictionaryIndex } from "./dictionary";
import { estimateGrams } from "./quantity";

export function loadCanonicalIngredients(): CanonicalIngredient[] {
  const ingredients = db.select().from(canonicalIngredients).all();
  const synonyms = db.select().from(ingredientSynonyms).all();

  const synonymsByIngredientId = new Map<string, string[]>();
  for (const row of synonyms) {
    const list = synonymsByIngredientId.get(row.ingredientId) ?? [];
    list.push(row.alias);
    synonymsByIngredientId.set(row.ingredientId, list);
  }

  return ingredients.map((row) => ({
    id: row.id,
    canonicalName: row.canonicalName,
    synonyms: synonymsByIngredientId.get(row.id) ?? [],
    isSeasoning: row.isSeasoning,
    category: row.category,
    unitGrams: JSON.parse(row.unitGramsJson) as Record<string, number>,
    defaultGrams: row.defaultGrams,
  }));
}

/** Rebuilds the fuzzy-match index from the DB. Dataset is tiny (dozens of rows) so this is cheap per-request for MVP. */
export function getDictionaryIndex(): DictionaryIndex {
  return buildIndex(loadCanonicalIngredients());
}

/** Resolves a freshly-parsed quantity (e.g. from freeform inventory text) against the dictionary. */
export function resolveParsedQuantity(qty: ParsedQuantity, index: DictionaryIndex): ResolvedIngredient {
  const { ingredient, score } = resolveIngredient(qty.name, index);
  return {
    ...qty,
    canonicalIngredientId: ingredient?.id ?? null,
    matchedCanonicalName: ingredient?.canonicalName ?? null,
    matchScore: score,
    estimatedGrams: estimateGrams(qty, ingredient),
    isSeasoning: ingredient?.isSeasoning ?? false,
  };
}

/** Converts a stored inventory_items row into a ResolvedIngredient for the matching engine. */
export function inventoryRowToResolved(row: {
  name: string;
  rawDescription: string;
  quantityValue: number | null;
  quantityUnit: string | null;
  estimatedGrams: number;
  canonicalIngredientId: string | null;
}, dict: CanonicalIngredient[]): ResolvedIngredient {
  const ingredient = dict.find((d) => d.id === row.canonicalIngredientId) ?? null;
  return {
    rawText: row.rawDescription,
    name: row.name,
    quantityValue: row.quantityValue,
    unit: row.quantityUnit,
    confidence: "high",
    canonicalIngredientId: row.canonicalIngredientId,
    matchedCanonicalName: ingredient?.canonicalName ?? null,
    matchScore: ingredient ? 1 : 0,
    estimatedGrams: row.estimatedGrams,
    isSeasoning: ingredient?.isSeasoning ?? false,
  };
}

/** Converts a stored recipe_ingredients row into a ResolvedIngredient for the matching engine. */
export function recipeIngredientRowToResolved(row: {
  name: string;
  rawLine: string | null;
  quantityValue: number | null;
  quantityUnit: string | null;
  estimatedGrams: number | null;
  canonicalIngredientId: string | null;
  isSeasoning: boolean;
}): ResolvedIngredient {
  return {
    rawText: row.rawLine ?? row.name,
    name: row.name,
    quantityValue: row.quantityValue,
    unit: row.quantityUnit,
    confidence: "high",
    canonicalIngredientId: row.canonicalIngredientId,
    matchedCanonicalName: null,
    matchScore: row.canonicalIngredientId ? 1 : 0,
    estimatedGrams: row.estimatedGrams ?? 0,
    isSeasoning: row.isSeasoning,
  };
}
