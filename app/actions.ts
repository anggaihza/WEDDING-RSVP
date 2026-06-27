"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createDashboardSession,
  clearDashboardSession,
  isDashboardAuthenticated,
  safeStringEqual,
} from "@/lib/dashboard-session";
import type { DashboardActionState } from "@/lib/dashboard-action-state";
import {
  normalizeName,
  normalizeNameKey,
  sanitizeCategory,
  type AttendanceStatus,
  type RsvpFormState,
} from "@/lib/rsvp";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readStrings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .filter(Boolean);
}

function dashboardActionResult(
  status: DashboardActionState["status"],
  message: string
): DashboardActionState {
  return {
    status,
    message,
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
  };
}

function dashboardActionError(error: unknown, fallback: string) {
  return dashboardActionResult(
    "error",
    error instanceof Error ? error.message : fallback
  );
}

function parseAttendanceStatus(value: string): AttendanceStatus | null {
  if (value === "attending" || value === "not_attending") {
    return value;
  }

  return null;
}

function parseGuestCount(
  value: string,
  status: AttendanceStatus,
  maxGuestCount: number
) {
  if (status === "not_attending") {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(Math.max(parsed, 1), maxGuestCount);
}

async function requireDashboardSession() {
  if (!(await isDashboardAuthenticated())) {
    redirect("/dashboard/login");
  }
}

function readDashboardRsvpPayload(formData: FormData) {
  const name = normalizeName(readString(formData, "name"));
  const attendanceStatus = parseAttendanceStatus(
    readString(formData, "attendance_status")
  );
  const category = sanitizeCategory(readString(formData, "category"));
  const message = readString(formData, "message").trim().slice(0, 500);

  if (!name) {
    throw new Error("Nama wajib diisi.");
  }

  if (!attendanceStatus) {
    throw new Error("Status kehadiran tidak valid.");
  }

  return {
    name,
    name_key: normalizeNameKey(name),
    attendance_status: attendanceStatus,
    guest_count: parseGuestCount(
      readString(formData, "guest_count"),
      attendanceStatus,
      20
    ),
    message: message || null,
    category,
    updated_at: new Date().toISOString(),
  };
}

export async function submitRsvp(
  _previousState: RsvpFormState,
  formData: FormData
): Promise<RsvpFormState> {
  const name = normalizeName(readString(formData, "name"));
  const attendanceStatus = parseAttendanceStatus(
    readString(formData, "attendance_status")
  );
  const category = sanitizeCategory(readString(formData, "category"));
  const message = readString(formData, "message").trim().slice(0, 500);

  if (!name) {
    return {
      status: "error",
      message: "Nama wajib diisi.",
    };
  }

  if (!attendanceStatus) {
    return {
      status: "error",
      message: "Pilih konfirmasi kehadiran.",
    };
  }

  const guestCount = parseGuestCount(
    readString(formData, "guest_count"),
    attendanceStatus,
    3
  );
  const nameKey = normalizeNameKey(name);
  let confirmationId = "";
  let mode = "created";

  try {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    const { data: existingRsvp } = await supabase
      .from("wedding_rsvps")
      .select("id")
      .eq("name_key", nameKey)
      .eq("category", category)
      .maybeSingle();

    const { data, error } = await supabase
      .from("wedding_rsvps")
      .upsert(
        {
          name,
          name_key: nameKey,
          attendance_status: attendanceStatus,
          guest_count: guestCount,
          message: message || null,
          category,
          updated_at: now,
        },
        {
          onConflict: "name_key,category",
        }
      )
      .select("id")
      .single();

    if (error || !data) {
      return {
        status: "error",
        message:
          "Konfirmasi belum bisa disimpan. Pastikan tabel Supabase sudah dibuat.",
      };
    }

    confirmationId = data.id;
    mode = existingRsvp ? "updated" : "created";
    revalidatePath("/dashboard");
  } catch {
    return {
      status: "error",
      message: "Konfigurasi Supabase belum siap.",
    };
  }

  redirect(
    `/konfirmasi/berhasil?id=${encodeURIComponent(
      confirmationId
    )}&mode=${mode}`
  );
}

export async function loginDashboard(formData: FormData) {
  const expectedPassword = process.env.DASHBOARD_PASSWORD;
  const password = readString(formData, "password");

  if (!expectedPassword) {
    throw new Error("DASHBOARD_PASSWORD is not configured.");
  }

  if (!safeStringEqual(password, expectedPassword)) {
    redirect("/dashboard/login?error=1");
  }

  await createDashboardSession();
  redirect("/dashboard");
}

export async function logoutDashboard() {
  await clearDashboardSession();
  redirect("/dashboard/login");
}

export async function createDashboardRsvp(
  _previousState: DashboardActionState,
  formData: FormData
): Promise<DashboardActionState> {
  await requireDashboardSession();

  try {
    const payload = readDashboardRsvpPayload(formData);
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("wedding_rsvps").upsert(payload, {
      onConflict: "name_key,category",
    });

    if (error) {
      return dashboardActionResult("error", error.message);
    }

    revalidatePath("/dashboard");
    return dashboardActionResult("success", "RSVP berhasil ditambahkan.");
  } catch (error) {
    return dashboardActionError(error, "RSVP belum bisa ditambahkan.");
  }
}

export async function updateDashboardRsvp(
  _previousState: DashboardActionState,
  formData: FormData
): Promise<DashboardActionState> {
  await requireDashboardSession();

  try {
    const id = readString(formData, "id");

    if (!id) {
      throw new Error("ID RSVP tidak valid.");
    }

    const payload = readDashboardRsvpPayload(formData);
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("wedding_rsvps")
      .update(payload)
      .eq("id", id);

    if (error) {
      return dashboardActionResult("error", error.message);
    }

    revalidatePath("/dashboard");
    return dashboardActionResult("success", "RSVP berhasil diperbarui.");
  } catch (error) {
    return dashboardActionError(error, "RSVP belum bisa diperbarui.");
  }
}

export async function deleteDashboardRsvp(
  _previousState: DashboardActionState,
  formData: FormData
): Promise<DashboardActionState> {
  await requireDashboardSession();

  try {
    const id = readString(formData, "id");

    if (!id) {
      throw new Error("ID RSVP tidak valid.");
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("wedding_rsvps")
      .delete()
      .eq("id", id);

    if (error) {
      return dashboardActionResult("error", error.message);
    }

    revalidatePath("/dashboard");
    return dashboardActionResult("success", "RSVP berhasil dihapus.");
  } catch (error) {
    return dashboardActionError(error, "RSVP belum bisa dihapus.");
  }
}

export async function bulkDeleteDashboardRsvps(
  _previousState: DashboardActionState,
  formData: FormData
): Promise<DashboardActionState> {
  await requireDashboardSession();

  try {
    const ids = readStrings(formData, "ids");

    if (!ids.length) {
      throw new Error("Pilih minimal satu RSVP.");
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("wedding_rsvps")
      .delete()
      .in("id", ids);

    if (error) {
      return dashboardActionResult("error", error.message);
    }

    revalidatePath("/dashboard");
    return dashboardActionResult("success", `${ids.length} RSVP dihapus.`);
  } catch (error) {
    return dashboardActionError(error, "RSVP terpilih belum bisa dihapus.");
  }
}

export async function bulkUpdateDashboardRsvpCategory(
  _previousState: DashboardActionState,
  formData: FormData
): Promise<DashboardActionState> {
  await requireDashboardSession();

  try {
    const ids = readStrings(formData, "ids");
    const category = sanitizeCategory(readString(formData, "category"));

    if (!ids.length) {
      throw new Error("Pilih minimal satu RSVP.");
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("wedding_rsvps")
      .update({
        category,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) {
      return dashboardActionResult("error", error.message);
    }

    revalidatePath("/dashboard");
    return dashboardActionResult("success", "Kategori RSVP berhasil diubah.");
  } catch (error) {
    return dashboardActionError(error, "Kategori RSVP belum bisa diubah.");
  }
}
