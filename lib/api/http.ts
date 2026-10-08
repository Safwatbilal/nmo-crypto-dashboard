import "server-only";

export class UpstreamError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
  ) {
    super(`Upstream request failed with ${status}`);
    this.name = "UpstreamError";
  }
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const MAX_RETRY_DELAY_MS = 2_500;

interface FetchJsonOptions {
  init?: RequestInit;
  /** Retries for 429/5xx. Kept low so a render never stalls for long. */
  retries?: number;
  /** Return `null` instead of throwing on 404 (used for "not found" pages). */
  allowNotFound?: boolean;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get("retry-after"));
  const fromHeader = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 0;
  return Math.min(MAX_RETRY_DELAY_MS, fromHeader || 400 * 2 ** attempt);
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions & { allowNotFound: true },
): Promise<T | null>;
export async function fetchJson<T>(url: string, options?: FetchJsonOptions): Promise<T>;
export async function fetchJson<T>(
  url: string,
  { init, retries = 1, allowNotFound = false }: FetchJsonOptions = {},
): Promise<T | null> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, init);

    if (response.ok) return (await response.json()) as T;
    if (allowNotFound && response.status === 404) return null;

    if (RETRYABLE.has(response.status) && attempt < retries) {
      await wait(retryDelay(response, attempt));
      continue;
    }

    console.error(`[api] ${response.status} ${url}`);
    throw new UpstreamError(response.status, url);
  }
}
