import { ImageResponse } from "next/og";
import { createElement } from "react";

import {
  formatAttendanceStatus,
  formatCategory,
  type WeddingRsvp,
} from "@/lib/rsvp";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});
const venueName = "Maison Grande";
const venueAddress =
  "Setra Duta Grande Raya No.33, Sariwangi, Parongpong, West Bandung Regency, West Java 40559.";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const rsvp = await getRsvp(id);

  if (!rsvp) {
    return new Response("Konfirmasi tidak ditemukan.", { status: 404 });
  }

  const filename = `tanda-konfirmasi-${rsvp.name_key || rsvp.id}.png`;

  return new ImageResponse(renderConfirmationImage(rsvp), {
    width: 1080,
    height: 1350,
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
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

function renderConfirmationImage(rsvp: WeddingRsvp) {
  const status = formatAttendanceStatus(rsvp.attendance_status);
  const category = formatCategory(rsvp.category);
  const updatedAt = dateFormatter.format(new Date(rsvp.updated_at));
  const confirmationCode = rsvp.id.slice(0, 8).toUpperCase();
  const attending = rsvp.attendance_status === "attending";

  return createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(145deg, #120407 0%, #3a0713 45%, #6e1425 100%)",
        padding: 64,
      },
    },
    createElement("div", {
      style: {
        position: "absolute",
        top: -220,
        right: -180,
        width: 620,
        height: 620,
        borderRadius: 620,
        border: "2px solid rgba(214, 191, 143, 0.16)",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        bottom: -190,
        left: -160,
        width: 520,
        height: 520,
        borderRadius: 520,
        border: "2px solid rgba(255, 250, 242, 0.12)",
      },
    }),
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          border: "3px solid rgba(214, 191, 143, 0.95)",
          borderRadius: 52,
          background:
            "linear-gradient(180deg, #fffaf2 0%, #f8eedc 100%)",
          padding: 56,
        },
      },
      createElement("div", {
        style: {
          position: "absolute",
          top: 18,
          right: 18,
          bottom: 18,
          left: 18,
          border: "1px solid rgba(74, 11, 24, 0.18)",
          borderRadius: 38,
        },
      }),
      createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
          },
        },
        createElement(
          "div",
          {
            style: {
              width: 116,
              height: 116,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #d6bf8f",
              borderRadius: 116,
              background: "#4a0b18",
              color: "#f7e7bf",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 3,
            },
          },
          "RSVP"
        ),
        createElement(
          "div",
          {
            style: {
              marginTop: 28,
              color: "#6e1425",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 6,
              textTransform: "uppercase",
            },
          },
          "Wedding RSVP"
        ),
        createElement(
          "div",
          {
            style: {
              marginTop: 18,
              color: "#2a090e",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
            },
          },
          "Tanda Konfirmasi"
        ),
        createElement(
          "div",
          {
            style: {
              marginTop: 16,
              color: "#75665f",
              fontSize: 27,
              lineHeight: 1.45,
            },
          },
          "Dengan hormat, konfirmasi kehadiran Anda telah tercatat."
        )
      ),
      createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          },
        },
        createElement(
          "div",
          {
            style: {
              color: "#2a090e",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.08,
              textAlign: "center",
              maxWidth: 820,
            },
          },
          rsvp.name
        ),
        createElement(
          "div",
          {
            style: {
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: attending ? "2px solid #d6bf8f" : "2px solid #d9d0c2",
              borderRadius: 999,
              background: attending ? "#4a0b18" : "#efe7d9",
              color: attending ? "#fff8e7" : "#5a5049",
              padding: "14px 30px",
              fontSize: 27,
              fontWeight: 800,
            },
          },
          status
        ),
        createElement(
          "div",
          {
            style: {
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              marginTop: 44,
              borderTop: "2px solid #eadfc9",
              borderBottom: "2px solid #eadfc9",
              padding: "34px 0",
            },
          },
          renderRow("Jumlah", `${rsvp.guest_count} tamu`),
          renderRow("Kategori", category),
          renderRow("Venue", venueName),
          renderRow("Lokasi", venueAddress),
          renderRow("Waktu", updatedAt),
          renderRow("Kode", confirmationCode),
          rsvp.message ? renderRow("Pesan", truncateText(rsvp.message, 70)) : null
        )
      ),
      createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            color: "#827269",
            fontSize: 23,
            lineHeight: 1.45,
            textAlign: "center",
          },
        },
        createElement("div", {
          style: {
            width: 120,
            height: 2,
            background: "#d6bf8f",
            marginBottom: 18,
          },
        }),
        "Mohon tunjukkan tanda konfirmasi ini saat hadir di acara."
      )
    )
  );
}

function renderRow(label: string, value: string) {
  return createElement(
    "div",
    {
      key: label,
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: 32,
        fontSize: 30,
        lineHeight: 1.35,
      },
    },
    createElement(
      "div",
      {
        style: {
          color: "#827269",
          display: "flex",
          flexShrink: 0,
        },
      },
      label
    ),
    createElement(
      "div",
      {
        style: {
          color: "#2a090e",
          display: "flex",
          fontWeight: 800,
          textAlign: "right",
          maxWidth: 620,
        },
      },
      value
    )
  );
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
