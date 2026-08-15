-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "personnelId" INTEGER;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "Personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
