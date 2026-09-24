import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { errorMessage } from "../api/client";
import { fetchPage } from "../api/pagination";
import { EMPTY_META, type PaginationMeta } from "../types/Pagination";
import { scrollToTop } from "../utils/scroll";

// One page of a list endpoint plus its `meta`, so every row stays reachable
// rather than only the first pageful.

// Each request is aborted when the page or params change, so clicking Next
// twice quickly can never let the older response overwrite the newer page.
export const usePaginatedList = <T>(
  path: string,
  { params, errorText = "Could not load the list." }: { params?: Record<string, string>; errorText?: string } = {},
) => {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(0);
  const [version, setVersion] = useState(0);

  // A stable key, so callers can pass a fresh params object on every render.
  const paramsKey = JSON.stringify(params ?? {});

  // Loading until the request for exactly this page, params and reload has
  // settled, so no effect has to flip a flag back on.
  const requestKey = `${path}?${paramsKey}#${page}/${version}`;
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const isLoading = settledKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    fetchPage<T>(path, { page, params: JSON.parse(paramsKey), signal: controller.signal })
      .then((result) => {
        setItems(result.data);
        setMeta(result.meta);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error(`Failed to load ${path}:`, error);
        toast.error(errorMessage(error, errorText));
      })
      .finally(() => {
        if (!controller.signal.aborted) setSettledKey(requestKey);
      });

    return () => controller.abort();
  }, [path, page, paramsKey, errorText, requestKey]);

  const goToPage = (next: number) => {
    setPage(next);
    scrollToTop();
  };

  // Refetches the current page, e.g. after an edit the server may have reshaped.
  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { items, setItems, meta, setPage, goToPage, isLoading, reload };
};
