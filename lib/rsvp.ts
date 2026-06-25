export type AttendanceStatus = "attending" | "not_attending";

export type RsvpFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type WeddingRsvp = {
  id: string;
  name: string;
  name_key: string;
  attendance_status: AttendanceStatus;
  guest_count: number;
  message: string | null;
  category: string;
  created_at: string;
  updated_at: string;
};

export const initialRsvpState: RsvpFormState = {
  status: "idle",
  message: "",
};

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeNameKey(value: string) {
  return normalizeName(value).toLocaleLowerCase("id-ID");
}

export function sanitizeCategory(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const category =
    raw
      ?.trim()
      .toLocaleLowerCase("id-ID")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) ?? "";

  return category || "umum";
}

export function formatCategory(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("id-ID") + part.slice(1))
    .join(" ");
}

export function formatAttendanceStatus(status: AttendanceStatus) {
  return status === "attending" ? "Hadir" : "Tidak Hadir";
}
