import { LockKeyhole, LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import { loginDashboard } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isDashboardAuthenticated } from "@/lib/dashboard-session";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[] | undefined;
  }>;
};

export default async function DashboardLoginPage({
  searchParams,
}: LoginPageProps) {
  if (await isDashboardAuthenticated()) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const hasError = Boolean(
    Array.isArray(params.error) ? params.error[0] : params.error
  );

  return (
    <main className="min-h-svh bg-stone-950 font-sans text-stone-950">
      <div className="mx-auto flex min-h-svh w-full max-w-[430px] items-end bg-[url('/background.jpeg')] bg-cover bg-center">
        <div className="w-full bg-gradient-to-b from-black/25 via-black/20 to-black/70 px-4 py-6">
          <section className="mb-5 text-white">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-100">
              Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight">
              RSVP Tamu
            </h1>
          </section>

          <form
            action={loginDashboard}
            className="space-y-4 rounded-lg border border-white/45 bg-white/92 p-4 shadow-2xl shadow-black/30 backdrop-blur-md"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-medium text-stone-900"
              >
                <LockKeyhole className="size-4 text-rose-900" />
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="h-11 border-stone-300 bg-white/95 text-stone-950"
                required
              />
            </div>

            {hasError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                Password tidak sesuai.
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full bg-rose-950 text-white hover:bg-rose-900"
            >
              <LogIn className="size-4" />
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
