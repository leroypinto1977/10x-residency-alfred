import { prisma } from "@/lib/prisma";

export async function saveClientIntake(data: {
  name: string;
  email: string;
  dob: string;
  phone: string;
  businessType: string;
  industryDuration: string;
  incomeLevel: string;
  incomeTarget: string;
  meetingTargets: string;
  websiteDetails: string;
  socialLinks: string;
  investmentReady: string;
  foundUs: string[];
  foundUsOther?: string;
}) {
  return prisma.clientIntake.create({
    data: {
      name: data.name,
      email: data.email,
      dob: data.dob,
      phone: data.phone,
      businessType: data.businessType,
      industryDuration: data.industryDuration,
      incomeLevel: data.incomeLevel,
      incomeTarget: data.incomeTarget,
      meetingTargets: data.meetingTargets,
      websiteDetails: data.websiteDetails,
      socialLinks: data.socialLinks,
      investmentReady: data.investmentReady,
      foundUs: data.foundUs,
      foundUsOther: data.foundUsOther || null,
    },
  });
}

/**
 * One row per email, newest submission wins — someone re-submitting the
 * form (e.g. to correct an earlier answer) shouldn't show up twice in the
 * admin table. `distinct` keeps the first row it sees per key, so the
 * newest-first ordering has to happen before it, not after.
 */
export async function getAllClientIntakes() {
  return prisma.clientIntake.findMany({
    orderBy: { createdAt: "desc" },
    distinct: ["email"],
  });
}
