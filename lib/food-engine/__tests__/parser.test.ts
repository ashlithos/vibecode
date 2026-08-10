import { describe, it, expect } from "vitest";
import { parseQuantityLine } from "../parser";

describe("parseQuantityLine", () => {
  it("parses quantity+unit prefix form", () => {
    const r = parseQuantityLine("五包海苔");
    expect(r.name).toBe("海苔");
    expect(r.quantityValue).toBe(5);
    expect(r.unit).toBe("包");
    expect(r.confidence).toBe("high");
  });

  it("parses arabic-numeral prefix form", () => {
    const r = parseQuantityLine("2个鸡蛋");
    expect(r.name).toBe("鸡蛋");
    expect(r.quantityValue).toBe(2);
    expect(r.unit).toBe("个");
  });

  it("parses name-first suffix form", () => {
    const r = parseQuantityLine("生抽 15ml");
    expect(r.name).toBe("生抽");
    expect(r.quantityValue).toBe(15);
    expect(r.unit).toBe("ml");
  });

  it("handles vague amounts like 适量", () => {
    const r = parseQuantityLine("盐 适量");
    expect(r.name).toBe("盐");
    expect(r.quantityValue).toBeNull();
    expect(r.confidence).toBe("medium");
  });

  it("handles a bare tub description", () => {
    const r = parseQuantityLine("一大桶肉松");
    expect(r.name).toContain("肉松");
    expect(r.quantityValue).toBe(1);
    expect(r.unit).toBe("桶");
  });

  it("parses the colloquial numeral 两 as 2 before a measure word", () => {
    const r = parseQuantityLine("两个西红柿");
    expect(r.name).toBe("西红柿");
    expect(r.quantityValue).toBe(2);
    expect(r.unit).toBe("个");
  });

  it("still parses 两 as the weight unit (liang) after a digit", () => {
    const r = parseQuantityLine("三两猪肉");
    expect(r.name).toBe("猪肉");
    expect(r.quantityValue).toBe(3);
    expect(r.unit).toBe("两");
  });
});
