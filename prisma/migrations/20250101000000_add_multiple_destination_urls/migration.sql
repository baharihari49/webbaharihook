-- AlterTable
-- First add the new column as nullable
ALTER TABLE `Webhook` ADD COLUMN `destinationUrls` JSON NULL;

-- Copy existing destinationUrl to destinationUrls as an array
UPDATE `Webhook` SET `destinationUrls` = JSON_ARRAY(`destinationUrl`);

-- Make destinationUrls required
ALTER TABLE `Webhook` MODIFY `destinationUrls` JSON NOT NULL;

-- Drop the old column
ALTER TABLE `Webhook` DROP COLUMN `destinationUrl`;

-- AlterTable for Request
-- Rename responseStatus to statusCode
ALTER TABLE `Request` CHANGE `responseStatus` `statusCode` INT NULL;

-- Add new columns
ALTER TABLE `Request` ADD COLUMN `responseTime` INT NULL;
ALTER TABLE `Request` ADD COLUMN `destinationUrl` VARCHAR(255) NULL;