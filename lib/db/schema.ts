import { sql } from "drizzle-orm";
import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

/** Standard ingredient dictionary: canonical name + unit->grams conversion table. */
export const canonicalIngredients = sqliteTable("canonical_ingredients", {
  id: text("id").primaryKey(),
  canonicalName: text("canonical_name").notNull(),
  category: text("category"),
  isSeasoning: integer("is_seasoning", { mode: "boolean" }).notNull().default(false),
  /** JSON map of unit -> grams, e.g. {"包":10,"片":1} */
  unitGramsJson: text("unit_grams_json").notNull().default("{}"),
  /** Fallback grams-per-unit when the parsed unit isn't in unitGramsJson. */
  defaultGrams: real("default_grams").notNull().default(100),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

/** Aliases for a canonical ingredient, e.g. "紫菜" -> 海苔. */
export const ingredientSynonyms = sqliteTable("ingredient_synonyms", {
  id: text("id").primaryKey(),
  ingredientId: text("ingredient_id")
    .notNull()
    .references(() => canonicalIngredients.id, { onDelete: "cascade" }),
  alias: text("alias").notNull(),
});

export type InventoryLocation = "pantry" | "fridge" | "freezer";
export type InventorySource = "manual" | "barcode" | "photo-ai";

/** A pantry/fridge/freezer item the user has on hand. */
export const inventoryItems = sqliteTable("inventory_items", {
  id: text("id").primaryKey(),
  rawDescription: text("raw_description").notNull(),
  canonicalIngredientId: text("canonical_ingredient_id").references(() => canonicalIngredients.id),
  name: text("name").notNull(),
  quantityValue: real("quantity_value"),
  quantityUnit: text("quantity_unit"),
  estimatedGrams: real("estimated_grams").notNull(),
  isEstimated: integer("is_estimated", { mode: "boolean" }).notNull().default(true),
  location: text("location").$type<InventoryLocation>().notNull().default("pantry"),
  expireDate: text("expire_date"), // ISO date string (YYYY-MM-DD), optional
  source: text("source").$type<InventorySource>().notNull().default("manual"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

/** A saved recipe (seeded for MVP; user-pasted recipes come in a later phase). */
export const recipes = sqliteTable("recipes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  sourceType: text("source_type").$type<"seed" | "paste" | "url">().notNull().default("seed"),
  sourceUrl: text("source_url"),
  rawText: text("raw_text"),
  scrapeStatus: text("scrape_status"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

export const recipeIngredients = sqliteTable("recipe_ingredients", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  rawLine: text("raw_line"),
  name: text("name").notNull(),
  canonicalIngredientId: text("canonical_ingredient_id").references(() => canonicalIngredients.id),
  quantityValue: real("quantity_value"),
  quantityUnit: text("quantity_unit"),
  estimatedGrams: real("estimated_grams"),
  isSeasoning: integer("is_seasoning", { mode: "boolean" }).notNull().default(false),
});

export const mealPlanEntries = sqliteTable("meal_plan_entries", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  plannedFor: text("planned_for").notNull(), // e.g. "2026-W33"
  status: text("status").$type<"planned" | "cooked" | "skipped">().notNull().default("planned"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});
