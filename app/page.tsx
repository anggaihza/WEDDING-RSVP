import { RsvpForm } from "@/components/rsvp-form";
import { eventDateLabel, getEventCountdownLabel } from "@/lib/event";
import { sanitizeCategory } from "@/lib/rsvp";
import { redirect } from "next/navigation";

type HomeProps = {
  searchParams: Promise<{
    kategori?: string | string[] | undefined;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const rawCategory = Array.isArray(params.kategori)
    ? params.kategori[0]
    : params.kategori;

  if (rawCategory !== undefined && !rawCategory.trim()) {
    redirect("/undangan/tidak-valid");
  }

  const category = sanitizeCategory(rawCategory);
  const countdownLabel = getEventCountdownLabel();

  return (
    <main className="min-h-svh bg-stone-950 font-sans text-stone-950">
      <div className="relative mx-auto min-h-svh w-full max-w-[430px] overflow-hidden bg-stone-950">
        <div className="rsvp-background absolute inset-0 bg-[url('/background.jpeg')] bg-cover bg-center" />
        <div className="relative flex min-h-svh flex-col overflow-hidden px-4 py-6">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#120407]/90 via-[#3d0715]/55 to-transparent" />

          <section className="rsvp-header relative z-10 pt-5 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-100">
              Wedding RSVP
            </p>
            <h1 className="mx-auto mt-2 max-w-xs text-4xl font-semibold leading-tight">
              Konfirmasi Kehadiran
            </h1>
            <p className="rsvp-countdown mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/15 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm transition-all duration-500 hover:border-amber-100/45 hover:bg-black/25">
              <span>{eventDateLabel}</span>
              <span className="size-1 rounded-full bg-amber-100/70" />
              <span>{countdownLabel}</span>
            </p>
          </section>

          <div className="relative z-10 mt-auto space-y-4">
            <div className="rsvp-card w-full rounded-lg border border-white/30 p-3 shadow-2xl shadow-black/30 backdrop-blur-[1px]">
              <RsvpForm category={category} />
            </div>

            <footer className="rsvp-footer text-center text-sm leading-6 text-white/85">
              Kehadiran dan doa Anda menjadi bagian berharga dalam hari bahagia
              kami.
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
