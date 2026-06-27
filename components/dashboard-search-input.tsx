"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { DashboardFilters } from "@/lib/dashboard";

type DashboardSearchInputProps = {
  filters: DashboardFilters;
};

export function DashboardSearchInput({ filters }: DashboardSearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(filters.query);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const nextQuery = value.trim();

    if (nextQuery === filters.query) {
      return;
    }

    const timeout = window.setTimeout(() => {
      startTransition(() => {
        router.replace(
          buildDashboardUrl({
            status: filters.status,
            category: filters.category,
            query: nextQuery,
            sort: filters.sort,
            direction: filters.direction,
            page: 1,
          }),
          { scroll: false }
        );
      });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [
    value,
    filters.category,
    filters.direction,
    filters.query,
    filters.sort,
    filters.status,
    router,
  ]);

  function clearSearch() {
    setValue("");
    startTransition(() => {
      router.replace(
        buildDashboardUrl({
          status: filters.status,
          category: filters.category,
          query: "",
          sort: filters.sort,
          direction: filters.direction,
          page: 1,
        }),
        { scroll: false }
      );
    });
  }

  return (
    <label className="relative w-full min-w-0 md:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Cari nama tamu"
        placeholder="Cari nama"
        className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-zinc-400 hover:bg-zinc-100 focus:border-[#4a0b18] focus:bg-white focus:ring-3 focus:ring-[#4a0b18]/15"
      />
      {value ? (
        <button
          type="button"
          aria-label="Hapus pencarian"
          onClick={clearSearch}
          className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700"
        >
          <X className="size-4" />
        </button>
      ) : null}
      {isPending ? (
        <span className="pointer-events-none absolute right-10 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#4a0b18]" />
      ) : null}
    </label>
  );
}

function buildDashboardUrl(filters: DashboardFilters) {
  const searchParams = new URLSearchParams();

  if (filters.status !== "all") {
    searchParams.set("status", filters.status);
  }

  if (filters.category !== "all") {
    searchParams.set("kategori", filters.category);
  }

  if (filters.query) {
    searchParams.set("q", filters.query);
  }

  if (filters.sort !== "category" || filters.direction !== "asc") {
    searchParams.set("sort", filters.sort);
    searchParams.set("direction", filters.direction);
  }

  const query = searchParams.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}
