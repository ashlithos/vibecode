/** Starter ingredient dictionary: canonical name, unit->grams conversion table, and synonyms. Weighted toward Chinese home cooking. Heuristic values — meant to be corrected over time via the app's edit UI. */

export interface IngredientSeed {
  canonicalName: string;
  isSeasoning: boolean;
  unitGrams: Record<string, number>;
  defaultGrams: number;
  synonyms: string[];
  category?: string;
}

export const INGREDIENT_SEEDS: IngredientSeed[] = [
  { canonicalName: "海苔", isSeasoning: false, unitGrams: { 包: 10, 袋: 10, 片: 1 }, defaultGrams: 10, synonyms: ["紫菜", "seaweed", "nori"], category: "海产干货" },
  { canonicalName: "肉松", isSeasoning: false, unitGrams: { 桶: 300, 包: 100, 袋: 100, 罐: 250 }, defaultGrams: 150, synonyms: ["pork floss", "meat floss"], category: "腌制/加工" },
  { canonicalName: "生抽", isSeasoning: true, unitGrams: { 瓶: 500, 勺: 15, ml: 1, 毫升: 1 }, defaultGrams: 15, synonyms: ["酱油", "light soy sauce", "soy sauce"], category: "调料" },
  { canonicalName: "老抽", isSeasoning: true, unitGrams: { 瓶: 500, 勺: 15, ml: 1 }, defaultGrams: 15, synonyms: ["dark soy sauce"], category: "调料" },
  { canonicalName: "盐", isSeasoning: true, unitGrams: { 包: 500, 勺: 5, g: 1, 克: 1 }, defaultGrams: 5, synonyms: ["salt", "食盐"], category: "调料" },
  { canonicalName: "糖", isSeasoning: true, unitGrams: { 包: 500, 勺: 10, g: 1, 克: 1 }, defaultGrams: 10, synonyms: ["sugar", "白糖", "砂糖"], category: "调料" },
  { canonicalName: "鸡蛋", isSeasoning: false, unitGrams: { 个: 55, 打: 660, 盒: 300 }, defaultGrams: 55, synonyms: ["egg", "eggs"], category: "蛋类" },
  { canonicalName: "大米", isSeasoning: false, unitGrams: { 袋: 5000, 斤: 500, 杯: 180 }, defaultGrams: 500, synonyms: ["rice", "米"], category: "主食" },
  { canonicalName: "面粉", isSeasoning: false, unitGrams: { 袋: 2500, 杯: 120, g: 1, 克: 1 }, defaultGrams: 500, synonyms: ["flour", "中筋面粉"], category: "主食" },
  { canonicalName: "食用油", isSeasoning: true, unitGrams: { 瓶: 1000, 勺: 15, ml: 1 }, defaultGrams: 15, synonyms: ["色拉油", "cooking oil", "vegetable oil"], category: "调料" },
  { canonicalName: "蒜", isSeasoning: true, unitGrams: { 头: 30, 瓣: 5, 个: 30 }, defaultGrams: 15, synonyms: ["garlic", "大蒜"], category: "葱姜蒜" },
  { canonicalName: "姜", isSeasoning: true, unitGrams: { 块: 15, 片: 3, 个: 30 }, defaultGrams: 15, synonyms: ["ginger", "生姜"], category: "葱姜蒜" },
  { canonicalName: "葱", isSeasoning: true, unitGrams: { 根: 15, 把: 100 }, defaultGrams: 15, synonyms: ["大葱", "scallion", "green onion"], category: "葱姜蒜" },
  { canonicalName: "土豆", isSeasoning: false, unitGrams: { 个: 150, 斤: 500 }, defaultGrams: 150, synonyms: ["potato", "马铃薯"], category: "蔬菜" },
  { canonicalName: "胡萝卜", isSeasoning: false, unitGrams: { 个: 100, 根: 100, 斤: 500 }, defaultGrams: 100, synonyms: ["carrot"], category: "蔬菜" },
  { canonicalName: "西红柿", isSeasoning: false, unitGrams: { 个: 150, 斤: 500 }, defaultGrams: 150, synonyms: ["番茄", "tomato"], category: "蔬菜" },
  { canonicalName: "豆腐", isSeasoning: false, unitGrams: { 块: 300, 盒: 400 }, defaultGrams: 300, synonyms: ["tofu", "老豆腐", "嫩豆腐"], category: "豆制品" },
  { canonicalName: "猪肉", isSeasoning: false, unitGrams: { 斤: 500, g: 1, kg: 1000 }, defaultGrams: 300, synonyms: ["pork", "五花肉", "猪里脊"], category: "肉类" },
  { canonicalName: "鸡胸肉", isSeasoning: false, unitGrams: { 块: 150, 斤: 500, kg: 1000 }, defaultGrams: 200, synonyms: ["chicken breast", "鸡肉"], category: "肉类" },
  { canonicalName: "牛肉", isSeasoning: false, unitGrams: { 斤: 500, kg: 1000 }, defaultGrams: 300, synonyms: ["beef"], category: "肉类" },
  { canonicalName: "虾", isSeasoning: false, unitGrams: { 斤: 500, 只: 15, kg: 1000 }, defaultGrams: 200, synonyms: ["shrimp", "prawn", "虾仁"], category: "海鲜" },
  { canonicalName: "干香菇", isSeasoning: false, unitGrams: { 包: 100, 袋: 100, 朵: 3 }, defaultGrams: 50, synonyms: ["dried shiitake", "香菇干"], category: "菌菇干货" },
  { canonicalName: "木耳", isSeasoning: false, unitGrams: { 包: 50, 袋: 50 }, defaultGrams: 20, synonyms: ["wood ear", "黑木耳"], category: "菌菇干货" },
  { canonicalName: "淀粉", isSeasoning: true, unitGrams: { 包: 200, 勺: 10, g: 1 }, defaultGrams: 10, synonyms: ["cornstarch", "生粉", "玉米淀粉"], category: "调料" },
  { canonicalName: "料酒", isSeasoning: true, unitGrams: { 瓶: 500, 勺: 15 }, defaultGrams: 15, synonyms: ["cooking wine", "shaoxing wine"], category: "调料" },
  { canonicalName: "醋", isSeasoning: true, unitGrams: { 瓶: 500, 勺: 15 }, defaultGrams: 15, synonyms: ["vinegar", "香醋", "陈醋"], category: "调料" },
  { canonicalName: "蚝油", isSeasoning: true, unitGrams: { 瓶: 500, 勺: 15 }, defaultGrams: 15, synonyms: ["oyster sauce"], category: "调料" },
  { canonicalName: "香油", isSeasoning: true, unitGrams: { 瓶: 250, 勺: 5 }, defaultGrams: 5, synonyms: ["芝麻油", "sesame oil"], category: "调料" },
  { canonicalName: "洋葱", isSeasoning: false, unitGrams: { 个: 200, 斤: 500 }, defaultGrams: 200, synonyms: ["onion"], category: "蔬菜" },
];
