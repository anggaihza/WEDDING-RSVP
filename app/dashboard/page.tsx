import { Download, LogOut, Printer } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { logoutDashboard } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { CategoryFilterDropdown } from "@/components/category-filter-dropdown";
import { DashboardRsvpDialog } from "@/components/dashboard-rsvp-dialog";
import { DashboardRsvpTable } from "@/components/dashboard-rsvp-table";
import { DashboardSearchInput } from "@/components/dashboard-search-input";
import { InvitationLinkGenerator } from "@/components/invitation-link-generator";
import { isDashboardAuthenticated } from "@/lib/dashboard-session";
import {
  applyDashboardFilters,
  dashboardHref,
  getCategorySummaries,
  getDashboardRsvpRows,
  getDashboardSummary,
  parseDashboardFilters,
  sortHref,
  type DashboardSearchParams,
  type SortKey,
} from "@/lib/dashboard";
import { formatCategory } from "@/lib/rsvp";
import { cn } from "@/lib/utils";

type DashboardPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  if (!(await isDashboardAuthenticated())) {
    redirect("/dashboard/login");
  }

  const params = await searchParams;
  const requestHeaders = await headers();
  const baseUrl = getBaseUrl(requestHeaders);
  const filters = parseDashboardFilters(params);
  const { rows, error } = await getDashboardRsvpRows();
  const categories = Array.from(new Set(rows.map((row) => row.category))).sort();
  const filteredRows = applyDashboardFilters(rows, filters);
  const summary = getDashboardSummary(rows);
  const filteredSummary = getDashboardSummary(filteredRows);
  const categorySummaries = getCategorySummaries(rows);
  const sortLinks: Record<SortKey, string> = {
    name: sortHref(filters, "name"),
    attendance_status: sortHref(filters, "attendance_status"),
    guest_count: sortHref(filters, "guest_count"),
    category: sortHref(filters, "category"),
    updated_at: sortHref(filters, "updated_at"),
  };
  const formattedUpdates = Object.fromEntries(
    filteredRows.map((row) => [
      row.id,
      dateFormatter.format(new Date(row.updated_at)),
    ])
  );
  const exportHref = dashboardHref(filters, {}, "/api/dashboard/export");
  const printHref = dashboardHref(filters, {}, "/dashboard/print");

  return (
    <main className="min-h-svh bg-zinc-100 font-sans text-zinc-950">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 py-5 md:py-8">
        <header className="mb-5 overflow-hidden rounded-lg border border-[#3b0713]/15 bg-[#190509] text-white shadow-xl shadow-zinc-950/10">
          <div className="flex items-start justify-between gap-4 bg-[linear-gradient(135deg,#23050c_0%,#4a0b18_58%,#1f1b1d_100%)] px-4 py-5 md:px-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-100/80">
                Wedding RSVP
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Dashboard Tamu
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Pantau konfirmasi kehadiran tamu, jumlah undangan, dan pesan
                yang masuk.
              </p>
            </div>
            <form action={logoutDashboard}>
              <Button
                type="submit"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <LogOut className="size-4" />
                Keluar
              </Button>
            </form>
          </div>
        </header>

        {error ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {error}
          </p>
        ) : null}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryItem label="Respon" value={summary.responses} tone="stone" />
          <SummaryItem label="Hadir" value={summary.attending} tone="burgundy" />
          <SummaryItem
            label="Tidak Hadir"
            value={summary.notAttending}
            tone="rose"
          />
          <SummaryItem label="Tamu Hadir" value={summary.guests} tone="amber" />
        </section>

        {categorySummaries.length ? (
          <CategorySummaryTable rows={categorySummaries} />
        ) : null}

        <InvitationLinkGenerator baseUrl={baseUrl} />

        <section className="mt-5 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-950/5">
          <div className="flex flex-col gap-3 border-b border-zinc-100 p-3 md:flex-row md:items-start md:justify-between md:p-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Daftar Konfirmasi
              </h2>
              <p className="text-sm text-zinc-500">
                Menampilkan {filteredRows.length} dari {rows.length} respon.
                Tamu hadir pada filter ini: {filteredSummary.guests}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={exportHref}
                prefetch={false}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                <Download className="size-4" />
                Export CSV
              </Link>
              <Link
                href={printHref}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                <Printer className="size-4" />
                Print
              </Link>
              <DashboardRsvpDialog mode="create" />
            </div>
          </div>

          <div className="border-b border-zinc-100 p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <DashboardSearchInput key={filters.query} filters={filters} />
                <div className="flex min-w-max gap-2">
                  <FilterLink
                    href={dashboardHref(filters, { status: "all" })}
                    active={filters.status === "all"}
                  >
                    Semua
                  </FilterLink>
                  <FilterLink
                    href={dashboardHref(filters, { status: "attending" })}
                    active={filters.status === "attending"}
                  >
                    Hadir
                  </FilterLink>
                  <FilterLink
                    href={dashboardHref(filters, { status: "not_attending" })}
                    active={filters.status === "not_attending"}
                  >
                    Tidak Hadir
                  </FilterLink>
                </div>
              </div>

              <CategoryFilterDropdown
                categories={categories}
                selectedCategory={filters.category}
                statusFilter={filters.status}
                query={filters.query}
                sort={filters.sort}
                direction={filters.direction}
              />
            </div>
          </div>

          {filteredRows.length ? (
            <DashboardRsvpTable
              rows={filteredRows}
              sortLinks={sortLinks}
              currentSort={filters.sort}
              currentDirection={filters.direction}
              formattedUpdates={formattedUpdates}
            />
          ) : (
            <div className="p-8 text-center text-sm text-zinc-500">
              Belum ada data pada filter ini.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function getBaseUrl(requestHeaders: Headers) {
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    return "https://domain-kamu.com";
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

function CategorySummaryTable({
  rows,
}: {
  rows: Array<{
    category: string;
    responses: number;
    attending: number;
    notAttending: number;
    guests: number;
  }>;
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm shadow-zinc-950/5">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">
            Ringkasan Per Kategori
          </h2>
          <p className="text-xs text-zinc-500">
            Total respon, status, dan jumlah tamu hadir.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-[0.12em] text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Kategori</th>
              <th className="px-4 py-3 text-right font-medium">Respon</th>
              <th className="px-4 py-3 text-right font-medium">Hadir</th>
              <th className="px-4 py-3 text-right font-medium">
                Tidak Hadir
              </th>
              <th className="px-4 py-3 text-right font-medium">Tamu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <tr key={row.category}>
                <td className="px-4 py-3 font-medium text-zinc-950">
                  {formatCategory(row.category)}
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">
                  {row.responses}
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">
                  {row.attending}
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">
                  {row.notAttending}
                </td>
                <td className="px-4 py-3 text-right font-medium text-[#4a0b18]">
                  {row.guests}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SummaryItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "stone" | "burgundy" | "rose" | "amber";
}) {
  const tones = {
    stone: "after:bg-zinc-900",
    burgundy: "after:bg-[#4a0b18]",
    rose: "after:bg-[#9f3f55]",
    amber: "after:bg-[#c7a66b]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/5 after:absolute after:inset-x-0 after:top-0 after:h-1",
        tones[tone]
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-[#4a0b18] bg-[#4a0b18] text-white"
          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
      )}
    >
      {children}
    </Link>
  );
}
