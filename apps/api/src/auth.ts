import type { NextFunction,Request,Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

export type Role="PRODUCTION"|"WAREHOUSE"|"SUPERVISOR"|"MANAGER"|"ADMIN";
export type Capability="item:read"|"item:write"|"inventory:read"|"inventory:post"|"production:read"|"production:execute"|"material:request"|"material:issue"|"traceability:read"|"report:read"|"opname:count"|"opname:post"|"admin:manage";
const policy:Record<Role,Capability[]>={
 PRODUCTION:["item:read","inventory:read","production:read","production:execute","material:request","traceability:read"],
 WAREHOUSE:["item:read","inventory:read","inventory:post","production:read","material:issue","traceability:read","opname:count"],
 SUPERVISOR:["item:read","inventory:read","production:read","material:request","traceability:read","report:read","opname:count","opname:post"],
 MANAGER:["item:read","inventory:read","production:read","traceability:read","report:read","opname:post"],
 ADMIN:["item:read","item:write","inventory:read","inventory:post","production:read","production:execute","material:request","material:issue","traceability:read","report:read","opname:count","opname:post","admin:manage"]};
export interface AuthRequest extends Request{user?:{id:string;role:Role;name:string}}
export function authenticate(req:AuthRequest,res:Response,next:NextFunction){const token=req.headers.authorization?.replace(/^Bearer /,"");if(!token)return res.status(401).json({message:"Authentication required"});try{req.user=jwt.verify(token,config.JWT_ACCESS_SECRET) as AuthRequest["user"];next();}catch{return res.status(401).json({message:"Invalid or expired session"});}}
export const requireCapability=(capability:Capability)=>(req:AuthRequest,res:Response,next:NextFunction)=>{if(!req.user||!policy[req.user.role].includes(capability))return res.status(403).json({message:"Permission denied"});next();};
export const getCapabilities=(role:Role)=>policy[role];
