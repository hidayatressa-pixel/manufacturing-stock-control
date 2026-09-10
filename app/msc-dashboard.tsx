"use client";

import { useMemo, useState } from "react";
import { Boxes, LayoutDashboard, PackageSearch, ClipboardList, Factory, ArrowRightLeft, BadgeCheck, ScanLine, Scale, Settings, Search, Bell, Plus, ChevronRight, TrendingUp, TriangleAlert, Menu, X, Download, Filter, CircleDot } from "lucide-react";

type NavKey = "Dashboard"|"Item Master"|"Inventory"|"BOM"|"Production Orders"|"Material Issue"|"Production Result"|"LOT Traceability"|"Stock Opname & Reports"|"Settings & Users";
type Item = {sku:string;name:string;type:string;stock:string;uom:string;min:string;lots:number;status:string};
const nav:{label:NavKey;icon:typeof Boxes}[]=[
 {label:"Dashboard",icon:LayoutDashboard},{label:"Item Master",icon:Boxes},{label:"Inventory",icon:PackageSearch},{label:"BOM",icon:ClipboardList},{label:"Production Orders",icon:Factory},{label:"Material Issue",icon:ArrowRightLeft},{label:"Production Result",icon:BadgeCheck},{label:"LOT Traceability",icon:ScanLine},{label:"Stock Opname & Reports",icon:Scale},{label:"Settings & Users",icon:Settings}
];
const items:Item[]=[
 {sku:"RM-ABS-001",name:"ABS Resin Black",type:"RAW MATERIAL",stock:"1,240.00",uom:"KG",min:"350",lots:3,status:"Healthy"},
 {sku:"RM-LED-014",name:"LED Module 12V",type:"RAW MATERIAL",stock:"286",uom:"PCS",min:"300",lots:2,status:"Low"},
 {sku:"WIP-HSG-002",name:"Rear Lamp Housing",type:"WIP",stock:"418",uom:"PCS",min:"150",lots:2,status:"Healthy"},
 {sku:"FG-RL-220",name:"Rear Combination Lamp",type:"FINISHED GOODS",stock:"672",uom:"PCS",min:"240",lots:4,status:"Healthy"},
 {sku:"RM-LENS-008",name:"Clear Lens Type B",type:"RAW MATERIAL",stock:"94",uom:"PCS",min:"120",lots:1,status:"Critical"}
];
const tx=[
 ["MI-20260910-0004","MATERIAL ISSUE","RM-ABS-001","RM-260907-A","−48.00 KG","WO-20260910-0002","10:42","out"],
 ["PRD-20260910-0003","FG RECEIPT","FG-RL-220","FG-20260910-0003","+196 PCS","WO-20260910-0001","09:58","in"],
 ["RCV-20260910-0002","RECEIVING","RM-LED-014","LED-260910-B","+250 PCS","DN-883104","08:26","in"],
 ["ADJ-20260909-0001","ADJUSTMENT","RM-LENS-008","LNS-260828-A","−6 PCS","STO-20260909-0001","Yesterday","out"]
];
const pos=[
 {wo:"WO-20260910-0001",product:"Rear Combination Lamp",target:200,actual:196,status:"IN PRODUCTION",due:"Today · Shift 1"},
 {wo:"WO-20260910-0002",product:"Rear Lamp Housing",target:500,actual:280,status:"IN PRODUCTION",due:"Today · Shift 2"},
 {wo:"WO-20260911-0001",product:"Rear Combination Lamp",target:300,actual:0,status:"RELEASED",due:"Tomorrow"}
];
const copy:Record<NavKey,[string,string,string,string]>={
 Dashboard:["Factory overview","Good evening, Ressa","Stock position and production movement for 10 September 2026.","New transaction"],
 "Item Master":["Master data","Item Master","One controlled source for every material, WIP, and finished product.","Add item"],
 Inventory:["Warehouse control","Inventory","Current, available, and LOT-level stock—always backed by ledger transactions.","Receive stock"],
 BOM:["Product structure","Bill of Materials","Versioned material standards used to calculate production requirements.","Create BOM"],
 "Production Orders":["Production control","Production Orders","Release work, calculate requirements, and monitor output against target.","New production order"],
 "Material Issue":["Warehouse to production","Material Request & Issue","Issue the right material and LOT against a released production order.","Create material issue"],
 "Production Result":["Shop-floor reporting","Production Result","Post good and reject output, then generate a traceable finished-goods LOT.","Report result"],
 "LOT Traceability":["Genealogy","LOT Traceability","Trace backward from finished goods or forward from incoming material.","Scan LOT"],
 "Stock Opname & Reports":["Inventory assurance","Stock Opname & Reports","Compare physical and system stock without overwriting ledger history.","Start stock opname"],
 "Settings & Users":["Administration","Settings & Users","Company profile, transaction numbering, roles, and basic permissions.","Add user"]
};

