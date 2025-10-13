const BASE_URL = '';

class HttpClient {
  private getCurrentLang(): string {
    if (typeof window !== 'undefined') {
      // ✅ On the client, next-intl sets NEXT_LOCALE cookie automatically.
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : 'en';
    } else {
      // ✅ On the server, fallback or set default.
      // (If you want to support SSR calls, you can pass lang manually in options.)
      return 'en';
    }
  }
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const lang = this.getCurrentLang();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': lang,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: options?.method ?? 'GET',
    });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const http = new HttpClient();
