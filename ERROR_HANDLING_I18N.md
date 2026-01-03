# Error Handling with i18n - Implementation Guide

This document explains how business error codes from the backend API are handled and translated in the Next.js frontend.

## 🎯 Overview

The error handling system provides:
- ✅ **Type-safe error codes** shared between backend and frontend
- ✅ **Automatic translation** of error codes to user-friendly messages
- ✅ **Consistent error handling** across all API calls
- ✅ **Multi-language support** (English and French)
- ✅ **Easy integration** with React Hook Form and React Query

## 📁 Project Structure

```
src/
├── lib/
│   ├── errors/
│   │   ├── errorCodes.ts          # Error code constants (shared with backend)
│   │   └── index.ts                # Exports
│   │
│   └── api/
│       └── errorHandler.ts         # API error extraction utilities
│
├── hooks/
│   └── useErrorTranslation.ts      # Translation hook
│
└── messages/
    ├── en.json                     # English translations
    └── fr.json                     # French translations
```

## 🔧 Components

### 1. Error Codes (`lib/errors/errorCodes.ts`)

Centralized constants for all business error codes:

```typescript
import { ErrorCodes } from '@/lib/errors';

// Generic
ErrorCodes.UNKNOWN_ERROR
ErrorCodes.INVALID_INPUT
ErrorCodes.UNAUTHORIZED

// Onboarding
ErrorCodes.ORGANIZATION_CREATION_FAILED
ErrorCodes.MERCHANT_EMAIL_ALREADY_EXISTS

// Places
ErrorCodes.PLACE_NOT_FOUND

// ... 30+ error codes
```

### 2. Error Handler (`lib/api/errorHandler.ts`)

Utilities for extracting error information from API responses:

```typescript
import { extractApiError, isErrorCode } from '@/lib/api/errorHandler';

// Extract structured error from any error type
const apiError = extractApiError(error);
// Returns: { message: string, code: ErrorCode, statusCode: number }

// Check for specific error code
if (isErrorCode(error, ErrorCodes.MERCHANT_EMAIL_ALREADY_EXISTS)) {
  // Handle duplicate email
}

// Check error type by status code
if (isValidationError(error)) { }  // 400
if (isAuthError(error)) { }        // 401
if (isForbiddenError(error)) { }   // 403
if (isNotFoundError(error)) { }    // 404
```

### 3. Translation Hook (`hooks/useErrorTranslation.ts`)

React hook for translating error codes:

```typescript
import { useErrorTranslation } from '@/hooks/useErrorTranslation';

function MyComponent() {
  const { translateError } = useErrorTranslation();

  const message = translateError(ErrorCodes.PLACE_NOT_FOUND);
  // English: "Location not found. It may have been deleted..."
  // French:  "Lieu introuvable. Il a peut-être été supprimé..."
}
```

## 📖 Usage Examples

### Example 1: Custom Hook with Error Handling

```typescript
// features/onboarding/hooks/useCompleteOnboarding.ts
"use client";

import { useState } from "react";
import { extractApiError } from "@/lib/api/errorHandler";
import { useErrorTranslation } from "@/hooks/useErrorTranslation";
import { ErrorCodes } from "@/lib/errors";

export function useCompleteOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { translateError } = useErrorTranslation();

  const completeOnboarding = async (data: CompleteOnboardingRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/onboarding/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Parse error response
        const errorData = await res.json().catch(() => ({
          message: "Failed to complete onboarding",
          code: ErrorCodes.UNKNOWN_ERROR,
        }));

        // Extract structured error
        const apiError = extractApiError({
          response: {
            data: errorData,
            status: res.status,
          },
        });

        // Translate to user-friendly message
        const translatedMessage = translateError(apiError.code);
        setError(translatedMessage);
        throw new Error(translatedMessage);
      }

      return await res.json();
    } catch (err) {
      if (err instanceof Error) {
        if (!error) {
          const apiError = extractApiError(err);
          const translatedMessage = translateError(apiError.code);
          setError(translatedMessage);
        }
        throw err;
      }

      const fallbackMessage = translateError(ErrorCodes.UNKNOWN_ERROR);
      setError(fallbackMessage);
      throw new Error(fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { completeOnboarding, isLoading, error };
}
```