export function MSCDashboard(){
 const [active,setActive]=useState<NavKey>("Dashboard"),[menu,setMenu]=useState(false),[query,setQuery]=useState("");
 const visible=useMemo(()=>items.filter(i=>`${i.sku} ${i.name} ${i.type}`.toLowerCase().includes(query.toLowerCase())),[query]); const c=copy[active];
 return <div className="msc-shell"><aside className={menu?"sidebar open":"sidebar"}>
  <div className="brand"><div className="brand-mark"><Boxes size={21}/></div><div><b>MSC</b><span>Stock Control</span></div><button className="mobile-close" onClick={()=>setMenu(false)}><X/></button></div>
  <div className="site-pill"><span className="pulse"/><div><b>Astra Demo Plant</b><span>Karawang · Plant 01</span></div></div>
  <nav>{nav.map(({label,icon:Icon})=><button key={label} className={active===label?"nav-item active":"nav-item"} onClick={()=>{setActive(label);setMenu(false)}}><Icon size={18}/><span>{label}</span>{active===label&&<ChevronRight size={15}/>}</button>)}</nav>
  <div className="sidebar-foot"><div className="avatar">RH</div><div><b>Ressa Hidayat</b><span>Administrator</span></div><button>•••</button></div>
 </aside><main><header><button className="menu" onClick={()=>setMenu(true)}><Menu/></button><div className="global-search"><Search size={17}/><input placeholder="Search item, LOT, or transaction…"/></div><button className="icon-btn"><Bell size={19}/><i/></button><div className="live"><span/>System live</div></header>
 <div className="content"><div className="page-head"><div><span className="eyebrow">{c[0]}</span><h1>{c[1]}</h1><p>{c[2]}</p></div><button className="primary"><Plus size={18}/>{c[3]}</button></div>
 {active==="Dashboard"?<Dashboard/>:active==="LOT Traceability"?<Traceability/>:active==="Production Orders"?<ProductionOrders/>:<ModuleTable items={visible} query={query} setQuery={setQuery}/>}</div></main></div>
}

function Dashboard(){return <><section className="kpi-grid"><Kpi label="Raw Material" value="Rp 428.6M" meta="38 active SKUs" icon={Boxes}/><Kpi label="WIP Stock" value="1,284 PCS" meta="Across 6 LOTs" icon={Factory}/><Kpi label="Finished Goods" value="2,436 PCS" meta="12 ready LOTs" icon={PackageSearch}/><Kpi label="Production today" value="476 PCS" meta="96.4% good output" icon={TrendingUp} accent/></section>
 <section className="dashboard-grid"><div className="panel production-panel"><PanelTitle title="Production pulse" note="Target vs actual · today" action="View orders"/><div className="production-score"><div><strong>476</strong><span>/ 700 PCS target</span></div><b>68%</b></div><div className="bar"><i style={{width:"68%"}}/></div><div className="shift-bars"><div><span>Good quantity</span><b>459</b><i style={{width:"96%"}}/></div><div><span>Reject quantity</span><b>17</b><i className="reject" style={{width:"18%"}}/></div></div><div className="yield"><div><span>GOOD RATE</span><b>96.4%</b></div><div><span>REJECT RATE</span><b>3.6%</b></div><div><span>OPEN ORDERS</span><b>03</b></div></div></div>
 <div className="panel alerts"><PanelTitle title="Needs attention" note="2 stock risks"/><div className="alert-row"><TriangleAlert/><div><b>RM-LENS-008</b><span>26 PCS below minimum stock</span></div><em>Critical</em></div><div className="alert-row amber"><CircleDot/><div><b>RM-LED-014</b><span>14 PCS below minimum stock</span></div><em>Low</em></div><button className="ghost-wide">Review low-stock items <ChevronRight size={16}/></button></div></section>
 <section className="panel"><PanelTitle title="Recent stock transactions" note="Every movement is ledger-backed" action="Open ledger"/><TransactionTable/></section></>}
