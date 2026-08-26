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
  // Meta attribution, resolved on the server from the request's cookies. Not
  // part of the questionnaire, so it is optional and the form never sends it.
  fbp?: string;
  fbc?: string;
  metaEventId?: string;
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
      fbp: data.fbp || null,
      fbc: data.fbc || null,
      metaEventId: data.metaEventId || null,
    },
  });
}
