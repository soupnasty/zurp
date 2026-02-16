/**
 * Integration Test Types
 *
 * Shared result interfaces for all test layers. Each layer produces a LayerResult
 * containing pass/fail counts and detailed mismatch records with severity classification.
 */

export type LayerName =
  | "classification"
  | "normalization"
  | "matching"
  | "calculation";

export type Severity =
  | "bug" // Engine returned wrong result for data that IS in production maps/configs
  | "gap" // Merchant/category not in maps — expected, not a code bug
  | "oracle_error"; // Fixture's _meta oracle is wrong — persona/generator needs fixing

export interface LayerResult {
  layer: LayerName;
  tested: number;
  passed: number;
  failed: number;
  skipped: number;
  mismatches: Mismatch[];
}

export interface Mismatch {
  txId: string;
  merchant: string | null;
  card: string;
  persona: string;
  layer: LayerName;
  expected: string;
  actual: string;
  severity: Severity;
  detail: string; // Human-readable explanation for triage
}

export interface PersonaResult {
  card: string;
  persona: string;
  totalTransactions: number;
  layers: LayerResult[];
}

export function emptyLayerResult(layer: LayerName): LayerResult {
  return { layer, tested: 0, passed: 0, failed: 0, skipped: 0, mismatches: [] };
}
