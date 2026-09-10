import { Router } from "express";
import { z } from "zod";
import { authenticate, requireCapability, type AuthRequest } from "../auth.js";
import { prisma } from "../prisma.js";
import { postStock } from "./stock-posting.js";
import argon2 from "argon2";

const db = prisma as any;
const line = z.object({
  itemId: z.string().min(1),
  lotId: z.string().min(1),
  locationId: z.string().min(1),
  quantity: z.coerce.number().positive(),
});
const actor = (req: AuthRequest) => req.user!.id;
const iso = { isolationLevel: "Serializable" as const };
async function number(tx: any, type: string) {
  const now = new Date(),
    day = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  const row = await tx.numberSequence.upsert({
    where: {
      documentType_businessDate: { documentType: type, businessDate: day },
    },
    create: { documentType: type, businessDate: day, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return `${type}-${day.toISOString().slice(0, 10).replaceAll("-", "")}-${String(row.lastNumber).padStart(4, "0")}`;
}
async function log(
  tx: any,
  req: AuthRequest,
  action: string,
  entityType: string,
  entityId?: string,
  referenceNo?: string,
  metadata?: unknown,
) {
  await tx.activityLog.create({
    data: {
      actorId: actor(req),
      action,
      entityType,
      entityId,
      referenceNo,
      metadata: metadata as any,
    },
  });
}
export const operationRouter = Router();
operationRouter.use(authenticate);

operationRouter.get(
  "/masters",
  requireCapability("item:read"),
  async (_req, res, next) => {
    try {
      const [uoms, categories, locations, rejectReasons, boms] =
        await Promise.all([
          db.uom.findMany(),
          db.category.findMany(),
          db.location.findMany(),
          db.rejectReason.findMany(),
          db.bomHeader.findMany({
            include: {
              parentItem: true,
              lines: { include: { component: true, uom: true } },
            },
          }),
        ]);
      res.json({ uoms, categories, locations, rejectReasons, boms });
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.get(
  "/material-requests",
  requireCapability("production:read"),
  async (_req, res, next) => {
    try {
      res.json(
        await db.materialRequest.findMany({
          include: { productionOrder: true, lines: true, issues: true },
          orderBy: { requestedAt: "desc" },
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.get(
  "/material-issues",
  requireCapability("production:read"),
  async (_req, res, next) => {
    try {
      res.json(
        await db.materialIssue.findMany({
          include: { request: true, lines: true },
          orderBy: { postedAt: "desc" },
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.get(
  "/production-results",
  requireCapability("production:read"),
  async (_req, res, next) => {
    try {
      res.json(
        await db.productionResult.findMany({
          include: {
            productionOrder: { include: { product: true } },
            rejects: true,
          },
          orderBy: { postedAt: "desc" },
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.get(
  "/stock-opnames",
  requireCapability("inventory:read"),
  async (_req, res, next) => {
    try {
      res.json(
        await db.stockOpname.findMany({
          include: { lines: true },
          orderBy: { snapshotAt: "desc" },
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.post(
  "/boms",
  requireCapability("admin:manage"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
        .object({
          parentItemId: z.string(),
          version: z.string().min(1),
          baseQuantity: z.coerce.number().positive(),
          lines: z
            .array(
              z.object({
                componentItemId: z.string(),
                quantity: z.coerce.number().positive(),
                uomId: z.string(),
              }),
            )
            .min(1),
        })
        .parse(req.body);
      const result = await db.$transaction(async (tx: any) => {
        const bom = await tx.bomHeader.create({
          data: {
            parentItemId: input.parentItemId,
            version: input.version,
            baseQuantity: input.baseQuantity,
            lines: { create: input.lines },
          },
        });
        await log(
          tx,
          req,
          "CREATE_BOM",
          "BomHeader",
          bom.id,
          `${input.parentItemId}:${input.version}`,
        );
        return bom;
      }, iso);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);

operationRouter.get(
  "/inventory",
  requireCapability("inventory:read"),
  async (req, res, next) => {
    try {
      res.json(
        await db.stockBalance.findMany({
          where: req.query.itemId ? { itemId: String(req.query.itemId) } : {},
          include: {
            item: { include: { uom: true } },
            lot: true,
            location: true,
          },
          orderBy: { itemId: "asc" },
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.get(
  "/ledger",
  requireCapability("inventory:read"),
  async (req, res, next) => {
    try {
      const where: any = {};
      for (const k of ["itemId", "lotId", "transactionType", "referenceId"]) {
        if (req.query[k]) where[k] = String(req.query[k]);
      }
      res.json(
        await db.stockLedger.findMany({
          where,
          include: {
            item: true,
            lot: true,
            location: true,
            actor: { select: { employeeId: true, name: true } },
          },
          orderBy: { occurredAt: "desc" },
          take: 500,
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.post(
  "/inventory-documents",
  requireCapability("inventory:post"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
        .object({
          type: z.enum([
            "RECEIVING",
            "RETURN",
            "ADJUSTMENT_IN",
            "ADJUSTMENT_OUT",
          ]),
          externalReference: z.string().max(80).optional(),
          notes: z.string().max(500).optional(),
          lines: z.array(line).min(1),
          idempotencyKey: z.string().min(8),
        })
        .parse(req.body);
      const result = await db.$transaction(async (tx: any) => {
        const no = await number(
          tx,
          input.type.startsWith("ADJUSTMENT")
            ? "ADJ"
            : input.type === "RETURN"
              ? "RTN"
              : "RCV",
        );
        const doc = await tx.inventoryDocument.create({
          data: {
            documentNo: no,
            type: input.type,
            externalReference: input.externalReference,
            notes: input.notes,
            actorId: actor(req),
            status: "POSTED",
            postedAt: new Date(),
            lines: { create: input.lines },
          },
        });
        await postStock(tx, {
          transactionNo: no,
          transactionType: input.type,
          referenceType: "INVENTORY_DOCUMENT",
          referenceId: doc.id,
          actorId: actor(req),
          idempotencyKey: input.idempotencyKey,
          lines: input.lines.map((x) => ({
            ...x,
            direction:
              input.type === "ADJUSTMENT_OUT" || input.type === "RETURN"
                ? "OUT"
                : "IN",
          })),
        });
        await log(
          tx,
          req,
          "POST_INVENTORY_DOCUMENT",
          "InventoryDocument",
          doc.id,
          no,
        );
        return doc;
      }, iso);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);

operationRouter.get(
  "/production-orders",
  requireCapability("production:read"),
  async (_req, res, next) => {
    try {
      res.json(
        await db.productionOrder.findMany({
          include: {
            product: true,
            bom: true,
            requirements: { include: { item: true } },
            requests: true,
            results: true,
          },
          orderBy: { productionDate: "desc" },
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.post(
  "/production-orders",
  requireCapability("production:execute"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
        .object({
          productId: z.string(),
          bomId: z.string(),
          targetQty: z.coerce.number().positive(),
          productionDate: z.coerce.date(),
          dueDate: z.coerce.date().optional(),
          notes: z.string().optional(),
          release: z.boolean().default(false),
        })
        .parse(req.body);
      const result = await db.$transaction(async (tx: any) => {
        const bom = await tx.bomHeader.findUniqueOrThrow({
            where: { id: input.bomId },
            include: { lines: true },
          }),
          woNo = await number(tx, "WO");
        if (bom.parentItemId !== input.productId)
          throw new Error("BOM_PRODUCT_MISMATCH");
        const wo = await tx.productionOrder.create({
          data: {
            woNo,
            productId: input.productId,
            bomId: input.bomId,
            targetQty: input.targetQty,
            productionDate: input.productionDate,
            dueDate: input.dueDate,
            notes: input.notes,
            status: input.release ? "RELEASED" : "DRAFT",
            requirements: input.release
              ? {
                  create: bom.lines.map((l: any) => ({
                    itemId: l.componentItemId,
                    requiredQty:
                      (Number(l.quantity) * input.targetQty) /
                      Number(bom.baseQuantity),
                  })),
                }
              : undefined,
          },
        });
        await log(
          tx,
          req,
          input.release ? "RELEASE_WO" : "CREATE_WO",
          "ProductionOrder",
          wo.id,
          woNo,
        );
        return wo;
      }, iso);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.post(
  "/production-orders/:id/release",
  requireCapability("production:execute"),
  async (req: AuthRequest, res, next) => {
    try {
      const result = await db.$transaction(async (tx: any) => {
        const wo = await tx.productionOrder.findUniqueOrThrow({
          where: { id: req.params.id },
          include: { bom: { include: { lines: true } }, requirements: true },
        });
        if (wo.status !== "DRAFT") throw new Error("WO_NOT_DRAFT");
        if (!wo.requirements.length)
          await tx.productionRequirement.createMany({
            data: wo.bom.lines.map((l: any) => ({
              woId: wo.id,
              itemId: l.componentItemId,
              requiredQty:
                (Number(l.quantity) * Number(wo.targetQty)) /
                Number(wo.bom.baseQuantity),
            })),
          });
        const updated = await tx.productionOrder.update({
          where: { id: wo.id },
          data: { status: "RELEASED" },
        });
        await log(tx, req, "RELEASE_WO", "ProductionOrder", wo.id, wo.woNo);
        return updated;
      }, iso);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

operationRouter.post(
  "/material-requests",
  requireCapability("material:request"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
        .object({
          woId: z.string(),
          lines: z
            .array(
              z.object({
                requirementId: z.string(),
                requestedQty: z.coerce.number().positive(),
              }),
            )
            .min(1),
        })
        .parse(req.body);
      const result = await db.$transaction(async (tx: any) => {
        const wo = await tx.productionOrder.findUniqueOrThrow({
          where: { id: input.woId },
        });
        if (!["RELEASED", "IN_PRODUCTION"].includes(wo.status))
          throw new Error("WO_NOT_RELEASED");
        const requirements = await tx.productionRequirement.findMany({
            where: { woId: input.woId },
          }),
          map = new Map(requirements.map((r: any) => [r.id, r]));
        for (const l of input.lines) {
          const r: any = map.get(l.requirementId);
          if (
            !r ||
            Number(r.requestedQty) + l.requestedQty > Number(r.requiredQty)
          )
            throw new Error("REQUEST_EXCEEDS_REQUIREMENT");
        }
        const mrNo = await number(tx, "MR"),
          mr = await tx.materialRequest.create({
            data: {
              mrNo,
              woId: input.woId,
              status: "REQUESTED",
              requesterId: actor(req),
              requestedAt: new Date(),
              lines: {
                create: input.lines.map((l) => ({
                  requirementId: l.requirementId,
                  itemId: (map.get(l.requirementId) as any).itemId,
                  requestedQty: l.requestedQty,
                })),
              },
            },
          });
        for (const l of input.lines)
          await tx.productionRequirement.update({
            where: { id: l.requirementId },
            data: { requestedQty: { increment: l.requestedQty } },
          });
        await log(tx, req, "REQUEST_MATERIAL", "MaterialRequest", mr.id, mrNo);
        return mr;
      }, iso);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.post(
  "/material-issues",
  requireCapability("material:issue"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
        .object({
          mrId: z.string(),
          lines: z
            .array(
              z.object({
                mrLineId: z.string(),
                itemId: z.string(),
                lotId: z.string(),
                locationId: z.string(),
                issuedQty: z.coerce.number().positive(),
              }),
            )
            .min(1),
          idempotencyKey: z.string().min(8),
        })
        .parse(req.body);
      const result = await db.$transaction(async (tx: any) => {
        const mr = await tx.materialRequest.findUniqueOrThrow({
            where: { id: input.mrId },
            include: { lines: true },
          }),
          lineMap = new Map(mr.lines.map((l: any) => [l.id, l]));
        for (const l of input.lines) {
          const source: any = lineMap.get(l.mrLineId);
          if (
            !source ||
            source.itemId !== l.itemId ||
            Number(source.issuedQty) + l.issuedQty > Number(source.requestedQty)
          )
            throw new Error("ISSUE_EXCEEDS_REQUEST");
        }
        const miNo = await number(tx, "MI"),
          mi = await tx.materialIssue.create({
            data: {
              miNo,
              mrId: mr.id,
              woId: mr.woId,
              status: "POSTED",
              warehouseUserId: actor(req),
              postedAt: new Date(),
              lines: { create: input.lines },
            },
          });
        await postStock(tx, {
          transactionNo: miNo,
          transactionType: "MATERIAL_ISSUE",
          referenceType: "MATERIAL_ISSUE",
          referenceId: mi.id,
          actorId: actor(req),
          idempotencyKey: input.idempotencyKey,
          lines: input.lines.map((l) => ({
            itemId: l.itemId,
            lotId: l.lotId,
            locationId: l.locationId,
            quantity: l.issuedQty,
            direction: "OUT",
          })),
        });
        for (const l of input.lines) {
          await tx.materialRequestLine.update({
            where: { id: l.mrLineId },
            data: { issuedQty: { increment: l.issuedQty } },
          });
          const source: any = lineMap.get(l.mrLineId);
          await tx.productionRequirement.update({
            where: { id: source.requirementId },
            data: { issuedQty: { increment: l.issuedQty } },
          });
        }
        const fresh = await tx.materialRequestLine.findMany({
            where: { mrId: mr.id },
          }),
          complete = fresh.every(
            (l: any) => Number(l.issuedQty) >= Number(l.requestedQty),
          );
        await tx.materialRequest.update({
          where: { id: mr.id },
          data: { status: complete ? "ISSUED" : "PARTIALLY_ISSUED" },
        });
        await tx.productionOrder.update({
          where: { id: mr.woId },
          data: { status: "IN_PRODUCTION" },
        });
        await log(tx, req, "POST_MATERIAL_ISSUE", "MaterialIssue", mi.id, miNo);
        return mi;
      }, iso);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);

operationRouter.post(
  "/production-results",
  requireCapability("production:execute"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
        .object({
          woId: z.string(),
          reportedQty: z.coerce.number().positive(),
          goodQty: z.coerce.number().nonnegative(),
          rejectQty: z.coerce.number().nonnegative(),
          fgLotNo: z.string().min(3),
          locationId: z.string(),
          rejects: z
            .array(
              z.object({
                reasonCode: z.string(),
                quantity: z.coerce.number().positive(),
                notes: z.string().optional(),
              }),
            )
            .default([]),
          idempotencyKey: z.string().min(8),
        })
        .parse(req.body);
      if (
        input.goodQty + input.rejectQty !== input.reportedQty ||
        input.rejects.reduce((n, r) => n + r.quantity, 0) !== input.rejectQty
      )
        throw new Error("RESULT_QUANTITY_MISMATCH");
      const result = await db.$transaction(async (tx: any) => {
        const wo = await tx.productionOrder.findUniqueOrThrow({
          where: { id: input.woId },
          include: { results: true },
        });
        if (!["RELEASED", "IN_PRODUCTION"].includes(wo.status))
          throw new Error("WO_NOT_EXECUTABLE");
        const total = wo.results
          .filter((r: any) => r.status === "POSTED")
          .reduce((n: number, r: any) => n + Number(r.reportedQty), 0);
        if (total + input.reportedQty > Number(wo.targetQty))
          throw new Error("RESULT_EXCEEDS_TARGET");
        const fgLot = await tx.lot.upsert({
            where: {
              itemId_lotNo: { itemId: wo.productId, lotNo: input.fgLotNo },
            },
            create: {
              itemId: wo.productId,
              lotNo: input.fgLotNo,
              sourceType: "PRODUCTION",
              manufacturedAt: new Date(),
            },
            update: {},
          }),
          prdNo = await number(tx, "PRD"),
          prd = await tx.productionResult.create({
            data: {
              prdNo,
              woId: wo.id,
              reportedQty: input.reportedQty,
              goodQty: input.goodQty,
              rejectQty: input.rejectQty,
              fgLotId: fgLot.id,
              status: "POSTED",
              postedAt: new Date(),
              rejects: { create: input.rejects },
            },
          });
        if (input.goodQty > 0)
          await postStock(tx, {
            transactionNo: prdNo,
            transactionType: "FG_RECEIPT",
            referenceType: "PRODUCTION_RESULT",
            referenceId: prd.id,
            actorId: actor(req),
            idempotencyKey: input.idempotencyKey,
            lines: [
              {
                itemId: wo.productId,
                lotId: fgLot.id,
                locationId: input.locationId,
                quantity: input.goodQty,
                direction: "IN",
              },
            ],
          });
        await tx.productionOrder.update({
          where: { id: wo.id },
          data: {
            status:
              total + input.reportedQty === Number(wo.targetQty)
                ? "COMPLETED"
                : "IN_PRODUCTION",
          },
        });
        await log(
          tx,
          req,
          "POST_PRODUCTION_RESULT",
          "ProductionResult",
          prd.id,
          prdNo,
        );
        return prd;
      }, iso);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);

operationRouter.get(
  "/traceability/:lotNo",
  requireCapability("traceability:read"),
  async (req, res, next) => {
    try {
      const lot = await db.lot.findFirst({
        where: { lotNo: req.params.lotNo },
        include: {
          item: true,
          ledgerEntries: {
            include: {
              location: true,
              actor: { select: { employeeId: true, name: true } },
            },
            orderBy: { occurredAt: "asc" },
          },
        },
      });
      if (!lot) return res.status(404).json({ message: "LOT not found" });
      const references = await db.stockLedger.findMany({
        where: {
          OR: [
            { lotId: lot.id },
            {
              referenceId: {
                in: lot.ledgerEntries.map((x: any) => x.referenceId),
              },
            },
          ],
        },
        include: { item: true, lot: true },
        orderBy: { occurredAt: "asc" },
      });
      res.json({ lot, references });
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.post(
  "/stock-opnames",
  requireCapability("opname:count"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z.object({ notes: z.string().optional() }).parse(req.body),
        result = await db.$transaction(async (tx: any) => {
          const balances = await tx.stockBalance.findMany({
              where: { onHandQty: { not: 0 } },
            }),
            stoNo = await number(tx, "STO"),
            sto = await tx.stockOpname.create({
              data: {
                stoNo,
                status: "DRAFT",
                snapshotAt: new Date(),
                countedBy: actor(req),
                notes: input.notes,
                lines: {
                  create: balances.map((b: any) => ({
                    itemId: b.itemId,
                    lotId: b.lotId,
                    locationId: b.locationId,
                    systemQty: b.onHandQty,
                  })),
                },
              },
            });
          await log(
            tx,
            req,
            "START_STOCK_OPNAME",
            "StockOpname",
            sto.id,
            stoNo,
          );
          return sto;
        }, iso);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.post(
  "/stock-opnames/:id/post",
  requireCapability("opname:post"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
          .object({
            counts: z
              .array(
                z.object({
                  lineId: z.string(),
                  actualQty: z.coerce.number().nonnegative(),
                }),
              )
              .min(1),
            idempotencyKey: z.string().min(8),
          })
          .parse(req.body),
        result = await db.$transaction(async (tx: any) => {
          const sto = await tx.stockOpname.findUniqueOrThrow({
            where: { id: req.params.id },
            include: { lines: true },
          });
          if (sto.status !== "DRAFT") throw new Error("OPNAME_ALREADY_POSTED");
          const counts = new Map(
              input.counts.map((x) => [x.lineId, x.actualQty]),
            ),
            changed = sto.lines.filter(
              (l: any) =>
                counts.has(l.id) &&
                Number(counts.get(l.id)) !== Number(l.systemQty),
            );
          const adjNo: string | undefined = changed.length
            ? await number(tx, "ADJ")
            : undefined;
          if (changed.length)
            await postStock(tx, {
              transactionNo: adjNo!,
              transactionType: "STOCK_OPNAME_ADJUSTMENT",
              referenceType: "STOCK_OPNAME",
              referenceId: sto.id,
              actorId: actor(req),
              idempotencyKey: input.idempotencyKey,
              lines: changed.map((l: any) => {
                const gap = Number(counts.get(l.id)) - Number(l.systemQty);
                return {
                  itemId: l.itemId,
                  lotId: l.lotId,
                  locationId: l.locationId,
                  quantity: Math.abs(gap),
                  direction: gap > 0 ? "IN" : "OUT",
                };
              }),
            });
          for (const l of sto.lines) {
            if (counts.has(l.id)) {
              const actual = Number(counts.get(l.id));
              await tx.stockOpnameLine.update({
                where: { id: l.id },
                data: {
                  actualQty: actual,
                  gapQty: actual - Number(l.systemQty),
                  adjustmentNo: actual !== Number(l.systemQty) ? adjNo : null,
                },
              });
            }
          }
          const posted = await tx.stockOpname.update({
            where: { id: sto.id },
            data: {
              status: "POSTED",
              postedAt: new Date(),
              postedBy: actor(req),
            },
          });
          await log(
            tx,
            req,
            "POST_STOCK_OPNAME",
            "StockOpname",
            sto.id,
            sto.stoNo,
            { adjustmentNo: adjNo },
          );
          return posted;
        }, iso);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.get(
  "/reports/summary",
  requireCapability("report:read"),
  async (_req, res, next) => {
    try {
      const [balances, ledger, results, opnames] = await Promise.all([
        db.stockBalance.aggregate({ _sum: { onHandQty: true } }),
        db.stockLedger.count(),
        db.productionResult.aggregate({
          where: { status: "POSTED" },
          _sum: { goodQty: true, rejectQty: true },
        }),
        db.stockOpname.count({ where: { status: "POSTED" } }),
      ]);
      res.json({
        stockOnHand: balances._sum.onHandQty || 0,
        ledgerEntries: ledger,
        goodQty: results._sum.goodQty || 0,
        rejectQty: results._sum.rejectQty || 0,
        postedOpnames: opnames,
      });
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.get(
  "/activity",
  requireCapability("report:read"),
  async (_req, res, next) => {
    try {
      res.json(
        await db.activityLog.findMany({
          include: {
            actor: { select: { employeeId: true, name: true, role: true } },
          },
          orderBy: { occurredAt: "desc" },
          take: 500,
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.post(
  "/transactions/:referenceType/:id/reverse",
  requireCapability("opname:post"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
          .object({
            reason: z.string().min(3).max(255),
            idempotencyKey: z.string().min(8),
          })
          .parse(req.body),
        result = await db.$transaction(async (tx: any) => {
          const source = await tx.stockLedger.findMany({
            where: {
              referenceType: String(req.params.referenceType),
              referenceId: String(req.params.id),
              reversalOfId: null,
            },
            orderBy: { lineNo: "asc" },
          });
          if (!source.length) throw new Error("POSTED_TRANSACTION_NOT_FOUND");
          if (
            await tx.stockLedger.count({
              where: { reversalOfId: { in: source.map((x: any) => x.id) } },
            })
          )
            throw new Error("TRANSACTION_ALREADY_REVERSED");
          const no = await number(tx, "REV");
          await postStock(tx, {
            transactionNo: no,
            transactionType: `REVERSAL_${source[0].transactionType}`,
            referenceType: "REVERSAL",
            referenceId: String(req.params.id),
            actorId: actor(req),
            idempotencyKey: input.idempotencyKey,
            lines: source.map((x: any) => ({
              itemId: x.itemId,
              lotId: x.lotId,
              locationId: x.locationId,
              quantity: Number(x.quantity),
              direction: x.direction === "IN" ? "OUT" : "IN",
              reversalOfId: x.id,
            })),
          });
          await log(
            tx,
            req,
            "REVERSE_TRANSACTION",
            "StockLedger",
            String(req.params.id),
            no,
            { reason: input.reason, original: source[0].transactionNo },
          );
          return { reversalNo: no, originalNo: source[0].transactionNo };
        }, iso);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.get(
  "/admin/users",
  requireCapability("admin:manage"),
  async (_req, res, next) => {
    try {
      res.json(
        await db.user.findMany({
          select: {
            id: true,
            employeeId: true,
            name: true,
            role: true,
            active: true,
            createdAt: true,
          },
          orderBy: { employeeId: "asc" },
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.post(
  "/admin/users",
  requireCapability("admin:manage"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
          .object({
            employeeId: z.string().min(3),
            name: z.string().min(2),
            role: z.enum([
              "PRODUCTION",
              "WAREHOUSE",
              "SUPERVISOR",
              "MANAGER",
              "ADMIN",
            ]),
            password: z.string().min(8),
            active: z.boolean().default(true),
          })
          .parse(req.body),
        user = await db.user.create({
          data: {
            employeeId: input.employeeId,
            name: input.name,
            role: input.role,
            active: input.active,
            passwordHash: await argon2.hash(input.password),
          },
        });
      await db.activityLog.create({
        data: {
          actorId: actor(req),
          action: "CREATE_USER",
          entityType: "User",
          entityId: user.id,
          referenceNo: user.employeeId,
        },
      });
      res.status(201).json({
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        active: user.active,
      });
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.get(
  "/admin/settings",
  requireCapability("admin:manage"),
  async (_req, res, next) => {
    try {
      res.json(
        await db.systemSetting.upsert({
          where: { id: "SYSTEM" },
          create: { id: "SYSTEM" },
          update: {},
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);
operationRouter.patch(
  "/admin/settings",
  requireCapability("admin:manage"),
  async (req: AuthRequest, res, next) => {
    try {
      const input = z
          .object({
            companyName: z.string().min(2).max(120).optional(),
            appName: z.string().min(2).max(120).optional(),
            logoUrl: z.string().url().nullable().optional(),
            language: z.string().max(8).optional(),
            theme: z.enum(["light", "dark"]).optional(),
          })
          .parse(req.body),
        result = await db.$transaction(async (tx: any) => {
          const setting = await tx.systemSetting.upsert({
            where: { id: "SYSTEM" },
            create: { id: "SYSTEM", ...input },
            update: input,
          });
          await log(
            tx,
            req,
            "UPDATE_SETTINGS",
            "SystemSetting",
            "SYSTEM",
            "SYSTEM",
          );
          return setting;
        }, iso);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);
