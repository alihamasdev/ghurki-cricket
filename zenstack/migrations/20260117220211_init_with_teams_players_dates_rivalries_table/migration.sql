-- CreateTable
CREATE TABLE "teams" (
    "name" TEXT NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "players" (
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "battingStyle" TEXT,
    "bowlingStyle" TEXT,

    CONSTRAINT "players_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "rivalries" (
    "title" TEXT NOT NULL,
    "start" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" DATE,

    CONSTRAINT "rivalries_pkey" PRIMARY KEY ("title")
);

-- CreateTable
CREATE TABLE "dates" (
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "rivalryId" TEXT,

    CONSTRAINT "dates_pkey" PRIMARY KEY ("date")
);

-- AddForeignKey
ALTER TABLE "dates" ADD CONSTRAINT "dates_rivalryId_fkey" FOREIGN KEY ("rivalryId") REFERENCES "rivalries"("title") ON DELETE SET NULL ON UPDATE CASCADE;
