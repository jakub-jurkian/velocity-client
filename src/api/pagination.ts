import type { PaginatedResponse } from "../types/Pagination";

// Shared access to the API's paginated list endpoints.
// Matches `spring.data.web.pageable.max-page-size` in application.yml.
export const MAX_PAGE_SIZE = 50;

export const DEFAULT_PAGE_SIZE = 10;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Pulls the human-readable message out of an RFC 7807 ProblemDetail body,
// falling back when the server returned an empty body instead.
export const readProblemDetail = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  const contentType = response.headers.get("content-type") || "";
  const isJson =
    contentType.includes("application/problem+json") ||
    contentType.includes("application/json");

  if (!isJson) return fallback;

  try {
    const problem = await response.json();
    return problem?.detail || problem?.title || fallback;
  } catch {
    return fallback;
  }
};

interface PageOptions {
  page?: number;
  size?: number;
  signal?: AbortSignal;
  //  Extra query parameters (e.g. a status filter). Empty-string values are
  //  skipped so an "All" filter option can map to "" without sending
  //  'status=` to the server.
  params?: Record<string, string>;
}

// Fetches a single page of a list endpoint.
export const fetchPage = async <T>(
  path: string,
  token: string,
  { page = 0, size = DEFAULT_PAGE_SIZE, signal, params }: PageOptions = {},
): Promise<PaginatedResponse<T>> => {
  const url = new URL(`${import.meta.env.VITE_API_URL}${path}`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(Math.min(size, MAX_PAGE_SIZE)));

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      await readProblemDetail(response, `Request failed (${response.status}).`),
      response.status,
    );
  }

  return (await response.json()) as PaginatedResponse<T>;
};

//  Walks every page and returns the flattened result, for the cases that need a
//  true aggregate rather than a screenful (for example counting active rentals).
//  Uses the largest page the server permits to keep the round trips down, and
//  follows `meta.hasNext` rather than guessing a total.-
export const fetchAllPages = async <T>(
  path: string,
  token: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<T[]> => {
  const MAX_PAGES = 100;
  const items: T[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await fetchPage<T>(path, token, {
      page,
      size: MAX_PAGE_SIZE,
      signal,
    });

    items.push(...result.data);
    if (!result.meta?.hasNext) break;
  }

  return items;
};
