/** Seeds the local SQLite DB with the starter ingredient dictionary and starter recipes. Safe to re-run: clears and re-inserts seed rows. */
import { randomUUID } from "node:crypto";
import { db, sqlite } from "../db/client";
import { canonicalIngredients, ingredientSynonyms, recipes, recipeIngredients } from "../db/schema";
import { INGREDIENT_SEEDS } from "./ingredients.seed";
import { RECIPE_SEEDS } from "./recipes.seed";
import { buildIndex, resolveIngredient } from "../food-engine/dictionary";
import { estimateGrams } from "../food-engine/quantity";
import type { CanonicalIngredient } from "../food-engine/types";

function main() {
  console.log("Seeding canonical ingredients...");
  sqlite.exec("DELETE FROM recipe_ingredients; DELETE FROM recipes; DELETE FROM ingredient_synonyms; DELETE FROM canonical_ingredients;");

  const inMemoryDict: CanonicalIngredient[] = [];

  for (const seed of INGREDIENT_SEEDS) {
    const id = randomUUID();
    db.insert(canonicalIngredients)
      .values({
        id,
        canonicalName: seed.canonicalName,
        category: seed.category ?? null,
        isSeasoning: seed.isSeasoning,
        unitGramsJson: JSON.stringify(seed.unitGrams),
        defaultGrams: seed.defaultGrams,
      })
      .run();

    for (const alias of seed.synonyms) {
      db.insert(ingredientSynonyms)
        .values({ id: randomUUID(), ingredientId: id, alias })
        .run();
    }

    inMemoryDict.push({
      id,
      canonicalName: seed.canonicalName,
      synonyms: seed.synonyms,
      isSeasoning: seed.isSeasoning,
      category: seed.category ?? null,
      unitGrams: seed.unitGrams,
      defaultGrams: seed.defaultGrams,
    });
  }
  console.log(`Inserted ${INGREDIENT_SEEDS.length} canonical ingredients.`);

  const index = buildIndex(inMemoryDict);

  console.log("Seeding starter recipes...");
  for (const recipeSeed of RECIPE_SEEDS) {
    const recipeId = randomUUID();
    db.insert(recipes)
      .values({ id: recipeId, title: recipeSeed.title, sourceType: "seed" })
      .run();

    recipeSeed.ingredients.forEach((ing, sortOrder) => {
      const { ingredient } = resolveIngredient(ing.name, index);
      const estimated = estimateGrams(
        { rawText: ing.name, name: ing.name, quantityValue: ing.quantityValue, unit: ing.unit, confidence: "high" },
        ingredient
      );
      db.insert(recipeIngredients)
        .values({
          id: randomUUID(),
          recipeId,
          sortOrder,
          rawLine: `${ing.name} ${ing.quantityValue ?? ""}${ing.unit ?? ""}`.trim(),
          name: ing.name,
          canonicalIngredientId: ingredient?.id ?? null,
          quantityValue: ing.quantityValue,
          quantityUnit: ing.unit,
          estimatedGrams: estimated,
          isSeasoning: ingredient?.isSeasoning ?? false,
        })
        .run();
    });
  }
  console.log(`Inserted ${RECIPE_SEEDS.length} starter recipes.`);
  console.log("Seed complete.");
}

main();
