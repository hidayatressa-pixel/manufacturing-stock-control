import { Router } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { config } from "../config.js";
import { getCapabilities, type Role } from "../auth.js";

const loginInput=z.object({employeeId:z.string().trim().min(2),password:z.string().min(4).max(128)});
export const authRouter=Router();
authRouter.post("/login",async(req,res,next)=>{try{
 const input=loginInput.parse(req.body);const user=await prisma.user.findUnique({where:{employeeId:input.employeeId}});
 if(!user||!user.active||!(await argon2.verify(user.passwordHash,input.password)))return res.status(401).json({message:"Invalid credentials"});
 const payload={id:user.id,name:user.name,role:user.role as Role};
 const accessToken=jwt.sign(payload,config.JWT_ACCESS_SECRET,{expiresIn:"15m"});
 await prisma.activityLog.create({data:{actorId:user.id,action:"LOGIN",entityType:"SESSION",referenceNo:user.employeeId}});
 res.json({accessToken,user:{...payload,employeeId:user.employeeId,capabilities:getCapabilities(payload.role)}});
 }catch(e){next(e)}});
