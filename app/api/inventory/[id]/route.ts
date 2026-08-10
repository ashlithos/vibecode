import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { inventoryItems } from "@/lib/db/schema";

const EDITABLE_FIELDS = [
  "name",
  "quantityValue",
  "quantityUnit",
  "estimatedGrams",
  "isEstimated",
  "location",
  "expireDate",
  "canonicalIngredientId",
] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }

  const result = db.update(inventoryItems).set(updates).where(eq(inventoryItems.id, id)).run();
  if (result.changes === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const item = db.select().from(inventoryItems).where(eq(inventoryItems.id, id)).get();
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = db.delete(inventoryItems).where(eq(inventoryItems.id, id)).run();
  if (result.changes === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
