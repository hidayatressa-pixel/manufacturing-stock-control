export type ProductionRole='PPC'|'WAREHOUSE'|'PRODUCTION'|'DELIVERY'|'SUPERVISOR'|'MANAGER'|'ADMIN';
export type ProductionSession={token:string;user:{employeeId:string;role:ProductionRole}};
const SESSION_KEY='msc-production-session';

export const productionApiBase=()=>{
  const configured=(import.meta.env.VITE_API_URL as string|undefined)?.trim();
  return configured?.replace(/\/$/,'')||'http://localhost:4000/api';
};

export const loadProductionSession=():ProductionSession|null=>{
  try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null') as ProductionSession|null}catch{return null}
};
export const clearProductionSession=()=>sessionStorage.removeItem(SESSION_KEY);

async function request<T>(path:string,options:RequestInit={},session:ProductionSession|null=loadProductionSession()):Promise<T>{
  const headers=new Headers(options.headers);
  headers.set('Content-Type','application/json');
  if(session?.token)headers.set('Authorization',`Bearer ${session.token}`);
  const response=await fetch(`${productionApiBase()}${path}`,{...options,headers});
  const body=await response.json().catch(()=>({}));
  if(response.status===401)clearProductionSession();
  if(!response.ok)throw new Error(typeof body?.error==='string'?body.error:`API request failed (${response.status})`);
  return body as T;
}

export async function loginProduction(employeeId:string,password:string){
  const session=await request<ProductionSession>('/auth/login',{method:'POST',body:JSON.stringify({employeeId,password})},null);
  sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
  return session;
}

export const productionApi={
  health:()=>request<{ok:boolean;service:string;version:string}>('/health',{},null),
  items:()=>request<any[]>('/items'),
  inventory:()=>request<any[]>('/inventory'),
  ledger:()=>request<any[]>('/ledger'),
  audit:()=>request<any[]>('/audit'),
  orders:()=>request<any[]>('/production-orders'),
  createOrder:(data:{groupCode:string;productCode:string;target:number;productionDate:string;productionLot:string})=>request<any>('/production-orders',{method:'POST',body:JSON.stringify(data)}),
  releaseOrder:(number:string)=>request<any>(`/production-orders/${encodeURIComponent(number)}/release`,{method:'POST'}),
  createMaterialRequest:(number:string)=>request<any>(`/production-orders/${encodeURIComponent(number)}/material-request`,{method:'POST'}),
  postMaterialTransfer:(number:string,lots:{itemCode:string;lotCode:string}[])=>request<any>(`/production-orders/${encodeURIComponent(number)}/material-transfer`,{method:'POST',body:JSON.stringify({lots})}),
  receiveMaterial:(number:string)=>request<any>(`/production-orders/${encodeURIComponent(number)}/receive-material`,{method:'POST'}),
  postResult:(number:string,data:{good:number;reject:number;rejectReason?:string})=>request<any>(`/production-orders/${encodeURIComponent(number)}/result`,{method:'POST',body:JSON.stringify(data)}),
  receiveFinishedGoods:(number:string)=>request<any>(`/production-orders/${encodeURIComponent(number)}/receive-fg`,{method:'POST'})
};
