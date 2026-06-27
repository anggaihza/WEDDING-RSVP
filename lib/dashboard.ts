import {
  formatAttendanceStatus,
  formatCategory,
  normalizeNameKey,
  sanitizeCategory,
  type AttendanceStatus,
  type WeddingRsvp,
} from "@/lib/rsvp";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type StatusFilter = AttendanceStatus | "all";
export type SortKey =
  | "name"
  | "attendance_status"
  | "guest_count"
  | "category"
  | "updated_at";
export type SortDirection = "asc" | "desc";

export type DashboardSearchParams = {
  status?: string | string[] | undefined;
  kategori?: string | string[] | undefined;
  q?: string | string[] | undefined;
  sort?: string | string[] | undefined;
  direction?: string | string[] | undefined;
  page?: string | string[] | undefined;
};

export type DashboardFilters = {
  status: StatusFilter;
  category: string;
  query: string;
  sort: SortKey;
  direction: SortDirection;
  page: number;
};

export type DashboardSummary = {
  responses: number;
  attending: number;
  notAttending: number;
  guests: number;
};

const sortKeys = new Set<SortKey>([
  "name",
  "attendance_status",
  "guest_count",
  "category",
  "updated_at",
]);

const defaultFilters: DashboardFilters = {
  status: "all",
  category: "all",
  query: "",
  sort: "category",
  direction: "asc",
  page: 1,
};

export const dashboardPageSize = 25;

const csvDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export async function getDashboardRsvpRows() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("wedding_rsvps")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      return {
        rows: [] as WeddingRsvp[],
        error:
          "Data belum bisa dibaca. Pastikan tabel wedding_rsvps sudah dibuat di Supabase.",
      };
    }

    return {
      rows: (data ?? []) as WeddingRsvp[],
      error: "",
    };
  } catch {
    return {
      rows: [] as WeddingRsvp[],
      error: "Konfigurasi Supabase belum siap.",
    };
  }
}

export function parseDashboardFilters(
  source: DashboardSearchParams | URLSearchParams
): DashboardFilters {
  return {
    status: parseStatusFilter(readParam(source, "status")),
    category: parseCategoryFilter(readParam(source, "kategori")),
    query: parseSearchQuery(readParam(source, "q")),
    sort: parseSortKey(readParam(source, "sort")),
    direction: parseSortDirection(readParam(source, "direction")),
    page: parsePage(readParam(source, "page")),
  };
}

export function applyDashboardFilters(
  rows: WeddingRsvp[],
  filters: DashboardFilters
) {
  return sortDashboardRows(filterDashboardRows(rows, filters), filters);
}

export function filterDashboardRows(
  rows: WeddingRsvp[],
  filters: DashboardFilters
) {
  const query = normalizeNameKey(filters.query);

  return rows.filter((row) => {
    const statusMatches =
      filters.status === "all" || row.attendance_status === filters.status;
    const categoryMatches =
      filters.category === "all" || row.category === filters.category;
    const searchMatches =
      !query ||
      row.name_key.includes(query) ||
      normalizeNameKey(row.name).includes(query);

    return statusMatches && categoryMatches && searchMatches;
  });
}

export function sortDashboardRows(
  rows: WeddingRsvp[],
  filters: DashboardFilters
) {
  return [...rows].sort((left, right) => {
    const result = compareRows(left, right, filters.sort);
    const ordered = filters.direction === "asc" ? result : -result;

    if (ordered !== 0) {
      return ordered;
    }

    return left.name.localeCompare(right.name, "id-ID");
  });
}

export function getDashboardSummary(rows: WeddingRsvp[]): DashboardSummary {
  return rows.reduce(
    (acc, row) => {
      acc.responses += 1;

      if (row.attendance_status === "attending") {
        acc.attending += 1;
        acc.guests += row.guest_count;
      } else {
        acc.notAttending += 1;
      }

      return acc;
    },
    {
      responses: 0,
      attending: 0,
      notAttending: 0,
      guests: 0,
    }
  );
}

export function paginateDashboardRows(
  rows: WeddingRsvp[],
  page: number,
  pageSize = dashboardPageSize
) {
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(startIndex, startIndex + pageSize);

  return {
    rows: pageRows,
    page: currentPage,
    pageSize,
    totalRows,
    totalPages,
    from: totalRows ? startIndex + 1 : 0,
    to: startIndex + pageRows.length,
  };
}

