/**
 * Resilient HTTP Client with retry, exponential backoff, and timeout handling
 */

export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export async function fetchWithRetry<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeoutMs = 12000,
    retries = 2,
    retryDelayMs = 800,
    headers,
    ...restOptions
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: {
          Accept: "application/json",
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle 429 Rate Limit
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get("Retry-After");
          const retryAfterMs = retryAfterHeader
            ? parseInt(retryAfterHeader, 10) * 1000
            : retryDelayMs * Math.pow(2, attempt);

          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, retryAfterMs));
            continue;
          }
        }

        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text();
        }

        throw new ApiError(
          `Request to ${url} failed with status ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          errorBody
        );
      }

      return (await response.json()) as T;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      // Do not retry 4xx errors except 429
      if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 429) {
        throw err;
      }

      if (attempt < retries) {
        const delay = retryDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

