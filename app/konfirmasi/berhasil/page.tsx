import { CheckCircle2, Download, Home, UsersRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatAttendanceStatus,
  formatCategory,
} from "@/lib/rsvp";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type ConfirmationSuccessPageProps = {
  searchParams: Promise<{
    id?: string | string[] | undefined;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default async function ConfirmationSuccessPage({
  searchParams,
}: ConfirmationSuccessPageProps) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    notFound();
  }

  const rsvp = await getRsvp(id);

  if (!rsvp) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-stone-950 font-sans text-white">
      <div className="mx-auto min-h-svh w-full max-w-[430px] bg-[url('/background.jpeg')] bg-cover bg-center">
        <div className="flex min-h-svh flex-col justify-center bg-gradient-to-b from-[#170407]/80 via-[#3d0715]/55 to-[#120407]/85 px-5 py-8 backdrop-blur-[1px]">
          <section className="rounded-lg border border-white/25 bg-black/25 p-5 text-center shadow-2xl shadow-black/30">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-amber-100/50 bg-amber-100/15 text-amber-100">
              <CheckCircle2 className="size-7" />
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-amber-100/80">
              Konfirmasi Berhasil
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Terima kasih, {rsvp.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/78">
              Konfirmasi Anda sudah tersimpan. Silakan download tanda
              konfirmasi di bawah ini.
            </p>

            <div className="mt-5 space-y-2 rounded-lg border border-white/15 bg-white/10 p-3 text-left text-sm">
              <InfoRow label="Status" value={formatAttendanceStatus(rsvp.attendance_status)} />
              <InfoRow label="Jumlah" value={`${rsvp.guest_count} tamu`} />
              <InfoRow label="Kategori" value={formatCategory(rsvp.category)} />
              <InfoRow
                label="Waktu"
                value={dateFormatter.format(new Date(rsvp.updated_at))}
              />
            </div>

            <div className="mt-5 grid gap-2">
              <a
                href={`/api/confirmation/${rsvp.id}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-100 px-4 text-sm font-medium text-[#23070d] transition-colors hover:bg-amber-50"
              >
                <Download className="size-4" />
                Download PNG Konfirmasi
              </a>
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <Home className="size-4" />
                Kembali
              </Link>
            </div>
          </section>

          <footer className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-white/65">
            <UsersRound className="size-3.5" />
            Simpan file ini sebagai bukti konfirmasi kehadiran.
          </footer>
        </div>
      </div>
    </main>
  );
}

async function getRsvp(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("wedding_rsvps")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/58">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}
