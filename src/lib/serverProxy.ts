import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ProxyOptionsBase {
  /**
   * The API endpoint to call (e.g., "/api/v1/shortlinks/:code/qr")
   */
  endpoint: string;

  /**
   * Optional: NextRequest to get cookies from (for API routes)
   * If not provided, will use cookies() for Server Components/Actions
   */
  request?: NextRequest;

  /**
   * Optional: Additional headers to include
   */
  headers?: HeadersInit;

  /**
   * Optional: Fetch options
   */
  fetchOptions?: RequestInit;
}

interface ProxyOptionsJSON extends ProxyOptionsBase {
  responseType?: "json";
}

interface ProxyOptionsBinary extends ProxyOptionsBase {
  responseType: "binary";
}

type ProxyOptions = ProxyOptionsJSON | ProxyOptionsBinary;

/**
 * Server-side proxy to forward requests to the backend API with cookies
 * Handles binary responses (images, PDFs, etc.)
 */
export async function proxyToAPI(options: ProxyOptionsBinary): Promise<Response>;

/**
 * Server-side proxy to forward requests to the backend API with cookies
 * Handles JSON responses
 */
export async function proxyToAPI<T = unknown>(options: ProxyOptionsJSON): Promise<T>;

/**
 * Implementation
 */
export async function proxyToAPI<T = unknown>(
  options: ProxyOptions
): Promise<T | Response> {
  const {
    endpoint,
    request,
    responseType = "json",
    headers = {},
    fetchOptions = {},
  } = options;

  try {
    // Get cookies either from NextRequest or from cookies()
    let cookieHeader: string;

    if (request) {
      // From API route (NextRequest)
      cookieHeader = request.headers.get("cookie") || "";
    } else {
      // From Server Component/Action
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      cookieHeader = allCookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");
    }

    const apiUrl = `${API_URL}${endpoint}`;

    console.log(`[ServerProxy] Calling API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      ...fetchOptions,
      headers: {
        cookie: cookieHeader,
        ...headers,
      },
      credentials: "include",
      signal: fetchOptions?.signal ?? AbortSignal.timeout(30000), // 30s timeout
    });

    // Handle binary responses (images, PDFs, etc.)
    if (responseType === "binary") {
      if (!response.ok) {
        // For binary responses, return error as Response
        return new Response(response.statusText, {
          status: response.status,
          statusText: response.statusText,
        }) as T;
      }

      const buffer = await response.arrayBuffer();
      return new Response(buffer, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
          "Cache-Control": response.headers.get("Cache-Control") || "private, max-age=60",
        },
      }) as T;
    }

    // Handle JSON responses
    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        // If can't parse JSON, use status text
        throw new Error(response.statusText);
      }

      const errorMessage =
        (errorBody as any)?.error ||
        (errorBody as any)?.message ||
        response.statusText;

      throw new Error(errorMessage);
    }

    // No content
    if (response.status === 204) {
      return undefined as T;
    }

    const json = await response.json();

    // Unwrap backend envelope if present: {success: true, data: ...} -> data
    if (
      json &&
      typeof json === "object" &&
      "success" in json &&
      "data" in json
    ) {
      return json.data as T;
    }

    return json as T;
  } catch (error) {
    console.error(`[ServerProxy] Error calling ${endpoint}:`, error);
    throw error;
  }
}
