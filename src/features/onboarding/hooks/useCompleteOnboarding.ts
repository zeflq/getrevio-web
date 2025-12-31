"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

  const completeOnboarding = async (
    data: CompleteOnboardingRequest
  ): Promise<CompleteOnboardingResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/onboarding/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to complete onboarding");
      }

      const result = await res.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
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
