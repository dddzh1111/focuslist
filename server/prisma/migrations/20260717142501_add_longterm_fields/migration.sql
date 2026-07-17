-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "dueDate" DATETIME,
    "estimatedPomos" INTEGER NOT NULL DEFAULT 0,
    "completedPomos" INTEGER NOT NULL DEFAULT 0,
    "totalFocusTime" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "isLongTerm" BOOLEAN NOT NULL DEFAULT false,
    "totalChapters" INTEGER NOT NULL DEFAULT 0,
    "completedChapters" INTEGER NOT NULL DEFAULT 0,
    "sourceTaskId" TEXT,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,
    "listId" TEXT,
    "sectionId" TEXT,
    CONSTRAINT "Task_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("completedAt", "completedPomos", "createdAt", "description", "dueDate", "estimatedPomos", "id", "listId", "parentId", "priority", "sectionId", "sortOrder", "status", "tags", "title", "totalFocusTime", "updatedAt", "userId") SELECT "completedAt", "completedPomos", "createdAt", "description", "dueDate", "estimatedPomos", "id", "listId", "parentId", "priority", "sectionId", "sortOrder", "status", "tags", "title", "totalFocusTime", "updatedAt", "userId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");
CREATE INDEX "Task_userId_priority_idx" ON "Task"("userId", "priority");
CREATE INDEX "Task_userId_listId_idx" ON "Task"("userId", "listId");
CREATE INDEX "Task_userId_sectionId_idx" ON "Task"("userId", "sectionId");
CREATE INDEX "Task_parentId_idx" ON "Task"("parentId");
CREATE INDEX "Task_userId_isLongTerm_idx" ON "Task"("userId", "isLongTerm");
CREATE INDEX "Task_sourceTaskId_idx" ON "Task"("sourceTaskId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
