"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  createDashboardRsvp,
  deleteDashboardRsvp,
  updateDashboardRsvp,
} from "@/app/actions";
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
import type { AttendanceStatus, WeddingRsvp } from "@/lib/rsvp";

type DashboardRsvpDialogProps =
  | {
      mode: "create";
      row?: never;
    }
  | {
      mode: "edit";
      row: WeddingRsvp;
    };

export function DashboardRsvpDialog({ mode, row }: DashboardRsvpDialogProps) {
  const isEdit = mode === "edit";
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>(
    row?.attendance_status ?? "attending"
  );
  const action = isEdit ? updateDashboardRsvp : createDashboardRsvp;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size={isEdit ? "sm" : "default"}
          variant={isEdit ? "outline" : "default"}
          className={
            isEdit
              ? "h-8 border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              : "bg-[#4a0b18] text-white hover:bg-[#5d1020]"
          }
        >
          {isEdit ? <Pencil className="size-3.5" /> : <Plus className="size-4" />}
          {isEdit ? "Edit" : "Tambah RSVP"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit RSVP" : "Tambah RSVP"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data konfirmasi tamu."
              : "Tambahkan konfirmasi tamu secara manual."}
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-3">
          {isEdit ? <input type="hidden" name="id" value={row.id} /> : null}

          <Field label="Nama">
            <input
              name="name"
              defaultValue={row?.name ?? ""}
              required
              maxLength={80}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#4a0b18] focus:ring-3 focus:ring-[#4a0b18]/15"
              placeholder="Nama lengkap"
            />
          </Field>

          <div className="grid grid-cols-[1fr_96px] gap-3">
            <Field label="Status">
              <select
                name="attendance_status"
                value={attendanceStatus}
                onChange={(event) =>
                  setAttendanceStatus(event.target.value as AttendanceStatus)
                }
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#4a0b18] focus:ring-3 focus:ring-[#4a0b18]/15"
              >
                <option value="attending">Hadir</option>
                <option value="not_attending">Tidak Hadir</option>
              </select>
            </Field>

            <Field label="Jumlah">
              <select
                name="guest_count"
                defaultValue={String(row?.guest_count || 1)}
                disabled={attendanceStatus === "not_attending"}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#4a0b18] focus:ring-3 focus:ring-[#4a0b18]/15 disabled:bg-zinc-100 disabled:text-zinc-400"
              >
                {[1, 2, 3, 4, 5].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Kategori">
            <input
              name="category"
              defaultValue={row?.category ?? ""}
              required
              maxLength={64}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#4a0b18] focus:ring-3 focus:ring-[#4a0b18]/15"
              placeholder="contoh: keluarga besar"
            />
          </Field>

          <Field label="Pesan">
            <input
              name="message"
              defaultValue={row?.message ?? ""}
              maxLength={500}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#4a0b18] focus:ring-3 focus:ring-[#4a0b18]/15"
              placeholder="Pesan singkat"
            />
          </Field>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="submit"
                className="bg-[#4a0b18] text-white hover:bg-[#5d1020]"
              >
                Simpan
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteRsvpButton({ row }: { row: WeddingRsvp }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="destructive" className="h-8">
          <Trash2 className="size-3.5" />
          Hapus
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
            <Trash2 className="size-5" />
          </div>
          <DialogTitle>Hapus RSVP?</DialogTitle>
          <DialogDescription>
            Data untuk <span className="font-medium text-zinc-900">{row.name}</span>{" "}
            akan dihapus permanen dari dashboard.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <form action={deleteDashboardRsvp}>
            <input type="hidden" name="id" value={row.id} />
            <DialogClose asChild>
              <Button type="submit" variant="destructive">
                Hapus RSVP
              </Button>
            </DialogClose>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      {children}
    </label>
  );
}
