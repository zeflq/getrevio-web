import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' }
];

export function switchLocale(newLocale: string) {
  if (typeof window === 'undefined') return;

  const segments = window.location.pathname.split('/');
  const supportedLocales = languages.map(lang => lang.code);

  if (supportedLocales.includes(segments[1])) {
    segments[1] = newLocale;
  } else {
    segments.splice(1, 0, newLocale);
  }

  window.location.pathname = segments.join('/');
}
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/');
  const supportedLocales = languages.map(lang => lang.code);
  
  if (segments.length > 1 && supportedLocales.includes(segments[1])) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}