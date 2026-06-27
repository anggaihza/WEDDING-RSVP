"use client";

import { UsersRound } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatAttendanceStatus,
  formatCategory,
  type AttendanceStatus,
} from "@/lib/rsvp";
import { cn } from "@/lib/utils";

export type CategoryRsvpDialogRow = {
  id: string;
  name: string;
  attendance_status: AttendanceStatus;
  guest_count: number;
  message: string | null;
  updated_at_label: string;
};

type CategoryRsvpDialogProps = {
  category: string;
  rows: CategoryRsvpDialogRow[];
  className?: string;
};

export function CategoryRsvpDialog({
  category,
  rows,
  className,
}: CategoryRsvpDialogProps) {
  const categoryLabel = formatCategory(category);
  const attending = rows.filter(
    (row) => row.attendance_status === "attending"
  ).length;
  const notAttending = rows.length - attending;
  const guests = rows.reduce(
    (total, row) =>
      row.attendance_status === "attending" ? total + row.guest_count : total,
    0
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#4a0b18]/15",
            className
          )}
        >
          {categoryLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-[#f7edf0] text-[#4a0b18]">
            <UsersRound className="size-5" />
          </div>
          <DialogTitle>{categoryLabel}</DialogTitle>
          <DialogDescription>
            Daftar RSVP untuk kategori ini.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          <CategoryStat label="Respon" value={rows.length} />
          <CategoryStat label="Hadir" value={attending} />
          <CategoryStat label="Tamu" value={guests} />
        </div>

        <div className="max-h-[60vh] overflow-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="sticky top-0 bg-zinc-50 text-xs uppercase tracking-[0.12em] text-zinc-500">
              <tr>
                <th className="px-3 py-3 text-left font-medium">Nama</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Jumlah</th>
                <th className="px-3 py-3 text-left font-medium">Pesan</th>
                <th className="px-3 py-3 text-left font-medium">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((row) => (
                <tr key={row.id} className="bg-white">
                  <td className="max-w-48 px-3 py-3 font-medium text-zinc-950">
                    <span className="block truncate">{row.name}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                        row.attendance_status === "attending"
                          ? "bg-[#f7edf0] text-[#4a0b18]"
                          : "bg-zinc-100 text-zinc-700"
                      )}
                    >
                      {formatAttendanceStatus(row.attendance_status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-zinc-700">
                    {row.guest_count}
                  </td>
                  <td className="max-w-56 px-3 py-3 text-zinc-600">
                    <span className="block truncate">{row.message || "-"}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-500">
                    {row.updated_at_label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-zinc-500">
          Tidak hadir: {notAttending} RSVP.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function CategoryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
