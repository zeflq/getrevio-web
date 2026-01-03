/**
 * Business Error Codes
 * Shared with backend API for consistent error handling
 *
 * These codes are used for:
 * - API error responses
 * - i18n translation keys
 * - Type-safe error handling
 */

export const ErrorCodes = {
  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  CONFLICT: 'CONFLICT',

  // Pagination
  PAGINATION_WINDOW_EXCEEDED: 'PAGINATION_WINDOW_EXCEEDED',

  // Onboarding
  ORGANIZATION_CREATION_FAILED: 'ORGANIZATION_CREATION_FAILED',
  MERCHANT_EMAIL_ALREADY_EXISTS: 'MERCHANT_EMAIL_ALREADY_EXISTS',

  // Places
  PLACE_NOT_FOUND: 'PLACE_NOT_FOUND',

  // Merchants
  MERCHANT_NOT_FOUND: 'MERCHANT_NOT_FOUND',
  MERCHANT_ACCESS_FORBIDDEN: 'MERCHANT_ACCESS_FORBIDDEN',
  MERCHANT_CREATION_FORBIDDEN: 'MERCHANT_CREATION_FORBIDDEN',

  // Campaigns
  CAMPAIGN_NOT_FOUND: 'CAMPAIGN_NOT_FOUND',

  // Themes
  THEME_NOT_FOUND: 'THEME_NOT_FOUND',

  // Landings
  LANDING_NOT_FOUND: 'LANDING_NOT_FOUND',
  LANDING_ACCESS_FORBIDDEN: 'LANDING_ACCESS_FORBIDDEN',

  // Shortlinks
  SHORTLINK_NOT_FOUND: 'SHORTLINK_NOT_FOUND',
  SHORTLINK_EXPIRES_AT_INVALID: 'SHORTLINK_EXPIRES_AT_INVALID',
  SHORTLINK_LANDING_INVALID: 'SHORTLINK_LANDING_INVALID',
  SHORTLINK_LANDING_CONFLICT: 'SHORTLINK_LANDING_CONFLICT',
  SHORTLINK_CODE_GENERATION_FAILED: 'SHORTLINK_CODE_GENERATION_FAILED',

  // Lottery Configs
  LOTTERY_CONFIG_NOT_FOUND: 'LOTTERY_CONFIG_NOT_FOUND',

  // Google Places
  TENANT_ID_REQUIRED: 'TENANT_ID_REQUIRED',
  GOOGLE_OAUTH_REQUIRED: 'GOOGLE_OAUTH_REQUIRED',
  GOOGLE_ACCOUNT_FETCH_FAILED: 'GOOGLE_ACCOUNT_FETCH_FAILED',
  GOOGLE_BUSINESS_ACCOUNT_NOT_FOUND: 'GOOGLE_BUSINESS_ACCOUNT_NOT_FOUND',
  GOOGLE_API_ERROR: 'GOOGLE_API_ERROR',

  // Auth
  NO_ACTIVE_ORGANIZATION: 'NO_ACTIVE_ORGANIZATION',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Type guard to check if a string is a valid error code
 */
export function isValidErrorCode(code: string): code is ErrorCode {
  return Object.values(ErrorCodes).includes(code as ErrorCode);
}

/**
 * Get error code from unknown value, defaults to UNKNOWN_ERROR
 */
export function getErrorCode(code: unknown): ErrorCode {
  if (typeof code === 'string' && isValidErrorCode(code)) {
    return code;
  }
  return ErrorCodes.UNKNOWN_ERROR;
}
