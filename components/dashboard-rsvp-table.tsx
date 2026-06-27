"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Tags,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import {
  bulkDeleteDashboardRsvps,
  bulkUpdateDashboardRsvpCategory,
} from "@/app/actions";
import {
  DashboardRsvpDialog,
  DeleteRsvpButton,
} from "@/components/dashboard-rsvp-dialog";
import {
  CategoryRsvpDialog,
  type CategoryRsvpDialogRow,
} from "@/components/category-rsvp-dialog";
import { useDashboardToast } from "@/components/dashboard-toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { initialDashboardActionState } from "@/lib/dashboard-action-state";
import {
  formatAttendanceStatus,
  type WeddingRsvp,
} from "@/lib/rsvp";
import { getCategoryTone, type CategoryTone } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

type SortKey =
  | "name"
  | "attendance_status"
  | "guest_count"
  | "category"
  | "updated_at";

type DashboardRsvpTableProps = {
  rows: WeddingRsvp[];
  sortLinks: Record<SortKey, string>;
  currentSort: SortKey;
  currentDirection: "asc" | "desc";
  formattedUpdates: Record<string, string>;
  categoryToneMap: Record<string, CategoryTone>;
  categoryRowsByCategory: Record<string, CategoryRsvpDialogRow[]>;
};

export function DashboardRsvpTable({
  rows,
  sortLinks,
  currentSort,
  currentDirection,
  formattedUpdates,
  categoryToneMap,
  categoryRowsByCategory,
}: DashboardRsvpTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkUpdateState, bulkUpdateAction, isBulkUpdatePending] =
    useActionState(
      bulkUpdateDashboardRsvpCategory,
      initialDashboardActionState
    );
  const [bulkDeleteState, bulkDeleteAction, isBulkDeletePending] =
    useActionState(bulkDeleteDashboardRsvps, initialDashboardActionState);
  const { showToast } = useDashboardToast();
  const selectedCount = selectedIds.length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  useEffect(() => {
    if (bulkUpdateState.status === "idle") {
      return;
    }

    showToast({
      tone: bulkUpdateState.status,
      message: bulkUpdateState.message,
    });

    if (bulkUpdateState.status === "success") {
      const timeout = window.setTimeout(() => setSelectedIds([]), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [bulkUpdateState, showToast]);

  useEffect(() => {
    if (bulkDeleteState.status === "idle") {
      return;
    }

    showToast({
      tone: bulkDeleteState.status,
      message: bulkDeleteState.message,
    });

    if (bulkDeleteState.status === "success") {
      const timeout = window.setTimeout(() => {
        setSelectedIds([]);
        setBulkDeleteOpen(false);
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [bulkDeleteState, showToast]);

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...new Set([...current, id])] : current.filter((item) => item !== id)
    );
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? rows.map((row) => row.id) : []);
  }

  return (
    <div className="overflow-hidden bg-white">
      <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/80 p-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-950">
            {selectedCount ? `${selectedCount} RSVP dipilih` : "Bulk action"}
          </p>
          <p className="text-xs text-zinc-500">
            Pilih beberapa tamu untuk hapus atau ubah kategori sekaligus.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <form
            action={bulkUpdateAction}
            className="flex min-w-0 gap-2"
          >
            <HiddenSelectedIds ids={selectedIds} />
            <input
              name="category"
              placeholder="kategori baru"
              disabled={!selectedCount}
              className="h-9 min-w-0 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#4a0b18] focus:ring-3 focus:ring-[#4a0b18]/15 disabled:bg-zinc-100 disabled:text-zinc-400"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!selectedCount || isBulkUpdatePending}
              className="h-9 bg-[#4a0b18] text-white hover:bg-[#5d1020]"
            >
              <Tags className="size-4" />
              {isBulkUpdatePending ? "Mengubah..." : "Ubah"}
            </Button>
          </form>

          <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={!selectedCount}
                className="h-9"
              >
                <Trash2 className="size-4" />
                Hapus
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
                  <Trash2 className="size-5" />
                </div>
                <DialogTitle>Hapus {selectedCount} RSVP?</DialogTitle>
                <DialogDescription>
                  Semua data yang dipilih akan dihapus permanen dari dashboard.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </DialogClose>
                <form action={bulkDeleteAction}>
                  <HiddenSelectedIds ids={selectedIds} />
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isBulkDeletePending}
                  >
                    {isBulkDeletePending ? "Menghapus..." : "Hapus Terpilih"}
                  </Button>
                </form>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="border-b border-[#3b0713]/20 bg-[#231316] text-xs uppercase tracking-[0.12em] text-white/70">
            <tr>
              <th className="w-12 px-4 py-3 text-left font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  aria-label="Pilih semua RSVP"
                  onChange={(event) => toggleAll(event.target.checked)}
                  className="size-4 rounded border-white/30"
                />
              </th>
              <SortHead
                label="Nama"
                sortKey="name"
                sortLinks={sortLinks}
                currentSort={currentSort}
                currentDirection={currentDirection}
              />
              <SortHead
                label="Status"
                sortKey="attendance_status"
                sortLinks={sortLinks}
                currentSort={currentSort}
                currentDirection={currentDirection}
              />
              <SortHead
                label="Jumlah"
                sortKey="guest_count"
                sortLinks={sortLinks}
                currentSort={currentSort}
                currentDirection={currentDirection}
              />
              <SortHead
                label="Kategori"
                sortKey="category"
                sortLinks={sortLinks}
                currentSort={currentSort}
                currentDirection={currentDirection}
              />
              <th className="px-4 py-3 text-left font-medium">Pesan</th>
              <SortHead
                label="Update"
                sortKey="updated_at"
                sortLinks={sortLinks}
                currentSort={currentSort}
                currentDirection={currentDirection}
              />
              <th className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => {
              const categoryTone =
                categoryToneMap[row.category] ?? getCategoryTone(row.category);

              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-l-4 transition-colors",
                    categoryTone.row
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      aria-label={`Pilih ${row.name}`}
                      onChange={(event) =>
                        toggleRow(row.id, event.target.checked)
                      }
                      className="size-4 rounded border-zinc-300"
                    />
                  </td>
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
                  <td className="px-4 py-3 text-zinc-700">
                    {row.guest_count}
                  </td>
                  <td className="px-4 py-3">
                    <CategoryRsvpDialog
                      category={row.category}
                      rows={categoryRowsByCategory[row.category] ?? []}
                      className={categoryTone.badge}
                    />
                  </td>
                  <td className="max-w-80 px-4 py-3 text-zinc-600">
                    <span className="block truncate">{row.message || "-"}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                    {formattedUpdates[row.id]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <DashboardRsvpDialog mode="edit" row={row} />
                      <DeleteRsvpButton row={row} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HiddenSelectedIds({ ids }: { ids: string[] }) {
  return (
    <>
      {ids.map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}
    </>
  );
}

function SortHead({
  label,
  sortKey,
  sortLinks,
  currentSort,
  currentDirection,
}: {
  label: string;
  sortKey: SortKey;
  sortLinks: Record<SortKey, string>;
  currentSort: SortKey;
  currentDirection: "asc" | "desc";
}) {
  const active = currentSort === sortKey;
  const Icon = active
    ? currentDirection === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th className="px-4 py-3 text-left font-medium">
      <Link
        href={sortLinks[sortKey]}
        scroll={false}
        className={cn(
          "inline-flex items-center gap-1.5 transition-colors hover:text-white",
          active ? "text-white" : "text-white/70"
        )}
      >
        {label}
        <Icon className="size-3.5" />
      </Link>
    </th>
  );
}
