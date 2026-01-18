-- CreateTable
CREATE TABLE "matches" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "totalOvers" INTEGER NOT NULL,
    "winByRuns" INTEGER,
    "winByWickets" INTEGER,
    "videoUrl" TEXT,
    "scorecardUrl" TEXT,
    "winnerId" TEXT NOT NULL,
    "playerOfMatchId" TEXT NOT NULL,
    "dateId" DATE NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innings" (
    "id" INTEGER NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "balls" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "allOuts" INTEGER NOT NULL DEFAULT 0,
    "teamId" TEXT NOT NULL,
    "matchId" INTEGER NOT NULL,
    "dateId" DATE NOT NULL,

    CONSTRAINT "innings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "teams"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_playerOfMatchId_fkey" FOREIGN KEY ("playerOfMatchId") REFERENCES "players"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "dates"("date") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "dates"("date") ON DELETE RESTRICT ON UPDATE CASCADE;
