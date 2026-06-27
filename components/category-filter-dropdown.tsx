"use client";

import { useRouter } from "next/navigation";

import { formatCategory, type AttendanceStatus } from "@/lib/rsvp";

type StatusFilter = AttendanceStatus | "all";

type CategoryFilterDropdownProps = {
  categories: string[];
  selectedCategory: string;
  statusFilter: StatusFilter;
  query: string;
  sort: string;
  direction: string;
};

export function CategoryFilterDropdown({
  categories,
  selectedCategory,
  statusFilter,
  query,
  sort,
  direction,
}: CategoryFilterDropdownProps) {
  const router = useRouter();

  function updateCategory(category: string) {
    const searchParams = new URLSearchParams();

    if (statusFilter !== "all") {
      searchParams.set("status", statusFilter);
    }

    if (category !== "all") {
      searchParams.set("kategori", category);
    }

    if (query) {
      searchParams.set("q", query);
    }

    if (sort !== "category" || direction !== "asc") {
      searchParams.set("sort", sort);
      searchParams.set("direction", direction);
    }

    const nextQuery = searchParams.toString();
    router.push(nextQuery ? `/dashboard?${nextQuery}` : "/dashboard", {
      scroll: false,
    });
  }

  return (
    <label className="flex min-w-48 items-center gap-2 text-sm text-zinc-600">
      <span className="shrink-0 font-medium">Kategori</span>
      <select
        value={selectedCategory}
        onChange={(event) => updateCategory(event.target.value)}
        className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-800 outline-none transition-colors hover:bg-zinc-100 focus:border-[#4a0b18] focus:ring-3 focus:ring-[#4a0b18]/15"
      >
        <option value="all">Semua Kategori</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {formatCategory(category)}
          </option>
        ))}
      </select>
    </label>
  );
}
