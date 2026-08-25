-- AlterTable
ALTER TABLE "ClientIntake" ADD COLUMN     "fbc" TEXT,
ADD COLUMN     "fbp" TEXT,
ADD COLUMN     "metaEventId" TEXT;

-- CreateTable
CREATE TABLE "MetaConversion" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "eventName" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT false,
    "detail" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetaConversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaConversion_leadId_sentAt_idx" ON "MetaConversion"("leadId", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "MetaConversion_leadId_eventName_key" ON "MetaConversion"("leadId", "eventName");

-- AddForeignKey
ALTER TABLE "MetaConversion" ADD CONSTRAINT "MetaConversion_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ClientIntake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
