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

const I18N_PREFIX = "i18n:";

export const applyOverrideTranslations = <T extends Record<string, unknown>>(
  overrides: T,
  translator?: TranslationFn
): T => {
  if (!translator) return overrides;

  return Object.fromEntries(
    Object.entries(overrides).map(([key, value]) => {
      if (typeof value === "string" && value.startsWith(I18N_PREFIX)) {
        const i18nKey = value.slice(I18N_PREFIX.length);
        const translated = translator(i18nKey);

        const missing =
          translated === i18nKey || translated.includes(i18nKey);

        return [key, missing ? value : translated];
      }

      return [key, value];
    })
  ) as T;
};
