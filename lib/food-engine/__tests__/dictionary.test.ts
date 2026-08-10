import { describe, it, expect } from "vitest";
import { buildIndex, resolveIngredient } from "../dictionary";
import type { CanonicalIngredient } from "../types";

const DICT: CanonicalIngredient[] = [
  {
    id: "1",
    canonicalName: "海苔",
    synonyms: ["紫菜", "seaweed", "nori"],
    isSeasoning: false,
    unitGrams: { 包: 10, 片: 1 },
    defaultGrams: 10,
  },
  {
    id: "2",
    canonicalName: "生抽",
    synonyms: ["酱油", "soy sauce"],
    isSeasoning: true,
    unitGrams: { 瓶: 500, 勺: 15 },
    defaultGrams: 15,
  },
];

describe("resolveIngredient", () => {
  const index = buildIndex(DICT);

  it("resolves an exact canonical name", () => {
    const { ingredient, score } = resolveIngredient("海苔", index);
    expect(ingredient?.id).toBe("1");
    expect(score).toBe(1);
  });

  it("resolves a known synonym (酱油 -> 生抽)", () => {
    const { ingredient } = resolveIngredient("酱油", index);
    expect(ingredient?.id).toBe("2");
  });

  it("resolves 紫菜 as a synonym of 海苔", () => {
    const { ingredient } = resolveIngredient("紫菜", index);
    expect(ingredient?.id).toBe("1");
  });

  it("returns null for something not in the dictionary", () => {
    const { ingredient } = resolveIngredient("榴莲", index);
    expect(ingredient).toBeNull();
  });

  it("does not let a short unrelated entry shadow a longer, more specific one (洋葱 vs 葱)", () => {
    const dictWithOnion: CanonicalIngredient[] = [
      { id: "3", canonicalName: "葱", synonyms: ["大葱", "scallion"], isSeasoning: true, unitGrams: {}, defaultGrams: 15 },
      { id: "4", canonicalName: "洋葱", synonyms: ["onion"], isSeasoning: false, unitGrams: {}, defaultGrams: 200 },
    ];
    const idx = buildIndex(dictWithOnion);
    const { ingredient } = resolveIngredient("洋葱", idx);
    expect(ingredient?.id).toBe("4");
    expect(ingredient?.isSeasoning).toBe(false);
  });
});
