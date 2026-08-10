import type { RecipeMatchResult, ResolvedIngredient } from "./types";
import { matchRecipeToInventory } from "./match";

const BUCKET_ORDER: Record<RecipeMatchResult["bucket"], number> = {
  full: 0,
  "minor-missing": 1,
  "major-missing": 2,
};

export interface RecipeWithIngredients {
  id: string;
  title: string;
  ingredients: ResolvedIngredient[];
}

/**
 * Matches every recipe against current inventory and sorts full -> minor-missing -> major-missing.
 * Within a bucket, recipes with fewer missing ingredients come first (closest to makeable).
 */
export function suggestRecipes(
  recipes: RecipeWithIngredients[],
  inventory: ResolvedIngredient[]
): RecipeMatchResult[] {
  const results = recipes.map((recipe) =>
    matchRecipeToInventory(recipe.id, recipe.title, recipe.ingredients, inventory)
  );

  return results.sort((a, b) => {
    const bucketDiff = BUCKET_ORDER[a.bucket] - BUCKET_ORDER[b.bucket];
    if (bucketDiff !== 0) return bucketDiff;
    const aMissing = a.missingMain.length + a.missingMinor.length;
    const bMissing = b.missingMain.length + b.missingMinor.length;
    return aMissing - bMissing;
  });
}
