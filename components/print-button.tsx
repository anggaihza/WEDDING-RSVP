"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="bg-[#4a0b18] text-white hover:bg-[#5d1020] print:hidden"
    >
      <Printer className="size-4" />
      Print
    </Button>
  );
}
