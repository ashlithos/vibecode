/** Starter recipe list so "suggest a dish" has something to match against before the user pastes their own recipes (Phase 3+). */

export interface RecipeIngredientSeed {
  name: string;
  quantityValue: number | null;
  unit: string | null;
}

export interface RecipeSeed {
  title: string;
  ingredients: RecipeIngredientSeed[];
}

export const RECIPE_SEEDS: RecipeSeed[] = [
  {
    title: "番茄炒蛋",
    ingredients: [
      { name: "西红柿", quantityValue: 2, unit: "个" },
      { name: "鸡蛋", quantityValue: 3, unit: "个" },
      { name: "葱", quantityValue: 1, unit: "根" },
      { name: "盐", quantityValue: null, unit: null },
      { name: "糖", quantityValue: 1, unit: "勺" },
      { name: "食用油", quantityValue: 2, unit: "勺" },
    ],
  },
  {
    title: "蒜蓉炒虾",
    ingredients: [
      { name: "虾", quantityValue: 300, unit: "g" },
      { name: "蒜", quantityValue: 2, unit: "头" },
      { name: "生抽", quantityValue: 1, unit: "勺" },
      { name: "料酒", quantityValue: 1, unit: "勺" },
      { name: "盐", quantityValue: null, unit: null },
      { name: "食用油", quantityValue: 2, unit: "勺" },
    ],
  },
  {
    title: "红烧肉",
    ingredients: [
      { name: "猪肉", quantityValue: 500, unit: "g" },
      { name: "生抽", quantityValue: 2, unit: "勺" },
      { name: "老抽", quantityValue: 1, unit: "勺" },
      { name: "糖", quantityValue: 2, unit: "勺" },
      { name: "姜", quantityValue: 2, unit: "块" },
      { name: "葱", quantityValue: 1, unit: "根" },
      { name: "料酒", quantityValue: 1, unit: "勺" },
    ],
  },
  {
    title: "麻婆豆腐",
    ingredients: [
      { name: "豆腐", quantityValue: 1, unit: "块" },
      { name: "猪肉", quantityValue: 100, unit: "g" },
      { name: "蒜", quantityValue: 1, unit: "头" },
      { name: "姜", quantityValue: 1, unit: "块" },
      { name: "生抽", quantityValue: 1, unit: "勺" },
      { name: "淀粉", quantityValue: 1, unit: "勺" },
      { name: "食用油", quantityValue: 2, unit: "勺" },
    ],
  },
  {
    title: "木耳炒蛋",
    ingredients: [
      { name: "木耳", quantityValue: 1, unit: "袋" },
      { name: "鸡蛋", quantityValue: 3, unit: "个" },
      { name: "葱", quantityValue: 1, unit: "根" },
      { name: "盐", quantityValue: null, unit: null },
      { name: "食用油", quantityValue: 2, unit: "勺" },
    ],
  },
  {
    title: "香菇炖鸡",
    ingredients: [
      { name: "干香菇", quantityValue: 1, unit: "包" },
      { name: "鸡胸肉", quantityValue: 200, unit: "g" },
      { name: "姜", quantityValue: 1, unit: "块" },
      { name: "生抽", quantityValue: 1, unit: "勺" },
      { name: "盐", quantityValue: null, unit: null },
    ],
  },
  {
    title: "土豆炖牛肉",
    ingredients: [
      { name: "土豆", quantityValue: 2, unit: "个" },
      { name: "牛肉", quantityValue: 300, unit: "g" },
      { name: "胡萝卜", quantityValue: 1, unit: "个" },
      { name: "姜", quantityValue: 1, unit: "块" },
      { name: "生抽", quantityValue: 1, unit: "勺" },
      { name: "老抽", quantityValue: 1, unit: "勺" },
    ],
  },
  {
    title: "洋葱炒蛋",
    ingredients: [
      { name: "洋葱", quantityValue: 1, unit: "个" },
      { name: "鸡蛋", quantityValue: 3, unit: "个" },
      { name: "盐", quantityValue: null, unit: null },
      { name: "食用油", quantityValue: 2, unit: "勺" },
    ],
  },
  {
    title: "海苔蛋花汤",
    ingredients: [
      { name: "海苔", quantityValue: 1, unit: "包" },
      { name: "鸡蛋", quantityValue: 2, unit: "个" },
      { name: "盐", quantityValue: null, unit: null },
      { name: "香油", quantityValue: 1, unit: "勺" },
    ],
  },
  {
    title: "肉松饭团",
    ingredients: [
      { name: "肉松", quantityValue: 1, unit: "包" },
      { name: "大米", quantityValue: 1, unit: "杯" },
      { name: "海苔", quantityValue: 2, unit: "片" },
    ],
  },
];
