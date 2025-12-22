/**
 * Shared types for addon/block i18n system
 */

export interface AddonI18n {
  kind: string;
  label: {
    en: string;
    fr?: string;
    ar?: string;
  };
  description?: {
    en: string;
    fr?: string;
    ar?: string;
  };
  inspector?: {
    title?: {
      en: string;
      fr?: string;
      ar?: string;
    };
    fields?: Record<
      string,
      {
        label: {
          en: string;
          fr?: string;
          ar?: string;
        };
        placeholder?: {
          en: string;
          fr?: string;
          ar?: string;
        };
      }
    >;
  };
}

export interface BlockI18n {
  kind: string;
  label: {
    en: string;
    fr?: string;
    ar?: string;
  };
  description?: {
    en: string;
    fr?: string;
    ar?: string;
  };
}

export type Locale = "en" | "fr" | "ar";
