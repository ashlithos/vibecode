import type { ParsedQuantity } from "./types";
import { UNIT_VOCAB, parseNumberToken } from "./units";
import { normalizeName } from "./normalize";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const UNIT_ALT = UNIT_VOCAB.map(escapeRegex).join("|");
// "两" is deliberately its own alternative (not folded into the repeating char class below): as a
// standalone token it's the colloquial numeral "2" (两个/两包), but it's also a weight unit itself
// (三两 = 3 liang) via UNIT_VOCAB, so it must never be glued onto an adjacent numeral like "三".
const QTY_TOKEN = String.raw`(?:\d+\.\d+|\d+\/\d+|\d+|两|[一二三四五六七八九十半]+)`;

// "五包海苔", "2个鸡蛋", "1/2杯面粉", "一大桶肉松" (allows a size adjective like 大/小/整 between qty and unit)
const PREFIX_RE = new RegExp(`^\\s*(${QTY_TOKEN})\\s*(?:大|小|整)?\\s*(${UNIT_ALT})\\s*(.+)$`);
// "海苔 5包", "生抽 15ml", "西红柿 3个"
const SUFFIX_RE = new RegExp(`^(.+?)\\s*(${QTY_TOKEN})?\\s*(${UNIT_ALT})\\s*$`);

const VAGUE_AMOUNT_RE = /适量|少许|少量/;

/**
 * Parses one freeform quantity line, e.g. "五包海苔" or "生抽 15ml" or "盐 适量",
 * into a name + optional quantity + unit. Used by both the inventory freeform-text
 * input and (per-line) by the recipe text parser.
 */
export function parseQuantityLine(raw: string): ParsedQuantity {
  const line = raw.trim().replace(/^[\s•\-*\d]*[.)、]\s*/, "");

  const prefixMatch = line.match(PREFIX_RE);
  if (prefixMatch) {
    const [, qtyStr, unit, name] = prefixMatch;
    const value = parseNumberToken(qtyStr);
    return {
      rawText: raw,
      name: normalizeName(name) || name.trim(),
      quantityValue: value,
      unit,
      confidence: value !== null ? "high" : "medium",
    };
  }

  const suffixMatch = line.match(SUFFIX_RE);
  if (suffixMatch) {
    const [, name, qtyStr, unit] = suffixMatch;
    const value = parseNumberToken(qtyStr);
    return {
      rawText: raw,
      name: normalizeName(name) || name.trim(),
      quantityValue: value,
      unit,
      confidence: value !== null ? "high" : "medium",
    };
  }

  // No recognizable unit token. "盐 适量" / "少许葱花" etc still tell us *something* was specified.
  const vague = VAGUE_AMOUNT_RE.test(line);
  const name = normalizeName(line) || line.trim();
  return {
    rawText: raw,
    name,
    quantityValue: null,
    unit: null,
    confidence: vague ? "medium" : "low",
  };
}
