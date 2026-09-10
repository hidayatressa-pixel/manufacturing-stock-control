import {
  PrismaClient,
  Direction,
  ItemType,
  Role,
  WorkOrderStatus,
} from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();
async function main() {
  const users = [
    ["PROD-1001", "Production Demo", Role.PRODUCTION, "1234"],
    ["WH-2001", "Warehouse Demo", Role.WAREHOUSE, "2345"],
    ["SPV-3001", "Supervisor Demo", Role.SUPERVISOR, "3456"],
    ["MGR-4001", "Manager Demo", Role.MANAGER, "4567"],
    ["admin01", "System Administrator", Role.ADMIN, "8888"],
  ] as const;
  for (const [employeeId, name, role, pin] of users)
    await prisma.user.upsert({
      where: { employeeId },
      update: { name, role, active: true },
      create: { employeeId, name, role, passwordHash: await argon2.hash(pin) },
    });
  const pcs = await prisma.uom.upsert({
    where: { code: "PCS" },
    update: {},
    create: { code: "PCS", name: "Pieces" },
  });
  const kg = await prisma.uom.upsert({
    where: { code: "KG" },
    update: {},
    create: { code: "KG", name: "Kilogram", decimalPrecision: 3 },
  });
  const resin = await prisma.category.upsert({
    where: { code: "RESIN" },
    update: {},
    create: { code: "RESIN", name: "Plastic Resin" },
  });
  const electrical = await prisma.category.upsert({
    where: { code: "ELECTRICAL" },
    update: {},
    create: { code: "ELECTRICAL", name: "Electrical" },
  });
  const product = await prisma.category.upsert({
    where: { code: "PRODUCT" },
    update: {},
    create: { code: "PRODUCT", name: "Finished Product" },
  });
  const itemData = [
    {
      sku: "RM-ABS-001",
      name: "ABS Resin Black",
      type: ItemType.RAW_MATERIAL,
      categoryId: resin.id,
      uomId: kg.id,
      minimumStock: 350,
    },
    {
      sku: "RM-LED-014",
      name: "LED Module 12V",
      type: ItemType.RAW_MATERIAL,
      categoryId: electrical.id,
      uomId: pcs.id,
      minimumStock: 300,
    },
    {
      sku: "RM-LENS-008",
      name: "Clear Lens Type B",
      type: ItemType.RAW_MATERIAL,
      categoryId: product.id,
      uomId: pcs.id,
      minimumStock: 120,
    },
    {
      sku: "WIP-HSG-002",
      name: "Rear Lamp Housing",
      type: ItemType.WIP,
      categoryId: product.id,
      uomId: pcs.id,
      minimumStock: 150,
    },
    {
      sku: "FG-RL-220",
      name: "Rear Combination Lamp",
      type: ItemType.FINISHED_GOODS,
      categoryId: product.id,
      uomId: pcs.id,
      minimumStock: 240,
    },
  ];
  for (const data of itemData)
    await prisma.item.upsert({
      where: { sku: data.sku },
      update: data,
      create: data,
    });
  const wh = await prisma.location.upsert({
    where: { code: "WH-RM" },
    update: {},
    create: {
      code: "WH-RM",
      name: "Raw Material Warehouse",
      type: "WAREHOUSE",
    },
  });
  await prisma.location.upsert({
    where: { code: "WH-FG" },
    update: {},
    create: {
      code: "WH-FG",
      name: "Finished Goods Warehouse",
      type: "WAREHOUSE",
    },
  });
  await prisma.rejectReason.upsert({
    where: { code: "VISUAL" },
    update: {},
    create: { code: "VISUAL", name: "Visual defect" },
  });
  await prisma.rejectReason.upsert({
    where: { code: "FUNCTION" },
    update: {},
    create: { code: "FUNCTION", name: "Functional failure" },
  });
  await prisma.systemSetting.upsert({
    where: { id: "SYSTEM" },
    update: { companyName: "Astra Demo Plant" },
    create: { id: "SYSTEM", companyName: "Astra Demo Plant" },
  });
  const abs = await prisma.item.findUniqueOrThrow({
    where: { sku: "RM-ABS-001" },
  });
  const fg = await prisma.item.findUniqueOrThrow({
    where: { sku: "FG-RL-220" },
  });
  const admin = await prisma.user.findUniqueOrThrow({
    where: { employeeId: "admin01" },
  });
  const lot = await prisma.lot.upsert({
    where: { itemId_lotNo: { itemId: abs.id, lotNo: "RM-260907-A" } },
    update: {},
    create: {
      itemId: abs.id,
      lotNo: "RM-260907-A",
      sourceType: "RECEIVING",
      receivedAt: new Date(),
    },
  });
  await prisma.stockBalance.upsert({
    where: {
      itemId_lotId_locationId: {
        itemId: abs.id,
        lotId: lot.id,
        locationId: wh.id,
      },
    },
    update: { onHandQty: 1240 },
    create: {
      itemId: abs.id,
      lotId: lot.id,
      locationId: wh.id,
      onHandQty: 1240,
    },
  });
  await prisma.stockLedger.upsert({
    where: { idempotencyKey: "DEMO:OPENING:ABS:1" },
    update: {},
    create: {
      transactionNo: "RCV-20260911-0001",
      lineNo: 1,
      transactionType: "OPENING_BALANCE",
      itemId: abs.id,
      lotId: lot.id,
      locationId: wh.id,
      direction: Direction.IN,
      quantity: 1240,
      referenceType: "DEMO_SEED",
      referenceId: "DEMO",
      actorId: admin.id,
      idempotencyKey: "DEMO:OPENING:ABS:1",
    },
  });
  const bom = await prisma.bomHeader.upsert({
    where: { parentItemId_version: { parentItemId: fg.id, version: "V1" } },
    update: {},
    create: { parentItemId: fg.id, version: "V1", baseQuantity: 1 },
  });
  await prisma.bomLine.upsert({
    where: {
      bomId_componentItemId: { bomId: bom.id, componentItemId: abs.id },
    },
    update: { quantity: 0.25 },
    create: {
      bomId: bom.id,
      componentItemId: abs.id,
      quantity: 0.25,
      uomId: kg.id,
    },
  });
  await prisma.productionOrder.upsert({
    where: { woNo: "WO-20260911-0001" },
    update: {},
    create: {
      woNo: "WO-20260911-0001",
      productId: fg.id,
      bomId: bom.id,
      targetQty: 200,
      productionDate: new Date(),
      status: WorkOrderStatus.IN_PRODUCTION,
    },
  });
  console.log("MSC demo data initialized");
}
main().finally(() => prisma.$disconnect());
