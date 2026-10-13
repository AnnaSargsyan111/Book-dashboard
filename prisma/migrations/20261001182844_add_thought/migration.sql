-- CreateTable
CREATE TABLE "Thought" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "text" TEXT NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "bookId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Thought_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Thought_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Thought_userId_idx" ON "Thought"("userId");

-- CreateIndex
CREATE INDEX "Thought_userId_favorite_idx" ON "Thought"("userId", "favorite");

-- CreateIndex
CREATE INDEX "Thought_bookId_idx" ON "Thought"("bookId");
