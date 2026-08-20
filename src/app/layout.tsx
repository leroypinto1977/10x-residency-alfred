import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { BookCallModalProvider } from "@/components/BookCallModalContext";
import BookCallModal from "@/components/BookCallModal";
import { EVENT } from "@/lib/event";
import "./globals.css";

// Shared with the "Become an Authority" residency site — both programmes
// run under GOAT Mastermind, so they read as siblings rather than as two
// unrelated brands. Space Grotesk carries the headlines, Manrope the body.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${EVENT.name} — a ${EVENT.durationDays}-Day Founder Residency | ${EVENT.venue}`,
  description:
    "Founder 10X: the 3-day residential intensive in Athirapalli, Kerala for founders and creators under 27. Build the operating system, identity and engine to take your company past a million dollars — before 30.",
  openGraph: {
    title: `${EVENT.name} — Build Your Million Dollar Company Before 30`,
    description: `A ${EVENT.durationDays}-day founder residency in ${EVENT.venue}, hosted by ${EVENT.host}. ${EVENT.seats} seats, by application.`,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body>
        <BookCallModalProvider>
          {children}
          <BookCallModal />
        </BookCallModalProvider>
      </body>
    </html>
  );
}
