import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leads — Founder 10X",
  description: "Admin panel for the Founder 10X applications.",
  // The panel holds every applicant's name, phone and income. It must never
  // be indexed, and this is belt to the login's braces.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        {/* saves happen without a Save button, so the toast is how anyone
            knows the click landed */}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
