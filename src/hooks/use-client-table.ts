"use client";

import { useEffect, useMemo, useState } from "react";

export interface ClientTableOptions<T> {
  /** Returns the text to match against the search box for one row. */
  searchableText?: (item: T) => string;
  initialPageSize?: number;
}

// useClientTable provides client-side search + pagination over an in-memory
// array. Use it for endpoints that return the full list (near-expiry,
// low-stock, etc.) so the UI can filter and page without extra requests.
export function useClientTable<T>(
  items: T[],
  options: ClientTableOptions<T> = {},
) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSizeState] = useState(options.initialPageSize ?? 10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim() || !options.searchableText) return items;
    const q = search.toLowerCase();
    return items.filter((i) => options.searchableText!(i).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Reset to a valid page when filters/size shrink the result set.
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const setPageSize = (n: number) => {
    setPageSizeState(n);
    setPage(1);
  };

  return {
    search,
    setSearch: (v: string) => {
      setSearch(v);
      setPage(1);
    },
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    pageCount,
    pageItems,
    start,
  };
}
