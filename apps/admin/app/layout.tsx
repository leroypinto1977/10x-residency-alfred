import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leads — Founder 10X",
  // The panel holds every applicant's name, phone and income. It must never
  // be indexed, and this is belt to the login's braces.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
