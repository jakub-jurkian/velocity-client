/**
 * Mirrors the backend `PaginatedResponse<T>` envelope (com.velocity.api.common.dto).
 *
 * Every list endpoint returns this shape, never a bare array. Reading `data`
 * while ignoring `meta` silently truncates the result to the first page, which
 * is what previously made rows past the default page size invisible.
 */
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Shown while a page is still loading, so the UI never reads undefined meta. */
export const EMPTY_META: PaginationMeta = {
  currentPage: 0,
  pageSize: 0,
  totalElements: 0,
  totalPages: 0,
  isFirst: true,
  isLast: true,
  hasNext: false,
  hasPrevious: false,
};
