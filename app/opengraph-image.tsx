import { ImageResponse } from "next/og";

import { eventTime, eventVenueName } from "@/lib/event";

export const alt = "Wedding RSVP di Maison Grande";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #160407 0%, #4a0b18 54%, #1d1516 100%)",
          color: "#fff8ec",
          padding: 52,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 16% 20%, rgba(214,191,143,0.25) 0, rgba(214,191,143,0) 34%), radial-gradient(circle at 88% 78%, rgba(255,248,236,0.16) 0, rgba(255,248,236,0) 36%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -110,
            width: 430,
            height: 430,
            borderRadius: 430,
            border: "2px solid rgba(214,191,143,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -130,
            left: -90,
            width: 360,
            height: 360,
            borderRadius: 360,
            border: "2px solid rgba(255,248,236,0.16)",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            border: "2px solid rgba(214,191,143,0.72)",
            borderRadius: 34,
            padding: 44,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#f4ddab",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            <span>Wedding RSVP</span>
            <span>12 Juli 2026</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 820,
            }}
          >
            <div
              style={{
                color: "#f4ddab",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              {eventVenueName}
            </div>
            <div
              style={{
                marginTop: 20,
                fontSize: 76,
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: -1,
              }}
            >
              Konfirmasi Kehadiran
            </div>
            <div
              style={{
                marginTop: 24,
                color: "rgba(255,248,236,0.78)",
                fontSize: 30,
                lineHeight: 1.42,
              }}
            >
              Kehadiran dan doa Anda menjadi bagian berharga dalam hari bahagia
              kami.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                color: "rgba(255,248,236,0.76)",
                fontSize: 28,
              }}
            >
              {eventTime}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: "#f4ddab",
                color: "#23070d",
                padding: "18px 30px",
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              Buka Link RSVP
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
