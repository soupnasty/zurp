export { testClassification } from "./classification-layer";
export { testNormalization } from "./normalization-layer";
export { testMatching } from "./matching-layer";
export { testCalculation } from "./calculation-layer";
export type {
  LayerResult,
  Mismatch,
  PersonaResult,
  LayerName,
  Severity,
} from "./types";
export { emptyLayerResult } from "./types";
export {
  toMatcherTx,
  toCalculatorTx,
  buildMatcherConfig,
  buildCapState,
} from "./adapters";
