import type { PrismaClient } from "@prisma/client";
type Db = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
export type StockLine = {
  itemId: string;
  lotId: string;
  locationId: string;
  quantity: number;
  direction: "IN" | "OUT";
  reversalOfId?: string;
};

// This is the only service allowed to create ledger rows or update stock balances.
// Document routes call it from inside the same interactive transaction.
export async function postStock(
  tx: Db,
  input: {
    transactionNo: string;
    transactionType: string;
    referenceType: string;
    referenceId: string;
    actorId: string;
    idempotencyKey: string;
    lines: StockLine[];
  },
) {
  if (
    !input.lines.length ||
    input.lines.some((line) => Number(line.quantity) <= 0)
  )
    throw new Error("INVALID_STOCK_QUANTITY");
  const duplicate = await tx.stockLedger.findFirst({
    where: { idempotencyKey: `${input.idempotencyKey}:1` },
  });
  if (duplicate) return { duplicate: true };
  const sorted = [...input.lines].sort((a, b) =>
    `${a.itemId}:${a.lotId}:${a.locationId}`.localeCompare(
      `${b.itemId}:${b.lotId}:${b.locationId}`,
    ),
  );
  for (const [index, line] of sorted.entries()) {
    const balance = await tx.stockBalance.findUnique({
      where: {
        itemId_lotId_locationId: {
          itemId: line.itemId,
          lotId: line.lotId,
          locationId: line.locationId,
        },
      },
    });
    const current = balance?.onHandQty ?? 0;
    const next =
      line.direction === "IN"
        ? Number(current) + Number(line.quantity)
        : Number(current) - Number(line.quantity);
    if (next < 0)
      throw new Error(`NEGATIVE_STOCK:${line.itemId}:${line.lotId}`);
    await tx.stockBalance.upsert({
      where: {
        itemId_lotId_locationId: {
          itemId: line.itemId,
          lotId: line.lotId,
          locationId: line.locationId,
        },
      },
      create: {
        itemId: line.itemId,
        lotId: line.lotId,
        locationId: line.locationId,
        onHandQty: next,
      },
      update: { onHandQty: next, version: { increment: 1 } },
    });
    await tx.stockLedger.create({
      data: {
        transactionNo: input.transactionNo,
        lineNo: index + 1,
        transactionType: input.transactionType,
        itemId: line.itemId,
        lotId: line.lotId,
        locationId: line.locationId,
        direction: line.direction,
        quantity: line.quantity,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        actorId: input.actorId,
        reversalOfId: line.reversalOfId,
        idempotencyKey: `${input.idempotencyKey}:${index + 1}`,
      },
    });
  }
  return { duplicate: false };
}
