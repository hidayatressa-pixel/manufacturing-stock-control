CREATE TABLE `bom_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`bom_id` text NOT NULL,
	`component_item_id` text NOT NULL,
	`quantity` real NOT NULL,
	`uom` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`bom_id`) REFERENCES `boms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`component_item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_bom_component` ON `bom_lines` (`bom_id`,`component_item_id`);--> statement-breakpoint
CREATE TABLE `boms` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_item_id` text NOT NULL,
	`version` text NOT NULL,
	`base_quantity` real DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`parent_item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_boms_parent_version` ON `boms` (`parent_item_id`,`version`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`type` text NOT NULL,
	`uom` text NOT NULL,
	`minimum_stock` real DEFAULT 0 NOT NULL,
	`barcode` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_items_sku` ON `items` (`sku`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_items_barcode` ON `items` (`barcode`);--> statement-breakpoint
CREATE INDEX `idx_items_type_active` ON `items` (`type`,`active`);--> statement-breakpoint
CREATE TABLE `lots` (
	`id` text PRIMARY KEY NOT NULL,
	`lot_number` text NOT NULL,
	`item_id` text NOT NULL,
	`production_order_id` text,
	`received_at` text,
	`manufactured_at` text,
	`expires_at` text,
	`status` text DEFAULT 'AVAILABLE' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_lots_item_number` ON `lots` (`item_id`,`lot_number`);--> statement-breakpoint
CREATE INDEX `idx_lots_number` ON `lots` (`lot_number`);--> statement-breakpoint
CREATE TABLE `material_issues` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_number` text NOT NULL,
	`production_order_id` text NOT NULL,
	`item_id` text NOT NULL,
	`lot_id` text NOT NULL,
	`requested_quantity` real NOT NULL,
	`issued_quantity` real NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`posted_at` text,
	`created_by` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`production_order_id`) REFERENCES `production_orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_material_issues_number` ON `material_issues` (`transaction_number`);--> statement-breakpoint
CREATE INDEX `idx_mi_po` ON `material_issues` (`production_order_id`);--> statement-breakpoint
CREATE TABLE `production_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`wo_number` text NOT NULL,
	`product_item_id` text NOT NULL,
	`bom_id` text NOT NULL,
	`target_quantity` real NOT NULL,
	`production_date` text NOT NULL,
	`due_date` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`notes` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`product_item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bom_id`) REFERENCES `boms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_production_orders_number` ON `production_orders` (`wo_number`);--> statement-breakpoint
CREATE INDEX `idx_po_status_date` ON `production_orders` (`status`,`production_date`);--> statement-breakpoint
CREATE TABLE `production_results` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_number` text NOT NULL,
	`production_order_id` text NOT NULL,
	`finished_lot_id` text,
	`reported_quantity` real NOT NULL,
	`good_quantity` real NOT NULL,
	`reject_quantity` real NOT NULL,
	`reject_reason` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`started_at` text,
	`finished_at` text,
	`posted_at` text,
	`created_by` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`production_order_id`) REFERENCES `production_orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`finished_lot_id`) REFERENCES `lots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_production_results_number` ON `production_results` (`transaction_number`);--> statement-breakpoint
CREATE INDEX `idx_pr_po` ON `production_results` (`production_order_id`);--> statement-breakpoint
CREATE TABLE `stock_counts` (
	`id` text PRIMARY KEY NOT NULL,
	`document_number` text NOT NULL,
	`item_id` text NOT NULL,
	`lot_id` text,
	`system_quantity` real NOT NULL,
	`actual_quantity` real,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`adjustment_transaction_number` text,
	`counted_by` text,
	`posted_by` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`counted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`posted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_stock_count_doc_lot` ON `stock_counts` (`document_number`,`item_id`,`lot_id`);--> statement-breakpoint
CREATE INDEX `idx_stock_count_status` ON `stock_counts` (`status`);--> statement-breakpoint
CREATE TABLE `stock_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_number` text NOT NULL,
	`line_number` integer NOT NULL,
	`transaction_type` text NOT NULL,
	`item_id` text NOT NULL,
	`lot_id` text,
	`quantity` real NOT NULL,
	`direction` text NOT NULL,
	`reference_type` text NOT NULL,
	`reference_id` text NOT NULL,
	`occurred_at` text NOT NULL,
	`user_id` text NOT NULL,
	`reversal_of_id` text,
	`reason` text,
	`idempotency_key` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_ledger_transaction_line` ON `stock_ledger` (`transaction_number`,`line_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_ledger_idempotency` ON `stock_ledger` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_ledger_item_time` ON `stock_ledger` (`item_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `idx_ledger_lot_time` ON `stock_ledger` (`lot_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `idx_ledger_reference` ON `stock_ledger` (`reference_type`,`reference_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_users_email` ON `users` (`email`);