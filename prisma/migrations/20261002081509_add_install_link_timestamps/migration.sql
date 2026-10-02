/*
  Warnings:

  - Added the required column `updatedAt` to the `InstallLink` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InstallLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "signatureId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" DATETIME,
    "installedAt" DATETIME,
    "installStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "graphUserId" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstallLink_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "Signature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InstallLink" ("expiresAt", "graphUserId", "id", "installStatus", "installedAt", "openedAt", "recipientEmail", "sentAt", "signatureId", "token") SELECT "expiresAt", "graphUserId", "id", "installStatus", "installedAt", "openedAt", "recipientEmail", "sentAt", "signatureId", "token" FROM "InstallLink";
DROP TABLE "InstallLink";
ALTER TABLE "new_InstallLink" RENAME TO "InstallLink";
CREATE UNIQUE INDEX "InstallLink_token_key" ON "InstallLink"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
