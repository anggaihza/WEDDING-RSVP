"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Heart,
  Loader2,
  MessageSquareText,
  Send,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

import { submitRsvp } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCategory,
  initialRsvpState,
  type AttendanceStatus,
} from "@/lib/rsvp";
import { cn } from "@/lib/utils";

type RsvpFormProps = {
  category: string;
};

export function RsvpForm({ category }: RsvpFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendanceStatus>("attending");
  const [state, formAction, isPending] = useActionState(
    submitRsvp,
    initialRsvpState
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="category" value={category} />
      <input
        type="hidden"
        name="attendance_status"
        value={attendanceStatus}
      />

      <div className="flex items-center justify-between gap-3 rounded-lg border border-white/25 bg-black/20 px-2.5 py-1.5 text-xs text-white">
        <span className="flex min-w-0 items-center gap-2">
          <Heart className="size-3.5 shrink-0 text-rose-100" />
          <span className="truncate font-medium">{formatCategory(category)}</span>
        </span>
        <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] text-white/80">
          Kategori
        </span>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="name"
          className="flex items-center gap-1.5 text-xs font-medium text-white/90"
        >
          <UserRound className="size-3.5 text-amber-100" />
          Nama
        </label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          maxLength={80}
          placeholder="Nama lengkap"
          className="h-10 border-white/25 bg-white/0 text-white placeholder:text-white/55 focus-visible:border-amber-100"
          required
        />
      </div>

      <div className="grid grid-cols-[1fr_82px] gap-2">
        <fieldset className="space-y-1">
          <legend className="flex items-center gap-1.5 text-xs font-medium text-white/90">
            <CheckCircle2 className="size-3.5 text-amber-100" />
            Kehadiran
          </legend>
          <div className="grid grid-cols-2 gap-1.5">
            <AttendanceButton
              active={attendanceStatus === "attending"}
              icon={<CheckCircle2 className="size-3.5" />}
              label="Hadir"
              onClick={() => setAttendanceStatus("attending")}
            />
            <AttendanceButton
              active={attendanceStatus === "not_attending"}
              icon={<XCircle className="size-3.5" />}
              label="Tidak"
              onClick={() => setAttendanceStatus("not_attending")}
            />
          </div>
        </fieldset>

        <div className="space-y-1">
          <label
            htmlFor="guest_count"
            className="flex items-center gap-1.5 text-xs font-medium text-white/90"
          >
            <UsersRound className="size-3.5 text-amber-100" />
            Jumlah
          </label>
          <Select
            name="guest_count"
            defaultValue="1"
            disabled={attendanceStatus === "not_attending"}
            required={attendanceStatus === "attending"}
          >
            <SelectTrigger
              id="guest_count"
              className="relative h-10! w-full min-w-0 justify-center rounded-lg border-white/25 bg-black/10 px-2 text-center text-xs font-medium text-white shadow-none data-[size=default]:h-10 focus-visible:border-amber-100 focus-visible:ring-3 focus-visible:ring-amber-100/35 disabled:bg-white/5 disabled:text-white/45 [&_[data-slot=select-value]]:justify-center [&_svg]:absolute [&_svg]:right-2 [&_svg]:text-white/65"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) rounded-lg border border-white/15 bg-[#23070d]/95 p-1 text-white shadow-xl shadow-black/30 backdrop-blur-md"
            >
              {[1, 2, 3, 4, 5].map((count) => (
                <SelectItem
                  key={count}
                  value={String(count)}
                  className="h-8 justify-center rounded-md pr-6 text-center text-sm text-white hover:bg-amber-100 hover:text-[#23070d] focus:bg-amber-100 focus:text-[#23070d] data-highlighted:bg-amber-100 data-highlighted:text-[#23070d]"
                >
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="message"
          className="flex items-center gap-1.5 text-xs font-medium text-white/90"
        >
          <MessageSquareText className="size-3.5 text-amber-100" />
          Pesan
        </label>
        <Input
          id="message"
          name="message"
          maxLength={500}
          placeholder="Pesan singkat"
          className="h-10 border-white/25 bg-white/0 text-white placeholder:text-white/55 focus-visible:border-amber-100"
        />
      </div>

      {state.message ? (
        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            state.status === "success"
              ? "border-amber-200 bg-amber-50 text-stone-900"
              : "border-red-200 bg-red-50 text-red-900"
          )}
        >
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-10 w-full bg-rose-950 text-white hover:bg-rose-900"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Kirim Konfirmasi
      </Button>
    </form>
  );
}

function AttendanceButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors",
        active
          ? "border-amber-200 bg-rose-950 text-white shadow-sm"
          : "border-white/25 bg-white/0 text-white/85 hover:bg-white/10"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
