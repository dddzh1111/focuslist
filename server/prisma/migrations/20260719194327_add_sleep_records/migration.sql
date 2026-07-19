-- CreateTable
CREATE TABLE "SleepRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "sleepTime" DATETIME NOT NULL,
    "wakeTime" DATETIME,
    "durationMinutes" INTEGER,
    "quality" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "SleepRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SleepRecord_userId_date_idx" ON "SleepRecord"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SleepRecord_userId_date_key" ON "SleepRecord"("userId", "date");
