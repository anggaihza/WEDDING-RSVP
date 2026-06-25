"use client";

import { Copy, LinkIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sanitizeCategory } from "@/lib/rsvp";

export function InvitationLinkGenerator() {
  const [category, setCategory] = useState("");
  const [copied, setCopied] = useState(false);
  const sanitizedCategory = sanitizeCategory(category);
  const invitationLink = useMemo(() => {
    const baseUrl =
      typeof window === "undefined"
        ? "https://domain-kamu.com"
        : window.location.origin;
    return `${baseUrl}/?kategori=${encodeURIComponent(sanitizedCategory)}`;
  }, [sanitizedCategory]);

  async function copyLink() {
    await navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="mt-5 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm shadow-zinc-950/5">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f7edf0] text-[#4a0b18]">
          <LinkIcon className="size-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            Generator Link Undangan
          </h2>
          <p className="text-sm text-zinc-500">
            Buat link RSVP berdasarkan kategori tamu.
          </p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-[220px_1fr_auto]">
        <Input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="contoh: keluarga besar"
          className="h-10 border-zinc-200 bg-zinc-50"
        />
        <div className="flex min-w-0 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700">
          <span className="truncate">{invitationLink}</span>
        </div>
        <Button
          type="button"
          onClick={copyLink}
          className="h-10 bg-[#4a0b18] text-white hover:bg-[#5d1020]"
        >
          <Copy className="size-4" />
          {copied ? "Tersalin" : "Copy"}
        </Button>
      </div>
    </section>
  );
}
