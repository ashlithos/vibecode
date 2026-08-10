import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { inventoryItems, type InventoryLocation, type InventorySource } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const items = db.select().from(inventoryItems).orderBy(desc(inventoryItems.createdAt)).all();
  return NextResponse.json({ items });
}

/** Creates an inventory item from user-confirmed fields (client calls /api/inventory/parse first, lets the user edit, then posts here). */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawDescription = String(body.rawDescription ?? "").trim();
  const name = String(body.name ?? "").trim();
  if (!rawDescription || !name) {
    return NextResponse.json({ error: "rawDescription and name are required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const item = {
    id: randomUUID(),
    rawDescription,
    canonicalIngredientId: body.canonicalIngredientId ?? null,
    name,
    quantityValue: body.quantityValue ?? null,
    quantityUnit: body.quantityUnit ?? null,
    estimatedGrams: Number(body.estimatedGrams ?? 0),
    isEstimated: body.isEstimated ?? true,
    location: (body.location ?? "pantry") as InventoryLocation,
    expireDate: body.expireDate ?? null,
    source: (body.source ?? "manual") as InventorySource,
    createdAt: now,
    updatedAt: now,
  };

  db.insert(inventoryItems).values(item).run();
  return NextResponse.json({ item }, { status: 201 });
}
