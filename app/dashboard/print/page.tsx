import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PrintButton } from "@/components/print-button";
import {
  applyDashboardFilters,
  dashboardHref,
  getDashboardRsvpRows,
  getDashboardSummary,
  parseDashboardFilters,
  type DashboardSearchParams,
} from "@/lib/dashboard";
import { isDashboardAuthenticated } from "@/lib/dashboard-session";
import { formatAttendanceStatus, formatCategory } from "@/lib/rsvp";

type DashboardPrintPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default async function DashboardPrintPage({
  searchParams,
}: DashboardPrintPageProps) {
  if (!(await isDashboardAuthenticated())) {
    redirect("/dashboard/login");
  }

  const params = await searchParams;
  const filters = parseDashboardFilters(params);
  const { rows, error } = await getDashboardRsvpRows();
  const filteredRows = applyDashboardFilters(rows, filters);
  const summary = getDashboardSummary(filteredRows);

  return (
    <main className="min-h-svh bg-zinc-100 px-5 py-6 font-sans text-zinc-950 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-6xl rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 print:border-0 print:p-0 print:shadow-none">
        <div className="mb-5 flex flex-col gap-3 border-b border-zinc-200 pb-4 md:flex-row md:items-start md:justify-between print:mb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#4a0b18]">
              Wedding RSVP
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Daftar Tamu
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {filteredRows.length} respon, {summary.guests} tamu hadir.
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Link
              href={dashboardHref(filters)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
            <PrintButton />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-4 gap-2 text-sm print:grid-cols-4">
          <PrintSummary label="Respon" value={summary.responses} />
          <PrintSummary label="Hadir" value={summary.attending} />
          <PrintSummary label="Tidak Hadir" value={summary.notAttending} />
          <PrintSummary label="Tamu Hadir" value={summary.guests} />
        </div>

        <div className="mt-5 overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[820px] border-collapse text-sm print:min-w-0 print:text-[11px]">
            <thead>
              <tr className="bg-[#231316] text-left text-xs uppercase tracking-[0.1em] text-white print:bg-zinc-100 print:text-zinc-700">
                <th className="border border-zinc-200 px-3 py-2">No</th>
                <th className="border border-zinc-200 px-3 py-2">Nama</th>
                <th className="border border-zinc-200 px-3 py-2">Status</th>
                <th className="border border-zinc-200 px-3 py-2">Jumlah</th>
                <th className="border border-zinc-200 px-3 py-2">Kategori</th>
                <th className="border border-zinc-200 px-3 py-2">Pesan</th>
                <th className="border border-zinc-200 px-3 py-2">Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={row.id} className="break-inside-avoid">
                  <td className="border border-zinc-200 px-3 py-2 text-zinc-500">
                    {index + 1}
                  </td>
                  <td className="border border-zinc-200 px-3 py-2 font-medium">
                    {row.name}
                  </td>
                  <td className="border border-zinc-200 px-3 py-2">
                    {formatAttendanceStatus(row.attendance_status)}
                  </td>
                  <td className="border border-zinc-200 px-3 py-2">
                    {row.guest_count}
                  </td>
                  <td className="border border-zinc-200 px-3 py-2">
                    {formatCategory(row.category)}
                  </td>
                  <td className="border border-zinc-200 px-3 py-2">
                    {row.message || "-"}
                  </td>
                  <td className="border border-zinc-200 px-3 py-2 text-xs">
                    {dateFormatter.format(new Date(row.updated_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function PrintSummary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
