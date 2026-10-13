-- CreateTable
CREATE TABLE "MysteryPick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "revealMode" TEXT NOT NULL,
    "moods" JSONB NOT NULL,
    "genres" JSONB,
    "experience" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MysteryPick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MysteryPick_userId_idx" ON "MysteryPick"("userId");
