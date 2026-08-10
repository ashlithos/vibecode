import { describe, it, expect } from "vitest";
import { matchRecipeToInventory, bucketFor } from "../match";
import type { ResolvedIngredient } from "../types";

function ing(overrides: Partial<ResolvedIngredient>): ResolvedIngredient {
  return {
    rawText: "",
    name: "",
    quantityValue: null,
    unit: null,
    confidence: "high",
    canonicalIngredientId: null,
    matchedCanonicalName: null,
    matchScore: 1,
    estimatedGrams: 0,
    isSeasoning: false,
    ...overrides,
  };
}

describe("bucketFor", () => {
  it("is full when nothing is missing", () => {
    expect(bucketFor(0, 0)).toBe("full");
  });
  it("is minor-missing when only seasonings are missing", () => {
    expect(bucketFor(0, 2)).toBe("minor-missing");
  });
  it("is major-missing when any main ingredient is missing", () => {
    expect(bucketFor(1, 0)).toBe("major-missing");
  });
});

describe("matchRecipeToInventory", () => {
  it("buckets a fully-makeable recipe as full", () => {
    const recipeIngredients = [
      ing({ name: "西红柿", canonicalIngredientId: "tomato", estimatedGrams: 300, quantityValue: 2 }),
      ing({ name: "鸡蛋", canonicalIngredientId: "egg", estimatedGrams: 165, quantityValue: 3 }),
    ];
    const inventory = [
      ing({ name: "西红柿", canonicalIngredientId: "tomato", estimatedGrams: 500 }),
      ing({ name: "鸡蛋", canonicalIngredientId: "egg", estimatedGrams: 300 }),
    ];
    const result = matchRecipeToInventory("r1", "番茄炒蛋", recipeIngredients, inventory);
    expect(result.bucket).toBe("full");
    expect(result.missingMain).toHaveLength(0);
    expect(result.missingMinor).toHaveLength(0);
  });

  it("buckets missing seasonings as minor-missing", () => {
    const recipeIngredients = [
      ing({ name: "西红柿", canonicalIngredientId: "tomato", estimatedGrams: 300, quantityValue: 2 }),
      ing({ name: "盐", canonicalIngredientId: "salt", estimatedGrams: 5, quantityValue: null, isSeasoning: true }),
    ];
    const inventory = [ing({ name: "西红柿", canonicalIngredientId: "tomato", estimatedGrams: 500 })];
    const result = matchRecipeToInventory("r2", "西红柿", recipeIngredients, inventory);
    expect(result.bucket).toBe("minor-missing");
    expect(result.missingMinor.map((i) => i.name)).toEqual(["盐"]);
  });

  it("buckets missing main ingredients as major-missing", () => {
    const recipeIngredients = [
      ing({ name: "牛肉", canonicalIngredientId: "beef", estimatedGrams: 300, quantityValue: 300, unit: "g" }),
      ing({ name: "土豆", canonicalIngredientId: "potato", estimatedGrams: 150, quantityValue: 1 }),
    ];
    const inventory = [ing({ name: "土豆", canonicalIngredientId: "potato", estimatedGrams: 150 })];
    const result = matchRecipeToInventory("r3", "土豆炖牛肉", recipeIngredients, inventory);
    expect(result.bucket).toBe("major-missing");
    expect(result.missingMain.map((i) => i.name)).toEqual(["牛肉"]);
  });
});