### Example 2: React Query Integration

```typescript
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useErrorTranslation } from '@/hooks/useErrorTranslation';
import { extractApiError } from '@/lib/api/errorHandler';

export function usePlaceCreateAction() {
  const { toast } = useToast();
  const { translateError } = useErrorTranslation();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/v1/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData; // { message, code, statusCode }
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Location created successfully',
      });
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      const translatedMessage = translateError(apiError.code);

      toast({
        title: 'Error',
        description: translatedMessage,
        variant: 'destructive',
      });
    },
  });
}
```

### Example 3: Form-Level Errors

```typescript
import { useForm } from 'react-hook-form';
import { useErrorTranslation } from '@/hooks/useErrorTranslation';
import { extractApiError } from '@/lib/api/errorHandler';
import { ErrorCodes } from '@/lib/errors';

export function CreatePlaceDialog() {
  const { translateError } = useErrorTranslation();
  const { mutateAsync } = usePlaceCreateAction();

  const form = useForm();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await mutateAsync(data);
      form.reset();
    } catch (error) {
      const apiError = extractApiError(error);

      // Set form-level error
      form.setError('root', {
        message: translateError(apiError.code),
      });

      // Or set field-specific error
      if (apiError.code === ErrorCodes.MERCHANT_EMAIL_ALREADY_EXISTS) {
        form.setError('email', {
          message: translateError(apiError.code),
        });
      }
    }
  });

  return (
    <form onSubmit={onSubmit}>
      {/* Fields */}

      {/* Show root error */}
      {form.formState.errors.root && (
        <Alert variant="destructive">
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit">Create</Button>
    </form>
  );
}
```

### Example 4: Field-Specific Error Mapping

```typescript
const onSubmit = form.handleSubmit(async (data) => {
  try {
    await mutateAsync(data);
  } catch (error) {
    const apiError = extractApiError(error);

    // Map specific error codes to form fields
    const errorFieldMap: Record<string, string> = {
      [ErrorCodes.MERCHANT_EMAIL_ALREADY_EXISTS]: 'email',
      [ErrorCodes.INVALID_INPUT]: 'root',
      [ErrorCodes.PLACE_NOT_FOUND]: 'placeId',
    };

    const field = errorFieldMap[apiError.code] || 'root';
    const translatedMessage = translateError(apiError.code);

    form.setError(field as any, {
      message: translatedMessage,
    });
  }
});
```

## 🌍 Translation Files

### English (`messages/en.json`)

```json
{
  "errors": {
    "ORGANIZATION_CREATION_FAILED": "Failed to create your organization. Please try again or contact support if the problem persists.",
    "MERCHANT_EMAIL_ALREADY_EXISTS": "This email address is already registered. Please use a different email or sign in to your existing account.",
    "PLACE_NOT_FOUND": "Location not found. It may have been deleted or you don't have access to it."
  }
}
```

### French (`messages/fr.json`)

```json
{
  "errors": {
    "ORGANIZATION_CREATION_FAILED": "Échec de la création de votre organisation. Veuillez réessayer ou contacter le support si le problème persiste.",
    "MERCHANT_EMAIL_ALREADY_EXISTS": "Cette adresse e-mail est déjà enregistrée. Veuillez utiliser une autre adresse ou vous connecter à votre compte existant.",
    "PLACE_NOT_FOUND": "Lieu introuvable. Il a peut-être été supprimé ou vous n'y avez pas accès."
  }
}
```

## ✅ Best Practices

1. **Always use error codes from backend**
   ```typescript
   // ❌ Don't hardcode error messages
   throw new Error("User not found");

   // ✅ Use error codes
   throw new NotFoundError("User not found", ErrorCodes.USER_NOT_FOUND);
   ```

