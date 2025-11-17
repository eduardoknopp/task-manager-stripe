/*
  Warnings:

  - You are about to drop the column `projectCount` on the `entitlement_usage` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_userId_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_projectId_fkey";

-- DropIndex
DROP INDEX "tasks_projectId_idx";

-- AlterTable
ALTER TABLE "entitlement_usage" DROP COLUMN "projectCount";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "projectId";

-- DropTable
DROP TABLE "projects";
