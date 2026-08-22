-- CreateTable
CREATE TABLE "ClientIntake" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "industryDuration" TEXT NOT NULL,
    "incomeLevel" TEXT NOT NULL,
    "incomeTarget" TEXT NOT NULL,
    "meetingTargets" TEXT NOT NULL,
    "servicesLooking" TEXT[],
    "websiteDetails" TEXT NOT NULL,
    "socialLinks" TEXT NOT NULL,
    "investmentReady" TEXT NOT NULL,
    "foundUs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientIntake_pkey" PRIMARY KEY ("id")
);