2. **Extract errors consistently**
   ```typescript
   // ✅ Always use extractApiError
   const apiError = extractApiError(error);
   const message = translateError(apiError.code);
   ```

3. **Provide fallback messages**
   ```typescript
   // ✅ Translation falls back to UNKNOWN_ERROR
   const message = translateError(someCode || ErrorCodes.UNKNOWN_ERROR);
   ```

4. **Handle specific error codes when needed**
   ```typescript
   if (apiError.code === ErrorCodes.MERCHANT_EMAIL_ALREADY_EXISTS) {
     // Show "use different email" hint
   } else if (apiError.code === ErrorCodes.ORGANIZATION_CREATION_FAILED) {
     // Show contact support option
   }
   ```

5. **Log errors for debugging**
   ```typescript
   catch (error) {
     const apiError = extractApiError(error);
     console.error('API Error:', {
       code: apiError.code,
       message: apiError.message,
       statusCode: apiError.statusCode,
     });
   }
   ```

## 🔄 Backend Integration

The backend API returns errors in this format:

```json
{
  "success": false,
  "error": {
    "message": "This email address is already registered",
    "code": "MERCHANT_EMAIL_ALREADY_EXISTS",
    "statusCode": 409
  }
}
```

The frontend automatically:
1. Extracts the `code` field
2. Looks up the translation in `messages/{locale}.json`
3. Displays the translated message to the user

## 📝 Adding New Error Codes

When adding a new error code:

1. **Add to backend** (`/Users/nour/projects/getrevio-api/src/core/errors/ErrorCodes.ts`):
   ```typescript
   export const ErrorCodes = {
     // ...
     MY_NEW_ERROR: 'MY_NEW_ERROR',
   } as const;
   ```

2. **Add to frontend** (`src/lib/errors/errorCodes.ts`):
   ```typescript
   export const ErrorCodes = {
     // ...
     MY_NEW_ERROR: 'MY_NEW_ERROR',
   } as const;
   ```

3. **Add translations** (`messages/en.json` and `messages/fr.json`):
   ```json
   {
     "errors": {
       "MY_NEW_ERROR": "English translation here"
     }
   }
   ```

4. **Use in backend**:
   ```typescript
   throw new BadRequestError('Something wrong', ErrorCodes.MY_NEW_ERROR);
   ```

5. **Frontend automatically handles it**:
   ```typescript
   // No changes needed! Translation happens automatically
   const { translateError } = useErrorTranslation();
   const message = translateError(ErrorCodes.MY_NEW_ERROR);
   ```

## 🧪 Testing

```typescript
import { extractApiError, isErrorCode } from '@/lib/api/errorHandler';
import { ErrorCodes } from '@/lib/errors';

describe('Error Handling', () => {
  it('should extract error code from API response', () => {
    const error = {
      response: {
        data: {
          message: 'Email already exists',
          code: 'MERCHANT_EMAIL_ALREADY_EXISTS',
        },
        status: 409,
      },
    };

    const apiError = extractApiError(error);

    expect(apiError.code).toBe(ErrorCodes.MERCHANT_EMAIL_ALREADY_EXISTS);
    expect(apiError.statusCode).toBe(409);
  });

  it('should translate error codes', () => {
    const { result } = renderHook(() => useErrorTranslation(), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en" messages={enMessages}>
          {children}
        </IntlProvider>
      ),
    });

    const message = result.current.translateError(ErrorCodes.PLACE_NOT_FOUND);
    expect(message).toContain('Location not found');
  });
});
```

## 🎉 Summary

This error handling system provides:
- **Centralized** error code management
- **Type-safe** error handling with TypeScript
- **Automatic** translation to user's language
- **Consistent** UX across the application
- **Easy** integration with existing code

All backend error codes are automatically translated and displayed to users in their preferred language!
