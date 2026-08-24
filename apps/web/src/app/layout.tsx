import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { BookCallModalProvider } from "@/components/BookCallModalContext";
import BookCallModal from "@/components/BookCallModal";
import MetaPixel from "@/components/MetaPixel";
import { EVENT } from "@/lib/event";
import "./globals.css";

// Shared with the "Become an Authority" residency site — both programmes
// run under GOAT Mastermind, so they read as siblings rather than as two
// unrelated brands. Outfit carries the headlines, Plus Jakarta Sans the body.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${EVENT.name} — a ${EVENT.durationDays}-Day Founder Residency | ${EVENT.venue}`,
  description:
    "Founder 10X: the 3-day residential intensive in Athirapalli, Kerala for founders and creators already running something real. Build the operating system, identity and engine to take your company past a million dollars.",
  openGraph: {
    title: `${EVENT.name} — Build Your Million Dollar Company`,
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
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body>
        <BookCallModalProvider>
          {children}
          <BookCallModal />
        </BookCallModalProvider>
        {process.env.NODE_ENV === "production" &&
          process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
            <MetaPixel pixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID} />
          )}
      </body>
      {/* Only on the deployed site — keeps local dev traffic out of the
          property and the pixel. Both IDs live in Vercel production env vars. */}
      {process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
