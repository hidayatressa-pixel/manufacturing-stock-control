import type{Item,Role}from"./types";
export const demoAccounts:{id:string;pin:string;name:string;role:Role}[]=[
{id:"PPC-1001",pin:"1122",name:"PPC Demo",role:"PPC"},
{id:"WH-2001",pin:"2345",name:"Warehouse Demo",role:"WAREHOUSE"},
{id:"PROD-1001",pin:"1234",name:"Production Demo",role:"PRODUCTION"},
{id:"DLV-5001",pin:"5678",name:"Delivery Demo",role:"DELIVERY"},
{id:"SPV-3001",pin:"3456",name:"Supervisor Demo",role:"SUPERVISOR"},
{id:"MGR-4001",pin:"4567",name:"Manager Demo",role:"MANAGER"},
{id:"admin01",pin:"8888",name:"System Administrator",role:"ADMIN"}];
export const initialItems:Item[]=[{id:"1",sku:"RM-ABS-001",name:"ABS Resin Black",type:"RAW MATERIAL",category:"Plastic Resin",uom:"KG",minimumStock:350,stock:1240,lots:3,active:true},{id:"2",sku:"RM-LED-014",name:"LED Module 12V",type:"RAW MATERIAL",category:"Electrical",uom:"PCS",minimumStock:300,stock:286,lots:2,active:true},{id:"3",sku:"RM-LENS-008",name:"Clear Lens Type B",type:"RAW MATERIAL",category:"Lens",uom:"PCS",minimumStock:120,stock:94,lots:1,active:true},{id:"4",sku:"WIP-HSG-002",name:"Rear Lamp Housing",type:"WIP",category:"Semi Finished",uom:"PCS",minimumStock:150,stock:418,lots:2,active:true},{id:"5",sku:"FG-RL-220",name:"Rear Combination Lamp",type:"FINISHED GOODS",category:"Rear Lamp",uom:"PCS",minimumStock:240,stock:672,lots:4,active:true}];
export const transactions=[];
export const orders=[];
