-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rating" REAL,
    "genres" JSONB NOT NULL,
    "plot" TEXT,
    "characters" JSONB NOT NULL,
    "quotes" JSONB NOT NULL,
    "commentary" TEXT,
    "coverUrl" TEXT,
    "sourceMysteryPickId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Book_sourceMysteryPickId_fkey" FOREIGN KEY ("sourceMysteryPickId") REFERENCES "MysteryPick" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("author", "characters", "commentary", "coverUrl", "createdAt", "genres", "id", "plot", "quotes", "rating", "status", "title", "updatedAt", "userId") SELECT "author", "characters", "commentary", "coverUrl", "createdAt", "genres", "id", "plot", "quotes", "rating", "status", "title", "updatedAt", "userId" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_sourceMysteryPickId_key" ON "Book"("sourceMysteryPickId");
CREATE INDEX "Book_userId_idx" ON "Book"("userId");
CREATE INDEX "Book_userId_status_idx" ON "Book"("userId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
