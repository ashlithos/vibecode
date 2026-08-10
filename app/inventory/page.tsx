"use client";

import { useEffect, useState } from "react";

type Location = "pantry" | "fridge" | "freezer";

interface InventoryItem {
  id: string;
  rawDescription: string;
  name: string;
  quantityValue: number | null;
  quantityUnit: string | null;
  estimatedGrams: number;
  isEstimated: boolean;
  location: Location;
  expireDate: string | null;
  source: string;
  canonicalIngredientId: string | null;
}

interface ResolvedPreview {
  rawText: string;
  name: string;
  quantityValue: number | null;
  unit: string | null;
  canonicalIngredientId: string | null;
  matchedCanonicalName: string | null;
  matchScore: number;
  estimatedGrams: number;
  isSeasoning: boolean;
}

const LOCATION_LABEL: Record<Location, string> = {
  pantry: "储藏室",
  fridge: "冰箱",
  freezer: "冷冻室",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [rawDescription, setRawDescription] = useState("");
  const [location, setLocation] = useState<Location>("pantry");
  const [expireDate, setExpireDate] = useState("");
  const [preview, setPreview] = useState<ResolvedPreview | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/inventory");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // Initial load on mount; refresh() is also called after add/edit/delete actions below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, []);

  async function handleParse() {
    if (!rawDescription.trim()) return;
    setParsing(true);
    setPreview(null);
    try {
      const res = await fetch("/api/inventory/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawDescription }),
      });
      const data = await res.json();
      setPreview(data.resolved);
    } finally {
      setParsing(false);
    }
  }

  async function handleConfirmAdd() {
    if (!preview) return;
    setSaving(true);
    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawDescription,
          name: preview.name,
          quantityValue: preview.quantityValue,
          quantityUnit: preview.unit,
          estimatedGrams: preview.estimatedGrams,
          isEstimated: preview.matchScore < 1 || preview.quantityValue === null,
          canonicalIngredientId: preview.canonicalIngredientId,
          location,
          expireDate: expireDate || null,
          source: "manual",
        }),
      });
      setRawDescription("");
      setExpireDate("");
      setPreview(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function handleUpdateExpireDate(id: string, value: string) {
    await fetch(`/api/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expireDate: value || null }),
    });
    await refresh();
  }

  const grouped: Record<Location, InventoryItem[]> = {
    pantry: items.filter((i) => i.location === "pantry"),
    fridge: items.filter((i) => i.location === "fridge"),
    freezer: items.filter((i) => i.location === "freezer"),
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">库存</h1>
        <p className="mt-1 text-sm text-zinc-600">
          用一句话描述你有什么，比如“五包海苔”或“一大桶肉松”，系统会自动估算大概克数，确认无误后再保存。
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">添加一条库存</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-zinc-500">描述</label>
            <input
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              placeholder="例如：五包海苔"
              value={rawDescription}
              onChange={(e) => {
                setRawDescription(e.target.value);
                setPreview(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleParse()}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">位置</label>
            <select
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value as Location)}
            >
              <option value="pantry">储藏室</option>
              <option value="fridge">冰箱</option>
              <option value="freezer">冷冻室</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">保质期至（可选）</label>
            <input
              type="date"
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
              value={expireDate}
              onChange={(e) => setExpireDate(e.target.value)}
            />
          </div>
          <button
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            onClick={handleParse}
            disabled={!rawDescription.trim() || parsing}
          >
            {parsing ? "解析中…" : "解析"}
          </button>
        </div>

        {preview && (
          <div className="mt-4 rounded border border-zinc-200 bg-zinc-50 p-3">
            <p className="mb-2 text-xs text-zinc-500">
              解析结果（可修改后再确认）
              {preview.matchedCanonicalName && (
                <> · 匹配到词典：“{preview.matchedCanonicalName}”</>
              )}
              {!preview.matchedCanonicalName && <> · 词典里没有精确匹配，用了通用估算值</>}
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">名称</label>
                <input
                  className="rounded border border-zinc-300 px-2 py-1 text-sm"
                  value={preview.name}
                  onChange={(e) => setPreview({ ...preview, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">数量</label>
                <input
                  type="number"
                  className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm"
                  value={preview.quantityValue ?? ""}
                  onChange={(e) =>
                    setPreview({ ...preview, quantityValue: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">单位</label>
                <input
                  className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm"
                  value={preview.unit ?? ""}
                  onChange={(e) => setPreview({ ...preview, unit: e.target.value || null })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">估算克数</label>
                <input
                  type="number"
                  className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm"
                  value={preview.estimatedGrams}
                  onChange={(e) => setPreview({ ...preview, estimatedGrams: Number(e.target.value) })}
                />
              </div>
              <button
                className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                onClick={handleConfirmAdd}
                disabled={saving}
              >
                {saving ? "保存中…" : "确认添加"}
              </button>
            </div>
          </div>
        )}
      </section>

      {loading ? (
        <p className="text-sm text-zinc-500">加载中…</p>
      ) : (
        (["pantry", "fridge", "freezer"] as Location[]).map((loc) => (
          <section key={loc}>
            <h2 className="mb-2 text-sm font-semibold text-zinc-500">
              {LOCATION_LABEL[loc]}（{grouped[loc].length}）
            </h2>
            {grouped[loc].length === 0 ? (
              <p className="text-sm text-zinc-400">还没有记录</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {grouped[loc].map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {item.name}
                        {item.quantityValue !== null && item.quantityUnit && (
                          <span className="ml-1 text-sm text-zinc-500">
                            ({item.quantityValue}
                            {item.quantityUnit})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        约 {Math.round(item.estimatedGrams)}g{item.isEstimated && " · 估算"} · 原始输入：“
                        {item.rawDescription}”
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-zinc-500">保质期至</label>
                      <input
                        type="date"
                        className="rounded border border-zinc-300 px-2 py-1 text-xs"
                        defaultValue={item.expireDate ?? ""}
                        onBlur={(e) => handleUpdateExpireDate(item.id, e.target.value)}
                      />
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => handleDelete(item.id)}
                      >
                        删除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}
