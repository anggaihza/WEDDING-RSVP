import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

export default function InvalidInvitationPage() {
  return (
    <main className="min-h-svh bg-stone-950 font-sans text-white">
      <div className="mx-auto min-h-svh w-full max-w-[430px] bg-[url('/background.jpeg')] bg-cover bg-center">
        <div className="flex min-h-svh items-end bg-gradient-to-t from-[#120407]/95 via-[#3d0715]/65 to-transparent px-4 py-8">
          <section className="w-full rounded-lg border border-white/25 bg-black/25 p-5 text-center shadow-2xl shadow-black/30 backdrop-blur-[1px]">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-amber-100/50 bg-amber-100/15 text-amber-100">
              <AlertCircle className="size-6" />
            </div>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-amber-100/80">
              Link Tidak Valid
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Undangan tidak ditemukan
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Link RSVP ini belum lengkap. Silakan gunakan link undangan yang
              dikirimkan oleh pihak keluarga.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Home className="size-4" />
              Kembali
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
