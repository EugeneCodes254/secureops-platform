-- CreateEnum
CREATE TYPE "PersonnelStatus" AS ENUM ('ACTIVE', 'OFF_DUTY', 'SUSPENDED');

-- CreateTable
CREATE TABLE "Personnel" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "status" "PersonnelStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id")
);
