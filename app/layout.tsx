import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Wedding RSVP | Maison Grande",
  description:
    "Konfirmasi kehadiran Anda untuk acara wedding di Maison Grande, 12 Juli 2026.",
  openGraph: {
    title: "Wedding RSVP | Maison Grande",
    description:
      "Konfirmasi kehadiran Anda untuk acara wedding di Maison Grande, 12 Juli 2026.",
    url: "/",
    siteName: "Wedding RSVP",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Wedding RSVP di Maison Grande",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding RSVP | Maison Grande",
    description:
      "Konfirmasi kehadiran Anda untuk acara wedding di Maison Grande, 12 Juli 2026.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
