'use client';

import { useTranslations } from 'next-intl';
import type { ErrorCode } from '@/lib/errors';
import { ErrorCodes } from '@/lib/errors';

/**
 * Hook for translating error codes to user-friendly messages
 * Uses next-intl for i18n support
 */
export function useErrorTranslation() {
  const t = useTranslations('errors');

  /**
   * Translate an error code to a localized message
   * Falls back to UNKNOWN_ERROR if translation not found
   */
  const translateError = (code: ErrorCode | string): string => {
    try {
      // Try to get translation for the error code
      const translated = t(code as any);

      // If translation returns the same key, it means translation not found
      if (translated === code) {
        console.warn(`Missing translation for error code: ${code}`);
        return t(ErrorCodes.UNKNOWN_ERROR);
      }

      return translated;
    } catch (error) {
      console.error('Error translating error code:', error);
      return t(ErrorCodes.UNKNOWN_ERROR);
    }
  };

  return {
    translateError,
    t, // Expose raw translations function for custom usage
  };
}
