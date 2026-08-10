import { describe, it, expect } from "vitest";
import { estimateGrams, GENERIC_FALLBACK_GRAMS } from "../quantity";
import type { CanonicalIngredient, ParsedQuantity } from "../types";

const NORI: CanonicalIngredient = {
  id: "1",
  canonicalName: "海苔",
  synonyms: ["紫菜"],
  isSeasoning: false,
  unitGrams: { 包: 10, 片: 1 },
  defaultGrams: 10,
};

describe("estimateGrams", () => {
  it("multiplies quantity by the known unit's grams", () => {
    const qty: ParsedQuantity = { rawText: "五包海苔", name: "海苔", quantityValue: 5, unit: "包", confidence: "high" };
    expect(estimateGrams(qty, NORI)).toBe(50);
  });

  it("falls back to defaultGrams when the unit is unknown", () => {
    const qty: ParsedQuantity = { rawText: "一大盒海苔", name: "海苔", quantityValue: 1, unit: "盒", confidence: "high" };
    expect(estimateGrams(qty, NORI)).toBe(10);
  });

  it("falls back to the generic default when there's no ingredient match at all", () => {
    const qty: ParsedQuantity = { rawText: "两个榴莲", name: "榴莲", quantityValue: 2, unit: "个", confidence: "high" };
    expect(estimateGrams(qty, null)).toBe(2 * GENERIC_FALLBACK_GRAMS);
  });
});
