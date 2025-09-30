
export interface TranslatorOptions {
  locale: string;
  namespace?: string;
}

export async function loadMessages(locale: string) {
  switch (locale) {
    case 'fr':
      return (await import('../../messages/fr.json')).default;
    case 'en':
    default:
      return (await import('../../messages/en.json')).default;
  }
}
