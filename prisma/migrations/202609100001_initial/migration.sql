-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `employee_id` VARCHAR(40) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('PRODUCTION', 'WAREHOUSE', 'SUPERVISOR', 'MANAGER', 'ADMIN') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uoms` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(16) NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `decimal_precision` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `uoms_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(40) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(500) NULL,
    `type` ENUM('RAW_MATERIAL', 'WIP', 'FINISHED_GOODS') NOT NULL,
    `category_id` VARCHAR(191) NULL,
    `uom_id` VARCHAR(191) NOT NULL,
    `minimum_stock` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `barcode` VARCHAR(80) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `items_sku_key`(`sku`),
    UNIQUE INDEX `items_barcode_key`(`barcode`),
    INDEX `items_type_active_idx`(`type`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `locations_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lots` (
    `id` VARCHAR(191) NOT NULL,
    `lot_no` VARCHAR(80) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `source_type` VARCHAR(30) NOT NULL,
    `source_id` VARCHAR(191) NULL,
    `received_at` DATETIME(3) NULL,
    `manufactured_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `status` VARCHAR(24) NOT NULL DEFAULT 'AVAILABLE',

    INDEX `lots_lot_no_idx`(`lot_no`),
    UNIQUE INDEX `lots_item_id_lot_no_key`(`item_id`, `lot_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_balances` (
    `id` VARCHAR(191) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `lot_id` VARCHAR(191) NOT NULL,
    `location_id` VARCHAR(191) NOT NULL,
    `on_hand_qty` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `reserved_qty` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `version` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `stock_balances_item_id_lot_id_location_id_key`(`item_id`, `lot_id`, `location_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_ledger` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_no` VARCHAR(40) NOT NULL,
    `line_no` INTEGER NOT NULL,
    `transaction_type` VARCHAR(30) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `lot_id` VARCHAR(191) NOT NULL,
    `location_id` VARCHAR(191) NOT NULL,
    `direction` ENUM('IN', 'OUT') NOT NULL,
    `quantity` DECIMAL(18, 4) NOT NULL,
    `reference_type` VARCHAR(30) NOT NULL,
    `reference_id` VARCHAR(191) NOT NULL,
    `actor_id` VARCHAR(191) NOT NULL,
    `reversal_of_id` VARCHAR(191) NULL,
    `idempotency_key` VARCHAR(100) NOT NULL,
    `notes` VARCHAR(500) NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `stock_ledger_idempotency_key_key`(`idempotency_key`),
    INDEX `stock_ledger_item_id_occurred_at_idx`(`item_id`, `occurred_at`),
    INDEX `stock_ledger_lot_id_occurred_at_idx`(`lot_id`, `occurred_at`),
    INDEX `stock_ledger_reference_type_reference_id_idx`(`reference_type`, `reference_id`),
    UNIQUE INDEX `stock_ledger_transaction_no_line_no_key`(`transaction_no`, `line_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bom_headers` (
    `id` VARCHAR(191) NOT NULL,
    `parent_item_id` VARCHAR(191) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `base_quantity` DECIMAL(18, 4) NOT NULL DEFAULT 1,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `bom_headers_parent_item_id_version_key`(`parent_item_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bom_lines` (
    `id` VARCHAR(191) NOT NULL,
    `bom_id` VARCHAR(191) NOT NULL,
    `component_item_id` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(18, 4) NOT NULL,
    `uom_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `bom_lines_bom_id_component_item_id_key`(`bom_id`, `component_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_orders` (
    `id` VARCHAR(191) NOT NULL,
    `wo_no` VARCHAR(40) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `bom_id` VARCHAR(191) NOT NULL,
    `target_qty` DECIMAL(18, 4) NOT NULL,
    `production_date` DATETIME(3) NOT NULL,
    `due_date` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'RELEASED', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `notes` VARCHAR(500) NULL,

    UNIQUE INDEX `production_orders_wo_no_key`(`wo_no`),
    INDEX `production_orders_status_production_date_idx`(`status`, `production_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_requirements` (
    `id` VARCHAR(191) NOT NULL,
    `wo_id` VARCHAR(191) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `required_qty` DECIMAL(18, 4) NOT NULL,
    `requested_qty` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `issued_qty` DECIMAL(18, 4) NOT NULL DEFAULT 0,

    UNIQUE INDEX `production_requirements_wo_id_item_id_key`(`wo_id`, `item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_requests` (
    `id` VARCHAR(191) NOT NULL,
    `mr_no` VARCHAR(40) NOT NULL,
    `wo_id` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'REQUESTED', 'PARTIALLY_ISSUED', 'ISSUED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `requester_id` VARCHAR(191) NOT NULL,
    `requested_at` DATETIME(3) NULL,

    UNIQUE INDEX `material_requests_mr_no_key`(`mr_no`),
    INDEX `material_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_request_lines` (
    `id` VARCHAR(191) NOT NULL,
    `mr_id` VARCHAR(191) NOT NULL,
    `requirement_id` VARCHAR(191) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `requested_qty` DECIMAL(18, 4) NOT NULL,
    `issued_qty` DECIMAL(18, 4) NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_issues` (
    `id` VARCHAR(191) NOT NULL,
    `mi_no` VARCHAR(40) NOT NULL,
    `mr_id` VARCHAR(191) NOT NULL,
    `wo_id` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'POSTED', 'REVERSED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `warehouse_user_id` VARCHAR(191) NOT NULL,
    `posted_at` DATETIME(3) NULL,

    UNIQUE INDEX `material_issues_mi_no_key`(`mi_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_issue_lines` (
    `id` VARCHAR(191) NOT NULL,
    `mi_id` VARCHAR(191) NOT NULL,
    `mr_line_id` VARCHAR(191) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `lot_id` VARCHAR(191) NOT NULL,
    `location_id` VARCHAR(191) NOT NULL,
    `issued_qty` DECIMAL(18, 4) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_results` (
    `id` VARCHAR(191) NOT NULL,
    `prd_no` VARCHAR(40) NOT NULL,
    `wo_id` VARCHAR(191) NOT NULL,
    `reported_qty` DECIMAL(18, 4) NOT NULL,
    `good_qty` DECIMAL(18, 4) NOT NULL,
    `reject_qty` DECIMAL(18, 4) NOT NULL,
    `fg_lot_id` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'POSTED', 'REVERSED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `started_at` DATETIME(3) NULL,
    `finished_at` DATETIME(3) NULL,
    `posted_at` DATETIME(3) NULL,

    UNIQUE INDEX `production_results_prd_no_key`(`prd_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_rejects` (
    `id` VARCHAR(191) NOT NULL,
    `result_id` VARCHAR(191) NOT NULL,
    `reason_code` VARCHAR(30) NOT NULL,
    `quantity` DECIMAL(18, 4) NOT NULL,
    `notes` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actor_id` VARCHAR(191) NULL,
    `action` VARCHAR(60) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` VARCHAR(191) NULL,
    `reference_no` VARCHAR(50) NULL,
    `metadata` JSON NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_occurred_at_idx`(`occurred_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `number_sequences` (
    `id` VARCHAR(191) NOT NULL,
    `document_type` VARCHAR(12) NOT NULL,
    `business_date` DATE NOT NULL,
    `last_number` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `number_sequences_document_type_business_date_key`(`document_type`, `business_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reject_reasons` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `reject_reasons_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `company_name` VARCHAR(120) NOT NULL DEFAULT 'Your Company',
    `app_name` VARCHAR(120) NOT NULL DEFAULT 'Manufacturing Stock Control',
    `logo_url` VARCHAR(500) NULL,
    `language` VARCHAR(8) NOT NULL DEFAULT 'en',
    `theme` VARCHAR(12) NOT NULL DEFAULT 'light',
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_documents` (
    `id` VARCHAR(191) NOT NULL,
    `document_no` VARCHAR(40) NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `external_reference` VARCHAR(80) NULL,
    `status` ENUM('DRAFT', 'POSTED', 'REVERSED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `notes` VARCHAR(500) NULL,
    `actor_id` VARCHAR(191) NOT NULL,
    `posted_at` DATETIME(3) NULL,
    `reversal_of_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `inventory_documents_document_no_key`(`document_no`),
    INDEX `inventory_documents_type_status_idx`(`type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_document_lines` (
    `id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `lot_id` VARCHAR(191) NOT NULL,
    `location_id` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(18, 4) NOT NULL,
    `reason` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_opnames` (
    `id` VARCHAR(191) NOT NULL,
    `sto_no` VARCHAR(40) NOT NULL,
    `status` ENUM('DRAFT', 'POSTED', 'REVERSED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `snapshot_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `posted_at` DATETIME(3) NULL,
    `counted_by` VARCHAR(191) NULL,
    `posted_by` VARCHAR(191) NULL,
    `notes` VARCHAR(500) NULL,

    UNIQUE INDEX `stock_opnames_sto_no_key`(`sto_no`),
    INDEX `stock_opnames_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_opname_lines` (
    `id` VARCHAR(191) NOT NULL,
    `opname_id` VARCHAR(191) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `lot_id` VARCHAR(191) NOT NULL,
    `location_id` VARCHAR(191) NOT NULL,
    `system_qty` DECIMAL(18, 4) NOT NULL,
    `actual_qty` DECIMAL(18, 4) NULL,
    `gap_qty` DECIMAL(18, 4) NULL,
    `adjustment_no` VARCHAR(40) NULL,

    UNIQUE INDEX `stock_opname_lines_opname_id_item_id_lot_id_location_id_key`(`opname_id`, `item_id`, `lot_id`, `location_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_uom_id_fkey` FOREIGN KEY (`uom_id`) REFERENCES `uoms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lots` ADD CONSTRAINT `lots_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_balances` ADD CONSTRAINT `stock_balances_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_balances` ADD CONSTRAINT `stock_balances_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_balances` ADD CONSTRAINT `stock_balances_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_ledger` ADD CONSTRAINT `stock_ledger_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_ledger` ADD CONSTRAINT `stock_ledger_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_ledger` ADD CONSTRAINT `stock_ledger_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_ledger` ADD CONSTRAINT `stock_ledger_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bom_headers` ADD CONSTRAINT `bom_headers_parent_item_id_fkey` FOREIGN KEY (`parent_item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bom_lines` ADD CONSTRAINT `bom_lines_bom_id_fkey` FOREIGN KEY (`bom_id`) REFERENCES `bom_headers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bom_lines` ADD CONSTRAINT `bom_lines_component_item_id_fkey` FOREIGN KEY (`component_item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bom_lines` ADD CONSTRAINT `bom_lines_uom_id_fkey` FOREIGN KEY (`uom_id`) REFERENCES `uoms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_orders` ADD CONSTRAINT `production_orders_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_orders` ADD CONSTRAINT `production_orders_bom_id_fkey` FOREIGN KEY (`bom_id`) REFERENCES `bom_headers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_requirements` ADD CONSTRAINT `production_requirements_wo_id_fkey` FOREIGN KEY (`wo_id`) REFERENCES `production_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_requirements` ADD CONSTRAINT `production_requirements_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_requests` ADD CONSTRAINT `material_requests_wo_id_fkey` FOREIGN KEY (`wo_id`) REFERENCES `production_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_request_lines` ADD CONSTRAINT `material_request_lines_mr_id_fkey` FOREIGN KEY (`mr_id`) REFERENCES `material_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_request_lines` ADD CONSTRAINT `material_request_lines_requirement_id_fkey` FOREIGN KEY (`requirement_id`) REFERENCES `production_requirements`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_issues` ADD CONSTRAINT `material_issues_mr_id_fkey` FOREIGN KEY (`mr_id`) REFERENCES `material_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_issue_lines` ADD CONSTRAINT `material_issue_lines_mi_id_fkey` FOREIGN KEY (`mi_id`) REFERENCES `material_issues`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_issue_lines` ADD CONSTRAINT `material_issue_lines_mr_line_id_fkey` FOREIGN KEY (`mr_line_id`) REFERENCES `material_request_lines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_results` ADD CONSTRAINT `production_results_wo_id_fkey` FOREIGN KEY (`wo_id`) REFERENCES `production_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_rejects` ADD CONSTRAINT `production_rejects_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `production_results`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_document_lines` ADD CONSTRAINT `inventory_document_lines_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `inventory_documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_opname_lines` ADD CONSTRAINT `stock_opname_lines_opname_id_fkey` FOREIGN KEY (`opname_id`) REFERENCES `stock_opnames`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;