export function getCategorySummaries(rows: WeddingRsvp[]) {
  const summaries = new Map<string, DashboardSummary>();

  for (const row of rows) {
    const summary =
      summaries.get(row.category) ??
      ({
        responses: 0,
        attending: 0,
        notAttending: 0,
        guests: 0,
      } satisfies DashboardSummary);

    summary.responses += 1;

    if (row.attendance_status === "attending") {
      summary.attending += 1;
      summary.guests += row.guest_count;
    } else {
      summary.notAttending += 1;
    }

    summaries.set(row.category, summary);
  }

  return Array.from(summaries, ([category, summary]) => ({
    category,
    ...summary,
  })).sort((left, right) =>
    formatCategory(left.category).localeCompare(formatCategory(right.category), "id-ID")
  );
}

export function dashboardHref(
  filters: DashboardFilters,
  overrides: Partial<DashboardFilters> = {},
  pathname = "/dashboard"
) {
  const nextFilters = { ...filters, ...overrides };
  const searchParams = new URLSearchParams();

  if (nextFilters.status !== "all") {
    searchParams.set("status", nextFilters.status);
  }

  if (nextFilters.category !== "all") {
    searchParams.set("kategori", nextFilters.category);
  }

  if (nextFilters.query) {
    searchParams.set("q", nextFilters.query);
  }

  if (
    nextFilters.sort !== defaultFilters.sort ||
    nextFilters.direction !== defaultFilters.direction
  ) {
    searchParams.set("sort", nextFilters.sort);
    searchParams.set("direction", nextFilters.direction);
  }

  if (nextFilters.page > 1) {
    searchParams.set("page", String(nextFilters.page));
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function sortHref(
  filters: DashboardFilters,
  sort: SortKey,
  pathname = "/dashboard"
) {
  const direction =
    filters.sort === sort && filters.direction === "asc" ? "desc" : "asc";

  return dashboardHref(filters, { sort, direction, page: 1 }, pathname);
}

export function rowsToCsv(rows: WeddingRsvp[]) {
  const header = [
    "Nama",
    "Status",
    "Jumlah",
    "Kategori",
    "Pesan",
    "Update",
  ];
  const body = rows.map((row) => [
    row.name,
    formatAttendanceStatus(row.attendance_status),
    String(row.guest_count),
    formatCategory(row.category),
    row.message ?? "",
    csvDateFormatter.format(new Date(row.updated_at)),
  ]);

  return [header, ...body]
    .map((cells) => cells.map(escapeCsvCell).join(","))
    .join("\n");
}

function readParam(
  source: DashboardSearchParams | URLSearchParams,
  key: keyof DashboardSearchParams
) {
  if (source instanceof URLSearchParams) {
    return source.get(key) ?? undefined;
  }

  const value = source[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseStatusFilter(value: string | undefined): StatusFilter {
  if (value === "attending" || value === "not_attending") {
    return value;
  }

  return "all";
}

function parseCategoryFilter(value: string | undefined) {
  if (!value || value === "all") {
    return "all";
  }

  return sanitizeCategory(value);
}

function parseSearchQuery(value: string | undefined) {
  return value?.trim().slice(0, 80) ?? "";
}

function parseSortKey(value: string | undefined): SortKey {
  if (value && sortKeys.has(value as SortKey)) {
    return value as SortKey;
  }

  return defaultFilters.sort;
}

function parseSortDirection(value: string | undefined): SortDirection {
  if (value === "asc" || value === "desc") {
    return value;
  }

  return defaultFilters.direction;
}

function parsePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultFilters.page;
}

function compareRows(left: WeddingRsvp, right: WeddingRsvp, sort: SortKey) {
  switch (sort) {
    case "name":
      return left.name.localeCompare(right.name, "id-ID");
    case "attendance_status":
      return left.attendance_status.localeCompare(
        right.attendance_status,
        "id-ID"
      );
    case "guest_count":
      return left.guest_count - right.guest_count;
    case "category":
      return formatCategory(left.category).localeCompare(
        formatCategory(right.category),
        "id-ID"
      );
    case "updated_at":
      return (
        new Date(left.updated_at).getTime() - new Date(right.updated_at).getTime()
      );
  }
}

function escapeCsvCell(value: string) {
  const escaped = value.replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}
