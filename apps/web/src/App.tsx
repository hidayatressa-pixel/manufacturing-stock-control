import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownUp,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Database,
  Factory,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  PackageSearch,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { Login } from "./components/Login";
import { ItemModal } from "./components/ItemModal";
import {
  ReportModule,
} from "./components/OperationalModule";
import {LinkedModule,LinkedOrders,LinkedReport} from "./components/LinkedModules";
import {useDemoDatabase} from "./demoDatabase";
import { initialItems, orders, transactions } from "./demo";
import { canManageItems, canView } from "./permissions";
import type { Item, Session, View } from "./types";

const navigation: {
  section: string;
  items: { id: View; label: string; icon: typeof Boxes }[];
}[] = [
  {
    section: "OVERVIEW",
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    section: "STOCK CONTROL",
    items: [
      { id: "items", label: "Item Master", icon: Boxes },
      { id: "inventory", label: "Inventory", icon: PackageSearch },
      { id: "boms", label: "Bill of Materials", icon: ClipboardList },
    ],
  },
  {
    section: "PRODUCTION",
    items: [
      { id: "orders", label: "Production Orders", icon: Factory },
      { id: "requests", label: "Material Requests", icon: ClipboardCheck },
      { id: "issues", label: "Material Issues", icon: ArrowDownUp },
      { id: "results", label: "Production Results", icon: PackageCheck },
    ],
  },
  {
    section: "ASSURANCE",
    items: [
      { id: "traceability", label: "LOT Traceability", icon: Activity },
      { id: "opname", label: "Stock Opname", icon: ClipboardList },
      { id: "reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { id: "settings", label: "Configuration", icon: Settings },
      { id: "audit", label: "Activity Logs", icon: FileClock },
    ],
  },
];
const title: Record<View, [string, string]> = {
  dashboard: [
    "Operational Dashboard",
    "Live manufacturing stock and production position.",
  ],
  items: ["Item Master", "Controlled material and product definitions."],
  inventory: [
    "Inventory",
    "Current stock derived from posted ledger transactions.",
  ],
  boms: ["Bill of Materials", "Versioned component standards for production."],
  orders: [
    "Production Orders",
    "Release work and track output against target.",
  ],
  requests: [
    "Material Requests",
    "Required, requested, issued, and remaining quantities.",
  ],
  issues: [
    "Material Issues",
    "Warehouse LOT issue against released production orders.",
  ],
  results: [
    "Production Results",
    "GOOD, REJECT, and finished-goods LOT posting.",
  ],
  traceability: [
    "LOT Traceability",
    "Follow material genealogy forward or backward.",
  ],
  opname: [
    "Stock Opname",
    "Physical reconciliation with controlled adjustments.",
  ],
  reports: ["Reports", "Operational records with transaction-level filters."],
  settings: [
    "System Configuration",
    "Company, users, branding, numbering, and setup.",
  ],
  audit: [
    "Activity Logs",
    "Who changed what, when, and against which reference.",
  ],
};

export default function App() {
  const {db,saveItem}=useDemoDatabase();
  const [session, setSession] = useState<Session | null>(null),
    [view, setView] = useState<View>("dashboard"),
    [mobile, setMobile] = useState(false),
    [edit, setEdit] = useState<Item | null | undefined>(undefined),
    [toast, setToast] = useState("");
  if (!session) return <Login onLogin={setSession} />;
  const go = (v: View) => {
    setView(v);
    setMobile(false);
  };
  const allowed = navigation
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => canView(session.role, i.id)),
    }))
    .filter((g) => g.items.length);
  return (
    <div className="shell">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <span>
            <Boxes />
          </span>
          <div>
            <b>MSC</b>
            <small>MINI ERP</small>
          </div>
          <button className="close" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <div className="plant">
          <i />
          <div>
            <b>Astra Demo Plant</b>
            <small>DEMO DATABASE</small>
          </div>
        </div>
        <nav>
          {allowed.map((g) => (
            <div key={g.section}>
              <label>{g.section}</label>
              {g.items.map((i) => (
                <button
                  key={i.id}
                  className={view === i.id ? "active" : ""}
                  onClick={() => go(i.id)}
                >
                  <i.icon />
                  <span>{i.label}</span>
                  {view === i.id && <ChevronRight />}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="profile">
          <div>
            {session.name
              .split(" ")
              .map((x) => x[0])
              .join("")
              .slice(0, 2)}
          </div>
          <span>
            <b>{session.name}</b>
            <small>{session.role}</small>
          </span>
          <button onClick={() => setSession(null)} title="Logout">
            <LogOut />
          </button>
        </div>
      </aside>
      <main>
        <header>
          <button className="menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div className="search">
            <Search />
            <input placeholder="Search transaction, item, LOT, or WO…" />
          </div>
          <span className="mode">
            <i />
            DEMO MODE
          </span>
          <button className="logout-mobile" onClick={() => setSession(null)}>
            <LogOut />
          </button>
        </header>
        <div className="content">
          <div className="page-head">
            <div>
              <span className="eyebrow">{session.role} WORKSPACE</span>
              <h1>{title[view][0]}</h1>
              <p>{title[view][1]}</p>
            </div>
            {view === "items" && canManageItems(session.role) && (
              <button className="primary" onClick={() => setEdit(null)}>
                <Plus />
                New item
              </button>
            )}
          </div>
          {view === "dashboard" ? (
            <Dashboard session={session} items={db.items} go={go} />
          ) : view === "items" ? (
            <Items
              items={db.items}
              query=""
              onEdit={setEdit}
              canEdit={canManageItems(session.role)}
            />
          ) : view === "traceability" ? (
            <Traceability />
          ) : view === "orders" ? (
            <LinkedOrders role={session.role} go={go} onNotify={setToast} />
          ) : view === "settings" ? (
            <SettingsView />
          ) : view === "reports" ? (
            <LinkedReport onNotify={setToast} />
          ) : (
            <LinkedModule
              view={view}
              role={session.role}
              onNotify={setToast}
            />
          )}
        </div>
      </main>
      {edit !== undefined && (
        <ItemModal
          item={edit}
          onClose={() => setEdit(undefined)}
          onSave={(d) => {
            saveItem(edit?{...edit,...d}:{...d,id:crypto.randomUUID(),stock:0,lots:0});
            setEdit(undefined);
            setToast(edit ? "Item updated" : "Item created");
          }}
        />
      )}
      {toast && (
        <div className="toast" onAnimationEnd={() => setToast("")}>
          <CheckCircle2 />
          {toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({
  session,
  items,
  go,
}: {
  session: Session;
  items: Item[];
  go: (v: View) => void;
}) {
  const low = items.filter((i) => i.stock < i.minimumStock);
  const cards =
    session.role === "PRODUCTION"
      ? [
          ["Production today", "476 PCS", "96.4% good"],
          ["Released orders", "03", "2 in production"],
          ["GOOD quantity", "459 PCS", "Today"],
          ["REJECT quantity", "17 PCS", "3.6% reject"],
        ]
      : session.role === "WAREHOUSE"
        ? [
            ["Raw Material", "1,620 KG", "38 active SKUs"],
            ["Pending requests", "04", "2 partial issues"],
            ["Low stock", String(low.length), "Needs attention"],
            ["Issues today", "648 PCS", "4 transactions"],
          ]
        : [
            ["Raw Material", "Rp 428.6M", "38 active SKUs"],
            ["WIP stock", "1,284 PCS", "6 active LOTs"],
            ["Finished Goods", "2,436 PCS", "12 ready LOTs"],
            ["Production today", "476 PCS", "96.4% good"],
          ];
  return (
    <>
      <section className="kpis">
        {cards.map((c, i) => (
          <article className={i === 3 ? "accent" : ""} key={c[0]}>
            <span>
              {c[0]}
              <i>
                {i === 0 ? (
                  <Boxes />
                ) : i === 1 ? (
                  <Factory />
                ) : i === 2 ? (
                  <TriangleAlert />
                ) : (
                  <BarChart3 />
                )}
              </i>
            </span>
            <b>{c[1]}</b>
            <small>{c[2]}</small>
          </article>
        ))}
      </section>
      <section className="dash-grid">
        <article className="panel production">
          <PanelHead
            title="Production pulse"
            note="Target versus actual · today"
          />
          <div className="big-number">
            <b>476</b>
            <span>/ 700 PCS target</span>
            <em>68%</em>
          </div>
          <Progress value={68} />
          <div className="stats">
            <span>
              GOOD RATE<b>96.4%</b>
            </span>
            <span>
              REJECT RATE<b>3.6%</b>
            </span>
            <span>
              OPEN ORDERS<b>03</b>
            </span>
          </div>
        </article>
        <article className="panel attention">
          <PanelHead
            title="Needs attention"
            note={`${low.length} stock risks`}
          />
          {low.map((i) => (
            <button key={i.id} onClick={() => go("inventory")}>
              <TriangleAlert />
              <span>
                <b>{i.sku}</b>
                <small>
                  {i.minimumStock - i.stock} {i.uom} below minimum
                </small>
              </span>
              <em>{i.stock / i.minimumStock < 0.85 ? "Critical" : "Low"}</em>
            </button>
          ))}
        </article>
      </section>
      <article className="panel">
        <PanelHead
          title="Recent stock transactions"
          note="Every movement is ledger-backed"
        />
        <TransactionTable />
      </article>
    </>
  );
}
function PanelHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="panel-head">
      <div>
        <h2>{title}</h2>
        <p>{note}</p>
      </div>
      <button>
        View all <ChevronRight />
      </button>
    </div>
  );
}
function Progress({ value }: { value: number }) {
  return (
    <div className="progress">
      <i style={{ width: `${value}%` }} />
    </div>
  );
}
function TransactionTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Type</th>
            <th>Item / LOT</th>
            <th>Quantity</th>
            <th>Reference</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.no}>
              <td>
                <b className="mono">{t.no}</b>
              </td>
              <td>
                <Tag>{t.type}</Tag>
              </td>
              <td>
                <b>{t.item}</b>
                <small>{t.lot}</small>
              </td>
              <td>
                <b className={t.tone}>{t.qty}</b>
              </td>
              <td className="mono">{t.ref}</td>
              <td>{t.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Items({
  items,
  onEdit,
  canEdit,
}: {
  items: Item[];
  query: string;
  onEdit: (i: Item) => void;
  canEdit: boolean;
}) {
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      items.filter((i) =>
        `${i.sku} ${i.name} ${i.category}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [items, q],
  );
  return (
    <article className="panel">
      <div className="toolbar">
        <div className="table-search">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search SKU, item, category…"
          />
        </div>
        <button className="secondary">Download template</button>
        <button className="secondary">Import CSV</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Type</th>
              <th>Current Stock</th>
              <th>Minimum</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id}>
                <td>
                  <b className="mono teal">{i.sku}</b>
                </td>
                <td>
                  <b>{i.name}</b>
                  <small>{i.category}</small>
                </td>
                <td>
                  <Tag>{i.type}</Tag>
                </td>
                <td>
                  <b>
                    {i.stock.toLocaleString()} {i.uom}
                  </b>
                  <small>{i.lots} LOTs</small>
                </td>
                <td>
                  {i.minimumStock.toLocaleString()} {i.uom}
                </td>
                <td>
                  <span
                    className={
                      i.stock < i.minimumStock ? "status low" : "status healthy"
                    }
                  >
                    {i.stock < i.minimumStock ? "Low stock" : "Healthy"}
                  </span>
                </td>
                <td>
                  {canEdit && (
                    <button className="text-button" onClick={() => onEdit(i)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="table-footer">
        {list.length} of {items.length} items
      </footer>
    </article>
  );
}
function Orders({role,go,onNotify}:{role:Session["role"];go:(view:View)=>void;onNotify:(text:string)=>void}) {
  const [selected,setSelected]=useState<(typeof orders)[number]|null>(null);
  const requirements=(order:(typeof orders)[number])=>order.product.includes("Housing")
    ? [{sku:"RM-ABS-001",name:"ABS Resin Black",required:120,issued:48,uom:"KG",lot:"RM-260907-A"}]
    : [{sku:"RM-ABS-001",name:"ABS Resin Black",required:order.target*.24,issued:order.actual*.24,uom:"KG",lot:"RM-260907-A"},{sku:"RM-LED-014",name:"LED Module 12V",required:order.target,issued:order.actual,uom:"PCS",lot:"LED-260911-B"},{sku:"RM-LENS-008",name:"Clear Lens Type B",required:order.target,issued:order.actual,uom:"PCS",lot:"LNS-260828-A"}];
  const openModule=(view:View,message:string)=>{setSelected(null);go(view);onNotify(message)};
  return (
    <><section className="order-grid">
      {orders.map((o) => (
        <article className="order" key={o.no}>
          <div>
            <Tag>{o.status}</Tag>
            <small>{o.due}</small>
          </div>
          <b className="mono teal">{o.no}</b>
          <h2>{o.product}</h2>
          <section>
            <span>
              Target<b>{o.target} PCS</b>
            </span>
            <span>
              Actual<b>{o.actual} PCS</b>
            </span>
            <span>
              Materials<b>{o.materials}</b>
            </span>
          </section>
          <Progress value={(o.actual / o.target) * 100} />
          <button onClick={()=>setSelected(o)}>
            Open production order <ChevronRight />
          </button>
        </article>
      ))}
    </section>{selected&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><article className="wo-dialog" role="dialog" aria-modal="true" aria-labelledby="wo-title"><div className="wo-head"><div><span className="eyebrow">PRODUCTION ORDER DETAIL</span><h2 id="wo-title" className="mono">{selected.no}</h2><p>{selected.product} · {selected.due}</p></div><button aria-label="Close production order" onClick={()=>setSelected(null)}><X/></button></div><section className="wo-summary"><div><small>STATUS</small><Tag>{selected.status}</Tag></div><div><small>TARGET</small><b>{selected.target} PCS</b></div><div><small>ACTUAL</small><b>{selected.actual} PCS</b></div><div><small>REMAINING</small><b>{selected.target-selected.actual} PCS</b></div></section><div className="wo-progress"><span>Production achievement <b>{Math.round(selected.actual/selected.target*100)}%</b></span><Progress value={selected.actual/selected.target*100}/></div><section className="wo-section"><div className="wo-section-title"><div><h3>Material requirements</h3><p>BOM requirement compared with posted material issues.</p></div><span className={`status ${selected.materials==="Complete"?"healthy":"low"}`}>{selected.materials}</span></div><div className="table-wrap"><table className="wo-table"><thead><tr><th>ITEM</th><th>REQUIRED</th><th>ISSUED</th><th>REMAINING</th><th>LOT</th></tr></thead><tbody>{requirements(selected).map(r=><tr key={r.sku}><td><b className="mono teal">{r.sku}</b><small>{r.name}</small></td><td>{r.required.toLocaleString()} {r.uom}</td><td>{r.issued.toLocaleString()} {r.uom}</td><td><b className={r.required-r.issued>0?"out":"in"}>{(r.required-r.issued).toLocaleString()} {r.uom}</b></td><td className="mono">{r.issued?r.lot:"—"}</td></tr>)}</tbody></table></div></section><section className="wo-section result-strip"><div><small>LATEST RESULT</small><b>{selected.actual?`PRD-${selected.no.slice(3)} · ${selected.actual} GOOD`:`No production result posted`}</b></div><div><small>MATERIAL STATUS</small><b>{selected.materials}</b></div></section><footer className="wo-actions"><button className="secondary" onClick={()=>setSelected(null)}>Close</button>{["PRODUCTION","SUPERVISOR","ADMIN"].includes(role)&&selected.materials!=="Complete"&&<button className="secondary" onClick={()=>openModule("requests",`Material request untuk ${selected.no}`)}><ClipboardCheck/>Request material</button>}{["WAREHOUSE","ADMIN"].includes(role)&&selected.materials!=="Complete"&&<button className="secondary" onClick={()=>openModule("issues",`Material issue untuk ${selected.no}`)}><ArrowDownUp/>Issue material</button>}{["PRODUCTION","ADMIN"].includes(role)&&selected.actual<selected.target&&<button className="primary" onClick={()=>openModule("results",`Production result untuk ${selected.no}`)}><PackageCheck/>Record result</button>}</footer></article></div>}</>
  );
}
function Traceability() {
  const {db}=useDemoDatabase();
  const [lotQuery,setLotQuery]=useState("FG-20260911-0003");
  const [searched,setSearched]=useState("FG-20260911-0003");
  const found=db.lots.find(l=>l.lotNo.toLowerCase()===searched.toLowerCase());
  const result=found?db.results.find(r=>r.fgLotId===found.id):undefined;
  const linkedWo=result?db.orders.find(w=>w.id===result.woId):undefined;
  const linkedIssues=linkedWo?db.issues.filter(i=>i.woId===linkedWo.id):db.issues.filter(i=>i.lines.some(x=>x.lotId===found?.id));
  return (
    <section className="trace">
      <article className="panel trace-search">
        <span className="eyebrow">GENEALOGY SEARCH</span>
        <h2>Follow any LOT end to end</h2>
        <div>
          <Activity />
          <input value={lotQuery} onChange={e=>setLotQuery(e.target.value)} />
          <button onClick={()=>setSearched(lotQuery.trim())}>Trace LOT</button>
        </div>
        <p>Search a raw-material or finished-goods LOT.</p>
      </article>
      <article className="panel">
        <PanelHead title="Transaction genealogy" note={found?`${found.lotNo} · ${found.qty} ${db.items.find(i=>i.id===found.itemId)?.uom}`:"LOT not found"}/>
        {found?<div className="flow">
          <Node type={found.itemId===linkedWo?.productId?"FINISHED GOODS LOT":"MATERIAL LOT"} no={found.lotNo} detail={`${db.items.find(i=>i.id===found.itemId)?.name} · ${found.source}`} active/>
          <ChevronRight/><Node type="MATERIAL ISSUE" no={linkedIssues.map(i=>i.no).join(", ")||"No material issue"} detail={`${linkedIssues.flatMap(i=>i.lines).length} linked issue lines`}/>
          <ChevronRight/><Node type="PRODUCTION ORDER" no={linkedWo?.no||db.orders.find(w=>linkedIssues.some(i=>i.woId===w.id))?.no||"No linked WO"} detail={linkedWo?db.items.find(i=>i.id===linkedWo.productId)?.name||"":"Forward material usage"}/>
          <ChevronRight/><Node type="PRODUCTION RESULT" no={result?.no||"Pending / forward trace"} detail={result?`GOOD ${result.good} · REJECT ${result.reject}`:"No FG result linked"}/>
        </div>:<div className="empty-trace">No LOT matches <b className="mono">{searched}</b>. Use a LOT number shown in Inventory.</div>}
      </article>
    </section>
  );
}
function Node({
  type,
  no,
  detail,
  active,
}: {
  type: string;
  no: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className={active ? "node active" : "node"}>
      <span>{type}</span>
      <b className="mono">{no}</b>
      <small>{detail}</small>
    </div>
  );
}
const generic: Record<
  string,
  { icon: typeof Boxes; title: string; body: string; columns: string[] }
> = {
  inventory: {
    icon: Database,
    title: "Inventory control",
    body: "Stock is derived from ledger entries by item, LOT, and location. Direct quantity editing is unavailable.",
    columns: [
      "Current stock",
      "Available stock",
      "Stock by LOT",
      "Movement history",
    ],
  },
  boms: {
    icon: ClipboardList,
    title: "BOM administration",
    body: "Active BOM versions calculate material requirements when a Production Order is released.",
    columns: ["Parent item", "Version", "Standard output", "Components"],
  },
  requests: {
    icon: ClipboardCheck,
    title: "Material request workflow",
    body: "Required, requested, issued, and remaining quantities stay linked to a released WO.",
    columns: ["MR number", "WO reference", "Requested", "Remaining"],
  },
  issues: {
    icon: ArrowDownUp,
    title: "Warehouse material issue",
    body: "Posting selects an RM LOT, prevents negative stock, and creates an immutable OUT entry.",
    columns: ["MI number", "RM LOT", "Issue quantity", "Posted by"],
  },
  results: {
    icon: PackageCheck,
    title: "Production result posting",
    body: "GOOD creates FG stock and an FG LOT. REJECT is recorded but never increases usable stock.",
    columns: ["PRD number", "GOOD", "REJECT", "FG LOT"],
  },
  opname: {
    icon: ClipboardList,
    title: "Physical stock reconciliation",
    body: "System quantity is frozen, actual is counted, and the GAP posts through a referenced ADJ transaction.",
    columns: ["STO number", "System", "Actual", "GAP"],
  },
  reports: {
    icon: BarChart3,
    title: "Operational reporting",
    body: "Filter transactions by date, item, LOT, WO, user, type, and status before export.",
    columns: ["Stock movement", "Consumption", "GOOD vs REJECT", "Variance"],
  },
  audit: {
    icon: FileClock,
    title: "Append-oriented audit history",
    body: "Operational users cannot erase WHO, WHAT, WHEN, or REFERENCE history.",
    columns: ["Actor", "Action", "Reference", "Timestamp"],
  },
};
function GenericView({ view }: { view: View }) {
  const g = generic[view];
  if (!g) return null;
  const Icon = g.icon;
  return (
    <article className="panel empty-module">
      <div className="module-icon">
        <Icon />
      </div>
      <span className="eyebrow">FUNCTIONAL STRUCTURE</span>
      <h2>{g.title}</h2>
      <p>{g.body}</p>
      <div className="module-cols">
        {g.columns.map((c) => (
          <span key={c}>
            <CheckCircle2 />
            {c}
          </span>
        ))}
      </div>
      <div className="implementation-state">
        <i />
        Workflow shell ready · transaction service implementation follows by
        milestone
      </div>
    </article>
  );
}
function SettingsView() {
  const {reset}=useDemoDatabase();
  return (
    <section className="settings-grid">
      <article className="panel">
        <div className="setting-title">
          <ShieldCheck />
          <span>
            <h2>Authority separation</h2>
            <p>
              Manager is operational authority. Admin owns system configuration.
            </p>
          </span>
        </div>
        <div className="roles">
          {["PRODUCTION", "WAREHOUSE", "SUPERVISOR", "MANAGER", "ADMIN"].map(
            (r) => (
              <span key={r}>
                {r}
                <b>{r === "ADMIN" ? "System" : "Operational"}</b>
              </span>
            ),
          )}
        </div>
      </article>
      <article className="panel">
        <div className="setting-title">
          <Database />
          <span>
            <h2>Database setup</h2>
            <p>Credentials remain server-side.</p>
          </span>
        </div>
        <dl>
          <dt>Application mode</dt>
          <dd>
            <Tag>DEMO</Tag>
          </dd>
          <dt>Demo database</dt>
          <dd>Configured</dd>
          <dt>Production database</dt>
          <dd>Configured by server .env</dd>
          <dt>Migration status</dt>
          <dd>Schema ready</dd>
        </dl>
      </article>
      <article className="panel">
        <div className="setting-title">
          <Users />
          <span>
            <h2>Users & roles</h2>
            <p>Five isolated demo identities.</p>
          </span>
        </div>
        <button
          className="secondary"
          onClick={() =>
            alert(
              "Production user management is available through the authenticated Admin API.",
            )
          }
        >
          <Plus />
          Create production user
        </button>
      </article>
      <article className="panel danger">
        <div className="setting-title">
          <RefreshCcw />
          <span>
            <h2>Reset demo data</h2>
            <p>Only the demo database can be reset.</p>
          </span>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset seluruh data demo di browser ini?")) {
              reset();
              location.reload();
            }
          }}
        >
          Reset demo database
        </button>
      </article>
    </section>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="tag">{children}</span>;
}
