-- SQL schema generated from database models
-- Creates the database used in `dbcon.js` and the tables defined in the models
drop database if exists `fechat`;

CREATE DATABASE IF NOT EXISTS `fechat` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fechat`;

-- Users table (model: user.js)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `pass` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chats table (model: chats.js)
CREATE TABLE IF NOT EXISTS `chats` (
  `prim` INT,
  `id` INT NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `included_id` INT NOT NULL,
  `included_name` VARCHAR(255) NOT NULL,
  `color` VARCHAR(255) NOT NULL,
  `is_admin` TINYINT(1) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table (model: msg.js)
CREATE TABLE IF NOT EXISTS `msgs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` INT NOT NULL,
  `text` VARCHAR(255) NOT NULL,
  `sender_id` INT NOT NULL,
  `sender_name` VARCHAR(255) NOT NULL,
  `chat_id` INT NOT NULL,
  `date` VARCHAR(255) NOT NULL,
  `time` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: adjust VARCHAR lengths and add indexes/foreign keys as needed.
