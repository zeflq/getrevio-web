"use client";

import { useState } from "react";
import { http } from "@/shared/lib/http";
import { extractApiError } from "@/lib/api/errorHandler";
import { useErrorTranslation } from "@/hooks/useErrorTranslation";
import endpoints from "@/shared/api/endpoints.json";

export interface CompleteOnboardingRequest {
  merchant: {
    name: string;
    email?: string;
  };
  place: {
    localName: string;
    address: string;
  };
}

export interface CompleteOnboardingResponse {
  merchant: {
    id: string;
    name: string;
    email: string | null;
  };
  place: {
    id: string;
    localName: string;
    address: string;
  };
}

export function useCompleteOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { translateError } = useErrorTranslation();

  const completeOnboarding = async (
    data: CompleteOnboardingRequest
  ): Promise<CompleteOnboardingResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use shared HTTP client
      const result = await http.post<CompleteOnboardingResponse>(
        endpoints.onboarding.complete,
        data
      );

      return result;
    } catch (err) {
      // HttpError from shared client includes status and body
      const apiError = extractApiError(err);
      const translatedMessage = translateError(apiError.code);

      setError(translatedMessage);
      throw new Error(translatedMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completeOnboarding,
    isLoading,
    error,
  };
}
