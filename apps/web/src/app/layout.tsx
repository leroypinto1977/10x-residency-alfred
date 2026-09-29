import type { Metadata, Viewport } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { BookCallModalProvider } from "@/components/BookCallModalContext";
import BookCallModal from "@/components/BookCallModal";
import MetaPixel from "@/components/MetaPixel";
import { EVENT } from "@/lib/event";
import "./globals.css";

// Poppins carries the headlines. Weights below 700 were added after several
// section headings needed a genuinely lighter look and setting font-weight
// on --font-display had no visible effect: with only 700/800 loaded, the
// browser silently substitutes the nearest loaded weight for anything else
// requested, so `font-weight: 500` (or 200, or anything but 700/800)
// rendered as regular bold no matter what the CSS said.
// Plus Jakarta Sans carries the body text.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
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
    "Founder 10X: the 3-day residential intensive in Athirapalli, Kerala for founders already running a business they can't step away from. Build the team, the org structure and the systems that run it without you.",
  openGraph: {
    title: `${EVENT.name} — Build a Business That Runs Without You`,
    description: `A ${EVENT.durationDays}-day founder residency in ${EVENT.venue}, ${EVENT.dateLabel}, hosted by ${EVENT.host}. ${EVENT.seats} seats, by application.`,
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
    <html
      lang="en"
      className={`${poppins.variable} ${plusJakarta.variable}`}
    >
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

      {process.env.NODE_ENV === "production" &&
        process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
    </html>
  );
}