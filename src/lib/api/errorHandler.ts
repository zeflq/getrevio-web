import type { ErrorCode } from '@/lib/errors';
import { ErrorCodes, getErrorCode } from '@/lib/errors';

/**
 * API Error structure matching backend response
 */
export interface ApiError {
  message: string;
  code: ErrorCode;
  statusCode: number;
}

/**
 * Extract API error from unknown error object
 * Handles errors from fetch, axios, and server actions
 */
export function extractApiError(error: unknown): ApiError {
  // Default error
  const defaultError: ApiError = {
    message: 'An unexpected error occurred',
    code: ErrorCodes.UNKNOWN_ERROR,
    statusCode: 500,
  };

  // Handle null/undefined
  if (!error) {
    return defaultError;
  }

  // Handle fetch Response error
  if (error instanceof Response) {
    return {
      message: error.statusText || defaultError.message,
      code: ErrorCodes.UNKNOWN_ERROR,
      statusCode: error.status || 500,
    };
  }

  // Handle object with response property (axios-like)
  if (typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;

    return {
      message: response?.data?.message || defaultError.message,
      code: getErrorCode(response?.data?.code),
      statusCode: response?.status || defaultError.statusCode,
    };
  }

  // Handle HttpError from shared HTTP client
  if (typeof error === 'object' && 'status' in error && 'body' in error) {
    const httpError = error as any;
    const body = httpError.body;

    return {
      message: body?.message || body?.error?.message || httpError.message || defaultError.message,
      code: getErrorCode(body?.code || body?.error?.code),
      statusCode: httpError.status || defaultError.statusCode,
    };
  }

  // Handle plain error object (server actions, direct API errors)
  if (typeof error === 'object') {
    const errorObj = error as any;

    return {
      message: errorObj.message || errorObj.error?.message || defaultError.message,
      code: getErrorCode(errorObj.code || errorObj.error?.code),
      statusCode: errorObj.statusCode || errorObj.status || defaultError.statusCode,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      code: ErrorCodes.UNKNOWN_ERROR,
      statusCode: 500,
    };
  }

  return defaultError;
}

/**
 * Check if error is a specific error code
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  const apiError = extractApiError(error);
  return apiError.code === code;
}

/**
 * Check if error is a validation error (400 status)
 */
export function isValidationError(error: unknown): boolean {
  const apiError = extractApiError(error);
  return apiError.statusCode === 400;
}

/**
 * Check if error is an authentication error (401 status)
 */
export function isAuthError(error: unknown): boolean {
  const apiError = extractApiError(error);
  return apiError.statusCode === 401;
}

/**
 * Check if error is a forbidden error (403 status)
 */
export function isForbiddenError(error: unknown): boolean {
  const apiError = extractApiError(error);
  return apiError.statusCode === 403;
}

/**
 * Check if error is a not found error (404 status)
 */
export function isNotFoundError(error: unknown): boolean {
  const apiError = extractApiError(error);
  return apiError.statusCode === 404;
}
