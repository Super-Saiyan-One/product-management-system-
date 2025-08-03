-- 产品管理系统数据库初始化脚本
-- 基于 Prisma Schema 生成

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS product_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE product_management;

-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `users_username_key` (`username`),
    UNIQUE INDEX `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建品牌表
CREATE TABLE IF NOT EXISTS `brands` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `brands_name_key` (`name`),
    UNIQUE INDEX `brands_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建仓库表
CREATE TABLE IF NOT EXISTS `warehouses` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191),
    `supplierCode` VARCHAR(191),
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `warehouses_code_key` (`code`),
    UNIQUE INDEX `warehouses_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建供应商表
CREATE TABLE IF NOT EXISTS `suppliers` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contactInfo` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `suppliers_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建产品表
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `statusNote` VARCHAR(191),
    `status` VARCHAR(191) NOT NULL,
    `hasQualityCert` BOOLEAN NOT NULL DEFAULT false,
    `name` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191),
    `barcode` VARCHAR(191),
    `shippingCode` VARCHAR(191),
    `description` TEXT,
    `highlights` TEXT,
    `marketPrice` DOUBLE,
    `salePrice` DOUBLE,
    `purchasePrice` DOUBLE,
    `minPurchasePrice` DOUBLE,
    `shippingFee` DOUBLE,
    `warehouseCode` VARCHAR(191),
    `supplierCode` VARCHAR(191),
    `warehouseName` VARCHAR(191),
    `oldShippingCode1` VARCHAR(191),
    `oldShippingCode2` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `products_barcode_key` (`barcode`),
    UNIQUE INDEX `products_shippingCode_key` (`shippingCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建更新记录表
CREATE TABLE IF NOT EXISTS `update_records` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `productId` INT NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `oldValues` TEXT,
    `newValues` TEXT,
    `changes` TEXT,
    `userId` INT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `update_records_productId_fkey` (`productId`),
    INDEX `update_records_userId_fkey` (`userId`),
    CONSTRAINT `update_records_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `update_records_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 Prisma 迁移表
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
    `id` VARCHAR(36) NOT NULL,
    `checksum` VARCHAR(64) NOT NULL,
    `finished_at` DATETIME(3),
    `migration_name` VARCHAR(255) NOT NULL,
    `logs` TEXT,
    `rolled_back_at` DATETIME(3),
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applied_steps_count` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入示例数据（可选）
INSERT IGNORE INTO `brands` (`name`, `code`) VALUES 
('苹果', 'APPLE'),
('三星', 'SAMSUNG'),
('华为', 'HUAWEI'),
('小米', 'XIAOMI'),
('OPPO', 'OPPO'),
('VIVO', 'VIVO');

INSERT IGNORE INTO `warehouses` (`code`, `name`, `supplierCode`) VALUES 
('WH001', '北京仓库', 'SUP001'),
('WH002', '上海仓库', 'SUP002'),
('WH003', '广州仓库', 'SUP003'),
('WH004', '深圳仓库', 'SUP004');

INSERT IGNORE INTO `suppliers` (`code`, `name`, `contactInfo`) VALUES 
('SUP001', '北京供应商', '010-12345678'),
('SUP002', '上海供应商', '021-87654321'),
('SUP003', '广州供应商', '020-11111111'),
('SUP004', '深圳供应商', '0755-22222222');

-- 插入 Prisma 迁移记录
INSERT IGNORE INTO `_prisma_migrations` (`id`, `checksum`, `migration_name`, `finished_at`, `applied_steps_count`) VALUES 
('init-migration', 'init-checksum', '0_init', NOW(), 1);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS `idx_products_status` ON `products` (`status`);
CREATE INDEX IF NOT EXISTS `idx_products_name` ON `products` (`name`);
CREATE INDEX IF NOT EXISTS `idx_products_brand` ON `products` (`brand`);
CREATE INDEX IF NOT EXISTS `idx_products_warehouse` ON `products` (`warehouseName`);
CREATE INDEX IF NOT EXISTS `idx_products_supplier` ON `products` (`supplierCode`);
CREATE INDEX IF NOT EXISTS `idx_products_created` ON `products` (`createdAt`);
CREATE INDEX IF NOT EXISTS `idx_update_records_created` ON `update_records` (`createdAt`);

-- 显示创建结果
SHOW TABLES;