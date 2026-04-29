ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "assignedNurseId" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "surnames" TEXT;
