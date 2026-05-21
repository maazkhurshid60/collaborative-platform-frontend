/**
 * Determines if a specific option in a checkbox group field is checked
 * based on the submission data. Supports array, single string, or key-value object formats.
 */
export function isCheckboxOptionChecked(
  option: string,
  submittedValue: any,
): boolean {
  if (submittedValue === undefined || submittedValue === null) {
    return false;
  }

  let parsed = submittedValue;
  if (typeof submittedValue === "string") {
    const trimmed = submittedValue.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        parsed = JSON.parse(trimmed);
      } catch (e) {
        // Not a valid JSON, keep as string
      }
    }
  }

  const cleanOption = option.trim();

  // Array format: ["Option A", "Option C"]
  if (Array.isArray(parsed)) {
    return parsed.some(
      (item) => typeof item === "string" && item.trim() === cleanOption,
    );
  }

  // Object format: { "Option A": true, "Option B": false }
  if (typeof parsed === "object" && parsed !== null) {
    const matchingKey = Object.keys(parsed).find(
      (k) => k.trim() === cleanOption,
    );
    if (matchingKey) {
      const val = parsed[matchingKey];
      return (
        val === true ||
        val === "true" ||
        val === "on" ||
        val === 1 ||
        val === "1"
      );
    }
    return false;
  }

  // String format: "Option A" or comma-separated "Option A, Option B"
  if (typeof parsed === "string") {
    if (parsed.includes(",")) {
      return parsed
        .split(",")
        .map((s) => s.trim())
        .includes(cleanOption);
    }
    return parsed.trim() === cleanOption;
  }

  // Boolean format: true/false (fallback for single-item checkbox groups)
  if (typeof parsed === "boolean") {
    return parsed;
  }

  return false;
}

/**
 * Determines if a boolean checkbox field is checked based on the submission data.
 */
export function isBooleanChecked(value: any): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  return (
    value === true ||
    value === "true" ||
    value === "on" ||
    value === "1" ||
    value === 1 ||
    value === "yes" ||
    value === "checked"
  );
}

export function formatDateValue(value: any): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  return String(value);
}
