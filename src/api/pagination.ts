import type { PaginatedResponse } from "../types/Pagination";
import { apiFetch } from "./client";

// Shared access to the API's paginated list endpoints.
// Matches `spring.data.web.pageable.max-page-size` in application.yml.
export const MAX_PAGE_SIZE = 50;

export const DEFAULT_PAGE_SIZE = 10;

interface PageOptions {
  page?: number;
  size?: number;
  signal?: AbortSignal;
  // Extra query parameters, e.g. a status filter or a sort.
  params?: Record<string, string>;
}

// Fetches a single page of a list endpoint.
export const fetchPage = <T>(
  path: string,
  { page = 0, size = DEFAULT_PAGE_SIZE, signal, params }: PageOptions = {},
) =>
  apiFetch<PaginatedResponse<T>>(path, {
    signal,
    query: { ...params, page, size: Math.min(size, MAX_PAGE_SIZE) },
  });

// Walks every page and returns the flattened result, for the cases that need a
// true aggregate rather than a screenful (for example counting active rentals).
// Uses the largest page the server permits to keep the round trips down, and
// follows `meta.hasNext` rather than guessing a total.
export const fetchAllPages = async <T>(
  path: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<T[]> => {
  const MAX_PAGES = 100;
  const items: T[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await fetchPage<T>(path, { page, size: MAX_PAGE_SIZE, signal });
    items.push(...result.data);
    if (!result.meta?.hasNext) break;
  }

  return items;
};
