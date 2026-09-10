import type{Role,View}from"./types";
const access:Record<Role,View[]>={
PPC:["dashboard","orders","boms","traceability","reports"],
WAREHOUSE:["dashboard","inventory","orders","requests","issues","traceability","opname"],
PRODUCTION:["dashboard","orders","requests","issues","results","traceability"],
DELIVERY:["dashboard","inventory","orders","results","traceability"],
SUPERVISOR:["dashboard","inventory","orders","requests","issues","results","traceability","opname","reports","audit"],
MANAGER:["dashboard","inventory","orders","requests","issues","results","traceability","opname","reports","audit"],
ADMIN:["dashboard","items","inventory","boms","orders","requests","issues","results","traceability","opname","reports","settings","audit"]};
export const canView=(role:Role,view:View)=>access[role].includes(view);
export const canManageItems=(role:Role)=>role==="ADMIN";
