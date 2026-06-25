import { LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { logoutDashboard } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryFilterDropdown } from "@/components/category-filter-dropdown";
import {
  DashboardRsvpDialog,
  DeleteRsvpButton,
} from "@/components/dashboard-rsvp-dialog";
import { InvitationLinkGenerator } from "@/components/invitation-link-generator";
import { isDashboardAuthenticated } from "@/lib/dashboard-session";
import {
  formatAttendanceStatus,
  formatCategory,
  sanitizeCategory,
  type AttendanceStatus,
  type WeddingRsvp,
} from "@/lib/rsvp";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type DashboardPageProps = {
  searchParams: Promise<{
    status?: string | string[] | undefined;
    kategori?: string | string[] | undefined;
  }>;
};

type StatusFilter = AttendanceStatus | "all";

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
  const statusFilter = parseStatusFilter(params.status);
  const categoryFilter = parseCategoryFilter(params.kategori);
  const { rows, error } = await getRsvpRows();
  const categories = Array.from(new Set(rows.map((row) => row.category))).sort();
  const filteredRows = rows.filter((row) => {
    const statusMatches =
      statusFilter === "all" || row.attendance_status === statusFilter;
    const categoryMatches =
      categoryFilter === "all" || row.category === categoryFilter;

    return statusMatches && categoryMatches;
  });
  const summary = rows.reduce(
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
          <SummaryItem label="Jumlah Tamu" value={summary.guests} tone="amber" />
        </section>

        <InvitationLinkGenerator />

        <section className="mt-5 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm shadow-zinc-950/5">
          <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Daftar Konfirmasi
              </h2>
              <p className="text-sm text-zinc-500">
                Menampilkan {filteredRows.length} dari {rows.length} respon.
              </p>
            </div>
            <DashboardRsvpDialog mode="create" />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-2">
                <FilterLink
                  href={dashboardHref("all", categoryFilter)}
                  active={statusFilter === "all"}
                >
                  Semua
                </FilterLink>
                <FilterLink
                  href={dashboardHref("attending", categoryFilter)}
                  active={statusFilter === "attending"}
                >
                  Hadir
                </FilterLink>
                <FilterLink
                  href={dashboardHref("not_attending", categoryFilter)}
                  active={statusFilter === "not_attending"}
                >
                  Tidak Hadir
                </FilterLink>
              </div>
            </div>

            <CategoryFilterDropdown
              categories={categories}
              selectedCategory={categoryFilter}
              statusFilter={statusFilter}
            />
          </div>
        </section>

        <section className="mt-4">
          {filteredRows.length ? (
            <RsvpTable rows={filteredRows} />
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
              Belum ada data pada filter ini.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

async function getRsvpRows() {
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
      rows: data ?? [],
      error: "",
    };
  } catch {
    return {
      rows: [] as WeddingRsvp[],
      error: "Konfigurasi Supabase belum siap.",
    };
  }
}

function parseStatusFilter(value: string | string[] | undefined): StatusFilter {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === "attending" || raw === "not_attending") {
    return raw;
  }

  return "all";
}

function parseCategoryFilter(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ? sanitizeCategory(raw) : "all";
}

function dashboardHref(status: StatusFilter, category: string) {
  const searchParams = new URLSearchParams();

  if (status !== "all") {
    searchParams.set("status", status);
  }

  if (category !== "all") {
    searchParams.set("kategori", category);
  }

  const query = searchParams.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
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

function RsvpTable({ rows }: { rows: WeddingRsvp[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-950/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-[#3b0713]/20 bg-[#231316] text-xs uppercase tracking-[0.12em] text-white/70">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nama</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Jumlah</th>
              <th className="px-4 py-3 text-left font-medium">Kategori</th>
              <th className="px-4 py-3 text-left font-medium">Pesan</th>
              <th className="px-4 py-3 text-left font-medium">Update</th>
              <th className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/80">
                <td className="max-w-52 px-4 py-3 font-medium text-zinc-950">
                  <span className="block truncate">{row.name}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={cn(
                      row.attendance_status === "attending"
                        ? "bg-[#f7edf0] text-[#4a0b18]"
                        : "bg-zinc-100 text-zinc-700"
                    )}
                  >
                    {formatAttendanceStatus(row.attendance_status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-zinc-700">{row.guest_count}</td>
                <td className="px-4 py-3 text-zinc-700">
                  {formatCategory(row.category)}
                </td>
                <td className="max-w-80 px-4 py-3 text-zinc-600">
                  <span className="block truncate">{row.message || "-"}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                  {dateFormatter.format(new Date(row.updated_at))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <DashboardRsvpDialog mode="edit" row={row} />
                    <DeleteRsvpButton row={row} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
