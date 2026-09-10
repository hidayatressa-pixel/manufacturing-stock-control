import type {Role,View} from "./types";
const access:Record<Role,View[]>={
 PPC:["dashboard","orders","traceability","reports"],
 WAREHOUSE:["dashboard","inventory","requests","issues","traceability"],
 PRODUCTION:["dashboard","production","orders","traceability"],
 DELIVERY:["dashboard","delivery","inventory","traceability"],
 SUPERVISOR:["dashboard","inventory","orders","requests","issues","production","delivery","traceability","reports","audit"],
 ADMIN:["dashboard","items","inventory","boms","orders","requests","issues","production","delivery","traceability","reports","settings","audit"]
};
export const canView=(role:Role,view:View)=>access[role].includes(view);
export const canManageItems=(role:Role)=>role==="ADMIN";
export const canCreatePO=(role:Role)=>role==="PPC"||role==="ADMIN";
export const canPrepareMaterial=(role:Role)=>role==="WAREHOUSE"||role==="ADMIN";
export const canRunProduction=(role:Role)=>role==="PRODUCTION"||role==="ADMIN";
export const canReceiveDelivery=(role:Role)=>role==="DELIVERY"||role==="ADMIN";