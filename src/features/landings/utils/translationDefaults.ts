export type TranslationFn = (key: string) => string;

export const applyTranslationDefaults = <T extends Record<string, unknown>>(
  base: T,
  translator: TranslationFn | undefined,
  namespace: string,
  kind: string
): T => {
  if (!translator) return base;

  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => {
      if (typeof value === "string") {
        const localKey = `${namespace}.${kind}.defaults.${key}`;
        const translated = translator(localKey);

        const missingBecausePrefixed =
          translated !== localKey &&
          translated.includes(localKey);

        const missingBecauseExact = translated === localKey;

        const missing = missingBecausePrefixed || missingBecauseExact;

        if (!missing) {
          return [key, translated];
        }

        return [key, value];
      }

      return [key, value];
    })
  ) as T;
};

