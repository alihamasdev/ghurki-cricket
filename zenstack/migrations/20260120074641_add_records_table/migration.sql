-- CreateTable
CREATE TABLE "records" (
    "id" INTEGER NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "dots" INTEGER NOT NULL DEFAULT 0,
    "batterId" TEXT NOT NULL,
    "bowlerId" TEXT NOT NULL,
    "dateId" DATE NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_batterId_fkey" FOREIGN KEY ("batterId") REFERENCES "players"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_bowlerId_fkey" FOREIGN KEY ("bowlerId") REFERENCES "players"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "dates"("date") ON DELETE RESTRICT ON UPDATE CASCADE;