function Kpi({label,value,meta,icon:Icon,accent=false}:{label:string;value:string;meta:string;icon:typeof Boxes;accent?:boolean}){return <div className={accent?"kpi accent":"kpi"}><div className="kpi-top"><span>{label}</span><i><Icon size={18}/></i></div><strong>{value}</strong><small>{meta}</small></div>}
function PanelTitle({title,note,action}:{title:string;note:string;action?:string}){return <div className="panel-title"><div><h2>{title}</h2><p>{note}</p></div>{action&&<button>{action}<ChevronRight size={15}/></button>}</div>}
function TransactionTable(){return <div className="table-wrap"><table><thead><tr><th>Transaction</th><th>Type</th><th>Item / LOT</th><th>Quantity</th><th>Reference</th><th>Time</th></tr></thead><tbody>{tx.map(t=><tr key={t[0]}><td><b className="mono">{t[0]}</b></td><td><span className="type-tag">{t[1]}</span></td><td><b>{t[2]}</b><small>{t[3]}</small></td><td><b className={t[7]}>{t[4]}</b></td><td className="mono">{t[5]}</td><td>{t[6]}</td></tr>)}</tbody></table></div>}
function ModuleTable({items,query,setQuery}:{items:Item[];query:string;setQuery:(s:string)=>void}){return <section className="panel module-panel"><div className="toolbar"><div className="table-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search records…"/></div><button className="secondary"><Filter size={16}/>Filter</button><button className="secondary"><Download size={16}/>Export</button></div><div className="table-wrap"><table><thead><tr><th>SKU / Record</th><th>Description</th><th>Type</th><th>Current stock</th><th>LOTs</th><th>Status</th><th/></tr></thead><tbody>{items.map(i=><tr key={i.sku}><td><b className="mono">{i.sku}</b></td><td><b>{i.name}</b><small>Updated 10 Sep 2026</small></td><td><span className="type-tag">{i.type}</span></td><td><b>{i.stock}</b> <small className="inline">{i.uom}</small></td><td>{i.lots}</td><td><span className={`status ${i.status.toLowerCase()}`}>{i.status}</span></td><td><button className="row-action">•••</button></td></tr>)}</tbody></table></div><div className="table-foot"><span>Showing {items.length} records</span><div><button disabled>Previous</button><button>Next</button></div></div></section>}
function ProductionOrders(){return <section className="orders">{pos.map(p=><article className="order-card" key={p.wo}><div className="order-top"><span className="type-tag">{p.status}</span><small>{p.due}</small></div><b className="mono order-no">{p.wo}</b><h3>{p.product}</h3><div className="order-data"><div><span>Target</span><b>{p.target} PCS</b></div><div><span>Reported</span><b>{p.actual} PCS</b></div><div><span>Progress</span><b>{Math.round(p.actual/p.target*100)}%</b></div></div><div className="bar"><i style={{width:`${p.actual/p.target*100}%`}}/></div><button className="ghost-wide">Open production order <ChevronRight size={16}/></button></article>)}</section>}
function Traceability(){return <section className="trace-grid"><div className="panel trace-search"><span className="eyebrow">Search genealogy</span><h2>Follow any LOT end to end</h2><div className="trace-input"><ScanLine/><input defaultValue="FG-20260910-0003"/><button>Trace</button></div><p>Search by raw material LOT or finished-goods LOT.</p></div><div className="panel trace-result"><PanelTitle title="Trace result" note="FG-20260910-0003 · 196 PCS"/><div className="trace-flow"><TraceNode tag="RAW MATERIAL LOT" title="RM-260907-A" meta="ABS Resin · 48 KG"/><ChevronRight/><TraceNode tag="MATERIAL ISSUE" title="MI-20260910-0004" meta="10 Sep · 08:42"/><ChevronRight/><TraceNode tag="PRODUCTION ORDER" title="WO-20260910-0001" meta="Rear Combination Lamp"/><ChevronRight/><TraceNode tag="FINISHED GOODS LOT" title="FG-20260910-0003" meta="196 PCS · Released" accent/></div></div></section>}
function TraceNode({tag,title,meta,accent=false}:{tag:string;title:string;meta:string;accent?:boolean}){return <div className={accent?"trace-node accent":"trace-node"}><span>{tag}</span><b className="mono">{title}</b><small>{meta}</small></div>}
