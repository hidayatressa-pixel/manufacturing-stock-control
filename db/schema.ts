import { integer, real, sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";

const audit = { createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull() };

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull(), name: text("name").notNull(),
  role: text("role", { enum: ["ADMIN","WAREHOUSE","PRODUCTION","VIEWER"] }).notNull(), active: integer("active", { mode:"boolean" }).notNull().default(true), ...audit,
}, t => [uniqueIndex("uq_users_email").on(t.email)]);

export const items = sqliteTable("items", {
  id: text("id").primaryKey(), sku: text("sku").notNull(), name: text("name").notNull(), description: text("description"), category: text("category"),
  type: text("type", { enum:["RAW_MATERIAL","WIP","FINISHED_GOODS"] }).notNull(), uom: text("uom").notNull(), minimumStock: real("minimum_stock").notNull().default(0), barcode: text("barcode"), active: integer("active",{mode:"boolean"}).notNull().default(true), ...audit,
}, t => [uniqueIndex("uq_items_sku").on(t.sku), uniqueIndex("uq_items_barcode").on(t.barcode), index("idx_items_type_active").on(t.type,t.active)]);

export const lots = sqliteTable("lots", {
  id: text("id").primaryKey(), lotNumber: text("lot_number").notNull(), itemId: text("item_id").notNull().references(()=>items.id),
  productionOrderId: text("production_order_id"), receivedAt: text("received_at"), manufacturedAt: text("manufactured_at"), expiresAt: text("expires_at"), status: text("status").notNull().default("AVAILABLE"), ...audit,
}, t => [uniqueIndex("uq_lots_item_number").on(t.itemId,t.lotNumber), index("idx_lots_number").on(t.lotNumber)]);

export const boms = sqliteTable("boms", {
  id:text("id").primaryKey(), parentItemId:text("parent_item_id").notNull().references(()=>items.id), version:text("version").notNull(), baseQuantity:real("base_quantity").notNull().default(1), status:text("status").notNull().default("ACTIVE"), ...audit,
}, t=>[uniqueIndex("uq_boms_parent_version").on(t.parentItemId,t.version)]);

export const bomLines = sqliteTable("bom_lines", {
  id:text("id").primaryKey(), bomId:text("bom_id").notNull().references(()=>boms.id), componentItemId:text("component_item_id").notNull().references(()=>items.id), quantity:real("quantity").notNull(), uom:text("uom").notNull(), ...audit,
}, t=>[uniqueIndex("uq_bom_component").on(t.bomId,t.componentItemId)]);

export const productionOrders = sqliteTable("production_orders", {
  id:text("id").primaryKey(), woNumber:text("wo_number").notNull(), productItemId:text("product_item_id").notNull().references(()=>items.id), bomId:text("bom_id").notNull().references(()=>boms.id), targetQuantity:real("target_quantity").notNull(), productionDate:text("production_date").notNull(), dueDate:text("due_date"), status:text("status",{enum:["DRAFT","RELEASED","IN_PRODUCTION","COMPLETED","CANCELLED"]}).notNull().default("DRAFT"), notes:text("notes"), createdBy:text("created_by").notNull().references(()=>users.id), ...audit,
}, t=>[uniqueIndex("uq_production_orders_number").on(t.woNumber),index("idx_po_status_date").on(t.status,t.productionDate)]);

export const materialIssues = sqliteTable("material_issues", {
  id:text("id").primaryKey(), transactionNumber:text("transaction_number").notNull(), productionOrderId:text("production_order_id").notNull().references(()=>productionOrders.id), itemId:text("item_id").notNull().references(()=>items.id), lotId:text("lot_id").notNull().references(()=>lots.id), requestedQuantity:real("requested_quantity").notNull(), issuedQuantity:real("issued_quantity").notNull(), status:text("status",{enum:["DRAFT","POSTED","REVERSED"]}).notNull().default("DRAFT"), postedAt:text("posted_at"), createdBy:text("created_by").notNull().references(()=>users.id), notes:text("notes"), ...audit,
}, t=>[uniqueIndex("uq_material_issues_number").on(t.transactionNumber),index("idx_mi_po").on(t.productionOrderId)]);

export const productionResults = sqliteTable("production_results", {
  id:text("id").primaryKey(), transactionNumber:text("transaction_number").notNull(), productionOrderId:text("production_order_id").notNull().references(()=>productionOrders.id), finishedLotId:text("finished_lot_id").references(()=>lots.id), reportedQuantity:real("reported_quantity").notNull(), goodQuantity:real("good_quantity").notNull(), rejectQuantity:real("reject_quantity").notNull(), rejectReason:text("reject_reason"), status:text("status",{enum:["DRAFT","POSTED","REVERSED"]}).notNull().default("DRAFT"), startedAt:text("started_at"), finishedAt:text("finished_at"), postedAt:text("posted_at"), createdBy:text("created_by").notNull().references(()=>users.id), notes:text("notes"), ...audit,
}, t=>[uniqueIndex("uq_production_results_number").on(t.transactionNumber),index("idx_pr_po").on(t.productionOrderId)]);

export const stockLedger = sqliteTable("stock_ledger", {
  id:text("id").primaryKey(), transactionNumber:text("transaction_number").notNull(), lineNumber:integer("line_number").notNull(), transactionType:text("transaction_type").notNull(), itemId:text("item_id").notNull().references(()=>items.id), lotId:text("lot_id").references(()=>lots.id), quantity:real("quantity").notNull(), direction:text("direction",{enum:["IN","OUT"]}).notNull(), referenceType:text("reference_type").notNull(), referenceId:text("reference_id").notNull(), occurredAt:text("occurred_at").notNull(), userId:text("user_id").notNull().references(()=>users.id), reversalOfId:text("reversal_of_id"), reason:text("reason"), idempotencyKey:text("idempotency_key").notNull(), createdAt:text("created_at").notNull(),
}, t=>[uniqueIndex("uq_ledger_transaction_line").on(t.transactionNumber,t.lineNumber),uniqueIndex("uq_ledger_idempotency").on(t.idempotencyKey),index("idx_ledger_item_time").on(t.itemId,t.occurredAt),index("idx_ledger_lot_time").on(t.lotId,t.occurredAt),index("idx_ledger_reference").on(t.referenceType,t.referenceId)]);

export const stockCounts = sqliteTable("stock_counts", {
 id:text("id").primaryKey(), documentNumber:text("document_number").notNull(), itemId:text("item_id").notNull().references(()=>items.id), lotId:text("lot_id").references(()=>lots.id), systemQuantity:real("system_quantity").notNull(), actualQuantity:real("actual_quantity"), status:text("status",{enum:["DRAFT","COUNTED","POSTED","CANCELLED"]}).notNull().default("DRAFT"), adjustmentTransactionNumber:text("adjustment_transaction_number"), countedBy:text("counted_by").references(()=>users.id), postedBy:text("posted_by").references(()=>users.id), notes:text("notes"), ...audit,
}, t=>[uniqueIndex("uq_stock_count_doc_lot").on(t.documentNumber,t.itemId,t.lotId),index("idx_stock_count_status").on(t.status)]);
