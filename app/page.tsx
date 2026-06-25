import { RsvpForm } from "@/components/rsvp-form";
import { sanitizeCategory } from "@/lib/rsvp";

type HomeProps = {
  searchParams: Promise<{
    kategori?: string | string[] | undefined;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const category = sanitizeCategory(params.kategori);

  return (
    <main className="min-h-svh bg-stone-950 font-sans text-stone-950">
      <div className="mx-auto min-h-svh w-full max-w-[430px] bg-[url('/background.jpeg')] bg-cover bg-center">
        <div className="flex min-h-svh flex-col justify-between bg-gradient-to-b from-[#170407]/70 via-[#3d0715]/45 to-[#120407]/80 px-4 py-6 backdrop-blur-[1px]">
          <section className="pt-5 text-center text-white">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-100">
              Wedding RSVP
            </p>
            <h1 className="mx-auto mt-2 max-w-xs text-4xl font-semibold leading-tight">
              Konfirmasi Kehadiran
            </h1>
          </section>

          <div>
            <div className="w-full rounded-lg border border-white/30 p-3 shadow-2xl shadow-black/30">
              <RsvpForm category={category} />
            </div>
          </div>

          <footer className="text-center text-sm leading-6 text-white/85">
            Kehadiran dan doa Anda menjadi bagian berharga dalam hari bahagia
            kami.
          </footer>
        </div>
      </div>
    </main>
  );
}
