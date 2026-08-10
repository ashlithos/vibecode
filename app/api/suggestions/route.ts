import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { inventoryItems, recipes, recipeIngredients } from "@/lib/db/schema";
import { suggestRecipes, type RecipeWithIngredients } from "@/lib/food-engine/suggest";
import { loadCanonicalIngredients, inventoryRowToResolved, recipeIngredientRowToResolved } from "@/lib/food-engine/server";

/** Suggests what can be cooked right now, ranked full -> minor-missing (seasonings only) -> major-missing. */
export async function GET() {
  const dict = loadCanonicalIngredients();
  const inventoryRows = db.select().from(inventoryItems).all();
  const resolvedInventory = inventoryRows.map((row) => inventoryRowToResolved(row, dict));

  const recipeRows = db.select().from(recipes).all();
  const allIngredientRows = db.select().from(recipeIngredients).all();

  const recipesWithIngredients: RecipeWithIngredients[] = recipeRows.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    ingredients: allIngredientRows
      .filter((ri) => ri.recipeId === recipe.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(recipeIngredientRowToResolved),
  }));

  const results = suggestRecipes(recipesWithIngredients, resolvedInventory);
  return NextResponse.json({ results });
}
