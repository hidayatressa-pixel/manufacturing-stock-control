import { Router } from "express";
import { z } from "zod";
import { authenticate,requireCapability } from "../auth.js";
import { prisma } from "../prisma.js";

const itemInput=z.object({sku:z.string().trim().min(2).max(40),name:z.string().trim().min(2).max(120),description:z.string().max(500).optional(),type:z.enum(["RAW_MATERIAL","WIP","FINISHED_GOODS"]),categoryId:z.string().optional(),uomId:z.string().min(1),minimumStock:z.coerce.number().nonnegative(),barcode:z.string().max(80).optional(),active:z.boolean().default(true)});
export const itemRouter=Router();
itemRouter.use(authenticate);
itemRouter.get("/",requireCapability("item:read"),async(_req,res,next)=>{try{res.json(await prisma.item.findMany({include:{uom:true,category:true},orderBy:{sku:"asc"}}));}catch(e){next(e)}});
itemRouter.post("/",requireCapability("item:write"),async(req,res,next)=>{try{const data=itemInput.parse(req.body);res.status(201).json(await prisma.item.create({data}));}catch(e){next(e)}});
itemRouter.patch("/:id",requireCapability("item:write"),async(req,res,next)=>{try{const data=itemInput.partial().parse(req.body);res.json(await prisma.item.update({where:{id:req.params.id},data}));}catch(e){next(e)}});
itemRouter.delete("/:id",requireCapability("item:write"),async(req,res,next)=>{try{const used=await prisma.stockLedger.count({where:{itemId:req.params.id}});if(used)return res.status(409).json({message:"Item has transaction history. Deactivate it instead."});await prisma.item.delete({where:{id:req.params.id}});res.status(204).end();}catch(e){next(e)}});
