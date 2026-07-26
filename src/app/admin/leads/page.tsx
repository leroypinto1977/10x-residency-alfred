import type { Metadata } from "next";
import AdminLead from "@/components/sections/AdminLead";

export const metadata: Metadata = {
  title: "Leads — Admin",
  robots: { index: false, follow: false },
};

export default function AdminLeadsPage() {
  return <AdminLead />;
}
