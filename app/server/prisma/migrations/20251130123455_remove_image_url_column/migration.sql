/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the `kitchen_stations` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "menu_items" DROP COLUMN "imageUrl";

-- DropTable
DROP TABLE "kitchen_stations";

-- DropEnum
DROP TYPE "StationType";
