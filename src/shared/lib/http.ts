const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class HttpError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

class HttpClient {
  private getCurrentLang(): string {
    if (typeof window !== "undefined") {
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : "en";
    } else {
      return "en";
    }
  }

  private redirectToLogin(lang: string) {
    if (typeof window === "undefined") return;

    const currentPath = window.location.pathname + window.location.search;
    const loginPath = `/${lang}/login?from=${encodeURIComponent(currentPath)}`;

    // Use assign so it appears in history (user can go back if needed)
    window.location.assign(loginPath);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const lang = this.getCurrentLang();

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": lang,
        ...options?.headers,
      },
      credentials: options?.credentials ?? "include",
    });

    // Handle UNAUTHORIZED globally
    if (response.status === 401) {
      this.redirectToLogin(lang);
      throw new HttpError(401, "UNAUTHORIZED");
    }

    // Try to parse JSON for error details (if any)
    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        // ignore JSON parsing errors
      }

      const message =
        (body as any)?.error ||
        (body as any)?.message ||
        `HTTP error! status: ${response.status}`;

      throw new HttpError(response.status, message, body);
    }

    // No content
    if (response.status === 204) {
      return undefined as T;
    }

    const json = await response.json();

    // Unwrap backend response envelope: {success: true, data: ...} -> data
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return json.data as T;
    }

    return json;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: options?.method ?? "GET",
    });
  }

  async post<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

export const http = new HttpClient();
