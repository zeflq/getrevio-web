export type TranslationFn = (key: string) => string;

export const applyTranslationDefaults = <T extends Record<string, unknown>>(
  base: T,
  translator: TranslationFn | undefined,
  namespace: string,
  kind: string
): T => {
  if (!translator) {
    return base;
  }

  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => {
      if (typeof value === "string") {
        const i18nKey = `${namespace}.${kind}.defaults.${key}`;
        const translated = translator(i18nKey);

        if (translated && translated !== i18nKey) {
          return [key, translated];
        }

        return [key, value];
      }

      return [key, value];
    })
  ) as T;
};
