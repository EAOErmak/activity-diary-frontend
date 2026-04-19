export const METRIC_VALUE_MAX_DECIMALS = 5

const METRIC_VALUE_DRAFT_REGEX = /^\d*(?:[.,]\d{0,5})?$/
const METRIC_VALUE_NORMALIZED_REGEX = /^\d*(?:\.\d{0,5})?$/

export type MetricValueValidationError =
  | "required"
  | "invalid"
  | "positive"
  | "scale"

export function isMetricValueDraft(value: string) {
  return METRIC_VALUE_DRAFT_REGEX.test(value)
}

export function normalizeMetricValueInput(value: string) {
  return value.trim().replace(",", ".")
}

export function formatMetricValueForForm(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return ""
  }

  return value.toString()
}

function getFractionDigitsCount(value: string) {
  const [, fraction = ""] = value.split(".")
  return fraction.length
}

export function validateMetricValueInput(
  value: string
): MetricValueValidationError | null {
  const normalized = normalizeMetricValueInput(value)

  if (normalized === "") {
    return "required"
  }

  if (!METRIC_VALUE_NORMALIZED_REGEX.test(normalized)) {
    return getFractionDigitsCount(normalized) > METRIC_VALUE_MAX_DECIMALS
      ? "scale"
      : "invalid"
  }

  if (getFractionDigitsCount(normalized) > METRIC_VALUE_MAX_DECIMALS) {
    return "scale"
  }

  if (normalized === ".") {
    return "invalid"
  }

  const parsed = Number(normalized)

  if (!Number.isFinite(parsed)) {
    return "invalid"
  }

  if (parsed <= 0) {
    return "positive"
  }

  return null
}

export function parseMetricValueInput(value: string) {
  if (validateMetricValueInput(value) !== null) {
    return null
  }

  return Number(normalizeMetricValueInput(value))
}
