export type Role="PPC"|"WAREHOUSE"|"PRODUCTION"|"DELIVERY"|"SUPERVISOR"|"ADMIN";
export type Item={id:string;sku:string;name:string;type:"RAW MATERIAL"|"WIP"|"FINISHED GOODS";category:string;uom:string;minimumStock:number;stock:number;lots:number;active:boolean};
export type Session={id:string;name:string;role:Role};
export type View="dashboard"|"items"|"inventory"|"boms"|"orders"|"requests"|"issues"|"production"|"delivery"|"traceability"|"reports"|"settings"|"audit";