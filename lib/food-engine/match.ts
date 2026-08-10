import type { MatchBucket, RecipeMatchResult, ResolvedIngredient } from "./types";

/** Bucket rule: no missing -> full; only seasonings missing -> minor-missing; any main ingredient missing -> major-missing. */
export function bucketFor(missingMainCount: number, missingMinorCount: number): MatchBucket {
  if (missingMainCount > 0) return "major-missing";
  if (missingMinorCount > 0) return "minor-missing";
  return "full";
}

/**
 * Matches one recipe's resolved ingredients against current inventory (also resolved ingredients).
 * "Have enough" = matching inventory grams (summed across items with the same canonical ingredient)
 * meet the recipe's estimated grams; if the recipe ingredient has no known quantity, presence alone counts.
 */
export function matchRecipeToInventory(
  recipeId: string,
  recipeTitle: string,
  recipeIngredients: ResolvedIngredient[],
  inventory: ResolvedIngredient[]
): RecipeMatchResult {
  const haveByCanonicalId = new Map<string, number>();
  const haveByNormalizedName = new Map<string, number>();

  for (const item of inventory) {
    if (item.canonicalIngredientId) {
      haveByCanonicalId.set(
        item.canonicalIngredientId,
        (haveByCanonicalId.get(item.canonicalIngredientId) ?? 0) + item.estimatedGrams
      );
    }
    const key = item.name.toLowerCase();
    haveByNormalizedName.set(key, (haveByNormalizedName.get(key) ?? 0) + item.estimatedGrams);
  }

  const have: ResolvedIngredient[] = [];
  const missingMain: ResolvedIngredient[] = [];
  const missingMinor: ResolvedIngredient[] = [];

  for (const ingredient of recipeIngredients) {
    const availableGrams = ingredient.canonicalIngredientId
      ? (haveByCanonicalId.get(ingredient.canonicalIngredientId) ?? 0)
      : (haveByNormalizedName.get(ingredient.name.toLowerCase()) ?? 0);

    const needed = ingredient.quantityValue !== null ? ingredient.estimatedGrams : 0;
    const isSatisfied = availableGrams > 0 && availableGrams >= needed;

    if (isSatisfied) {
      have.push(ingredient);
    } else if (ingredient.isSeasoning) {
      missingMinor.push(ingredient);
    } else {
      missingMain.push(ingredient);
    }
  }

  return {
    recipeId,
    recipeTitle,
    bucket: bucketFor(missingMain.length, missingMinor.length),
    have,
    missingMain,
    missingMinor,
  };
}
