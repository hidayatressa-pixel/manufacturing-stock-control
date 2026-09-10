import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ZodError } from "zod";
import { config } from "./config.js";
import { itemRouter } from "./modules/items.js";

const app=express();app.use(helmet());app.use(cors({origin:config.WEB_ORIGIN,credentials:true}));app.use(express.json({limit:"1mb"}));
app.get("/api/health",(_req,res)=>res.json({status:"ok",mode:config.APP_MODE}));
app.use("/api/items",itemRouter);
app.use((err:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{if(err instanceof ZodError)return res.status(422).json({message:"Validation failed",issues:err.issues});console.error(err);res.status(500).json({message:"Unexpected server error"});});
app.listen(config.PORT,()=>console.log(`MSC API running on :${config.PORT} (${config.APP_MODE})`));
