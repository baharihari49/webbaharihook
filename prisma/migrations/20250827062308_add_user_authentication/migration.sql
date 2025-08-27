/*
  Warnings:

  - Added the required column `userId` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create default admin user first
INSERT INTO `User` (`id`, `email`, `name`, `password`, `createdAt`, `updatedAt`) 
VALUES ('cmetdefault000000000000', 'admin@webhook.dev', 'Admin User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW());

-- AlterTable - Add userId column with default value pointing to admin user
ALTER TABLE `Webhook` ADD COLUMN `userId` VARCHAR(191) NOT NULL DEFAULT 'cmetdefault000000000000';

-- Remove default constraint after population
ALTER TABLE `Webhook` ALTER COLUMN `userId` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Webhook` ADD CONSTRAINT `Webhook_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
