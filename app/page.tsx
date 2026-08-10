import Link from "next/link";
import { db } from "@/lib/db/client";
import { inventoryItems, recipes, recipeIngredients } from "@/lib/db/schema";
import { suggestRecipes, type RecipeWithIngredients } from "@/lib/food-engine/suggest";
import {
  loadCanonicalIngredients,
  inventoryRowToResolved,
  recipeIngredientRowToResolved,
} from "@/lib/food-engine/server";
import type { RecipeMatchResult } from "@/lib/food-engine/types";

export const dynamic = "force-dynamic";

function getSuggestions(): { results: RecipeMatchResult[]; inventoryCount: number } {
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

  return {
    results: suggestRecipes(recipesWithIngredients, resolvedInventory),
    inventoryCount: inventoryRows.length,
  };
}

const BUCKET_LABEL: Record<RecipeMatchResult["bucket"], { label: string; className: string }> = {
  full: { label: "✅ 现在就能做", className: "border-green-300 bg-green-50" },
  "minor-missing": { label: "🟡 缺一点调料，问题不大", className: "border-amber-300 bg-amber-50" },
  "major-missing": { label: "🔴 缺得比较多，可能要买菜", className: "border-red-300 bg-red-50" },
};

function RecipeCard({ result }: { result: RecipeMatchResult }) {
  const style = BUCKET_LABEL[result.bucket];
  return (
    <li className={`rounded-lg border p-4 ${style.className}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{result.recipeTitle}</h3>
        <span className="whitespace-nowrap text-xs font-medium">{style.label}</span>
      </div>
      {result.missingMain.length > 0 && (
        <p className="mt-2 text-sm text-red-700">
          缺主料：{result.missingMain.map((i) => i.name).join("、")}
        </p>
      )}
      {result.missingMinor.length > 0 && (
        <p className="mt-1 text-sm text-amber-700">
          缺调料：{result.missingMinor.map((i) => i.name).join("、")}
        </p>
      )}
    </li>
  );
}

export default function Home() {
  const { results, inventoryCount } = getSuggestions();
  const full = results.filter((r) => r.bucket === "full");
  const minor = results.filter((r) => r.bucket === "minor-missing");
  const major = results.filter((r) => r.bucket === "major-missing");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">今天/这周能做什么</h1>
        <p className="mt-1 text-sm text-zinc-600">
          根据当前库存自动匹配食谱库（内置 {results.length} 道起步食谱）。
          {inventoryCount === 0 && (
            <>
              {" "}
              你还没有录入库存，先去{" "}
              <Link href="/inventory" className="font-medium underline">
                库存页
              </Link>{" "}
              加几样。
            </>
          )}
        </p>
      </div>

      {full.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-500">能做（{full.length}）</h2>
          <ul className="flex flex-col gap-2">
            {full.map((r) => (
              <RecipeCard key={r.recipeId} result={r} />
            ))}
          </ul>
        </section>
      )}

      {minor.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-500">缺调料，问题不大（{minor.length}）</h2>
          <ul className="flex flex-col gap-2">
            {minor.map((r) => (
              <RecipeCard key={r.recipeId} result={r} />
            ))}
          </ul>
        </section>
      )}

      {major.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-500">缺得比较多（{major.length}）</h2>
          <ul className="flex flex-col gap-2">
            {major.map((r) => (
              <RecipeCard key={r.recipeId} result={r} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
