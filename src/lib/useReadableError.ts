import { useTranslations } from "next-intl";

/**
 * Safe, localized, and user-friendly error message extractor.
 * - Never exposes technical details.
 * - Supports localization via `next-intl`.
 * - Returns a message suitable for toast or UI display.
 */
export function useReadableError() {
  const t = useTranslations("errors");

  return function readableError(error: unknown, fallbackKey = "generic") {
    if (!error) return t(fallbackKey);

    // ✅ Next Safe Action or backend structured error
    if (typeof error === "object" && error !== null) {
      const any = error as any;

      // If the backend sends a known `code` (preferred), translate it
      if (any.code && typeof any.code === "string") {
        return t(any.code, { defaultValue: t(fallbackKey) });
      }

      // Handle safe message patterns (non-technical)
      if (typeof any.error === "string") {
        return mapSafeMessage(any.error, t, fallbackKey);
      }

      // Fallback on API shape
      const message =
        any?.response?.data?.message ||
        any?.response?.data?.error ||
        any?.message;

      if (typeof message === "string") {
        return mapSafeMessage(message, t, fallbackKey);
      }
    }

    if (typeof error === "string") {
      return mapSafeMessage(error, t, fallbackKey);
    }

    return t(fallbackKey);
  };
}

/**
 * Map raw or technical errors into safe, translated keys.
 */
function mapSafeMessage(message: string, t: ReturnType<typeof useTranslations>, fallbackKey: string) {
  const safeMap: Record<string, string> = {
    unauthorized: "unauthorized",
    forbidden: "forbidden",
    not_found: "notFound",
    timeout: "timeout",
    conflict: "conflict",
    validation_failed: "validation",
  };

  const normalized = message.toLowerCase();

  // Try to match known safe codes
  for (const key in safeMap) {
    if (normalized.includes(key)) {
      return t(safeMap[key]);
    }
  }

  // Default fallback (no technical detail shown)
  return t(fallbackKey);
}
