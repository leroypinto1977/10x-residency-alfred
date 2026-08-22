import { prisma } from "@/lib/prisma";

export async function saveApplication(data: {
  name: string;
  email: string;
  company: string;
  revenue: string;
  role: string;
  bottleneck?: string;
}) {
  return prisma.application.create({
    data: {
      name: data.name,
      email: data.email,
      company: data.company,
      revenue: data.revenue,
      role: data.role,
      bottleneck: data.bottleneck,
    },
  });
}