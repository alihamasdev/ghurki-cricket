-- CreateTable
CREATE TABLE "batting" (
    "id" INTEGER NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "balls" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "dots" INTEGER NOT NULL DEFAULT 0,
    "outs" INTEGER NOT NULL DEFAULT 0,
    "ducks" INTEGER NOT NULL DEFAULT 0,
    "playerId" TEXT NOT NULL,
    "inningsId" INTEGER NOT NULL,

    CONSTRAINT "batting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bowling" (
    "id" INTEGER NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "balls" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "dots" INTEGER NOT NULL DEFAULT 0,
    "wides" INTEGER NOT NULL DEFAULT 0,
    "noBalls" INTEGER NOT NULL DEFAULT 0,
    "playerId" TEXT NOT NULL,
    "inningsId" INTEGER NOT NULL,

    CONSTRAINT "bowling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fielding" (
    "id" INTEGER NOT NULL,
    "catches" INTEGER NOT NULL DEFAULT 0,
    "runOuts" INTEGER NOT NULL DEFAULT 0,
    "playerId" TEXT NOT NULL,
    "inningsId" INTEGER NOT NULL,

    CONSTRAINT "fielding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "batting" ADD CONSTRAINT "batting_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batting" ADD CONSTRAINT "batting_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bowling" ADD CONSTRAINT "bowling_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bowling" ADD CONSTRAINT "bowling_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fielding" ADD CONSTRAINT "fielding_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fielding" ADD CONSTRAINT "fielding_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
