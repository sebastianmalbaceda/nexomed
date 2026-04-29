-- AlterTable
ALTER TABLE "Patient" ADD COLUMN "dni" TEXT;
ALTER TABLE "Patient" ADD COLUMN "dietRestriction" TEXT;
ALTER TABLE "Patient" ADD COLUMN "isolationRestriction" TEXT;
ALTER TABLE "Patient" ADD COLUMN "mobilityRestriction" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_dni_key" ON "Patient"("dni");
