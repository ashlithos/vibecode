import { NextRequest, NextResponse } from "next/server";
import { parseQuantityLine } from "@/lib/food-engine/parser";
import { getDictionaryIndex, resolveParsedQuantity } from "@/lib/food-engine/server";

/** Preview-only: parses a freeform description (e.g. "五包海苔") and resolves it against the dictionary, without writing to the DB. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawDescription = String(body.rawDescription ?? "").trim();
  if (!rawDescription) {
    return NextResponse.json({ error: "rawDescription is required" }, { status: 400 });
  }

  const parsed = parseQuantityLine(rawDescription);
  const index = getDictionaryIndex();
  const resolved = resolveParsedQuantity(parsed, index);

  return NextResponse.json({ resolved });
}
