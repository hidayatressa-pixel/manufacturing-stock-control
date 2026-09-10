import { useEffect, useState } from "react";
import { CheckCircle2, Download, Plus, RefreshCcw } from "lucide-react";
import type { Role, View } from "../types";
type Row = {
  id: string;
  no: string;
  status: string;
  primary: string;
  detail: string;
  qty: string;
  date: string;
};
type State = {
  inventory: Row[];
  boms: Row[];
  requests: Row[];
  issues: Row[];
  results: Row[];
  opname: Row[];
  audit: Row[];
};
const seed: State = {
  inventory: [
    {
      id: "i1",
      no: "RM-260907-A",
      status: "AVAILABLE",
      primary: "RM-ABS-001 · ABS Resin Black",
      detail: "Raw Material Warehouse",
      qty: "1,240 KG",
      date: "11 Sep 2026",
    },
    {
      id: "i2",
      no: "LED-260911-B",
      status: "AVAILABLE",
      primary: "RM-LED-014 · LED Module 12V",
      detail: "Raw Material Warehouse",
      qty: "286 PCS",
      date: "11 Sep 2026",
    },
    {
      id: "i3",
      no: "FG-20260911-0003",
      status: "RELEASED",
      primary: "FG-RL-220 · Rear Combination Lamp",
      detail: "Finished Goods Warehouse",
      qty: "672 PCS",
      date: "11 Sep 2026",
    },
  ],
  boms: [
    {
      id: "b1",
      no: "BOM-FG-RL-220-V1",
      status: "ACTIVE",
      primary: "Rear Combination Lamp",
      detail: "ABS Resin 0.24 KG · LED Module 1 PCS · Clear Lens 1 PCS",
      qty: "Base 1 PCS",
      date: "Version 1",
    },
  ],
  requests: [
    {
      id: "q1",
      no: "MR-20260911-0001",
      status: "PARTIALLY ISSUED",
      primary: "WO-20260911-0002",
      detail: "ABS Resin Black · requested 120 KG",
      qty: "48 / 120 KG",
      date: "11 Sep 2026",
    },
  ],
  issues: [
    {
      id: "m1",
      no: "MI-20260911-0004",
      status: "POSTED",
      primary: "RM-ABS-001 · RM-260907-A",
      detail: "WO-20260911-0002 · MR-20260911-0001",
      qty: "48 KG OUT",
      date: "11 Sep 2026",
    },
  ],
  results: [
    {
      id: "p1",
      no: "PRD-20260911-0003",
      status: "POSTED",
      primary: "FG-RL-220 · FG-20260911-0003",
      detail: "WO-20260911-0001 · GOOD 196 · REJECT 4",
      qty: "196 PCS IN",
      date: "11 Sep 2026",
    },
  ],
  opname: [
    {
      id: "s1",
      no: "STO-20260910-0001",
      status: "POSTED",
      primary: "RM-LENS-008 · LNS-260828-A",
      detail: "System 100 · Actual 94 · GAP -6",
      qty: "-6 PCS ADJ",
      date: "10 Sep 2026",
    },
  ],
  audit: [
    {
      id: "a1",
      no: "POST_MATERIAL_ISSUE",
      status: "SUCCESS",
      primary: "Warehouse Demo (WH-2001)",
      detail: "MI-20260911-0004 · immutable stock OUT",
      qty: "48 KG",
      date: "11 Sep · 08:42",
    },
    {
      id: "a2",
      no: "POST_PRODUCTION_RESULT",
      status: "SUCCESS",
      primary: "Production Demo (PROD-1001)",
      detail: "PRD-20260911-0003 · created FG LOT",
      qty: "196 PCS",
      date: "11 Sep · 10:18",
    },
    {
      id: "a3",
      no: "POST_STOCK_OPNAME",
      status: "SUCCESS",
      primary: "Supervisor Demo (SPV-3001)",
      detail: "STO-20260910-0001 · referenced adjustment",
      qty: "-6 PCS",
      date: "10 Sep · 17:04",
    },
  ],
};
const storageKey = "msc-demo-v1";
function load(): State {
  try {
    return { ...seed, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
  } catch {
    return seed;
  }
}
const labels: Partial<Record<View, { title: string; action: string }>> = {
  inventory: {
    title: "Stock by item, LOT, and location",
    action: "Receive stock",
  },
  boms: { title: "Active BOM versions", action: "New BOM version" },
  requests: { title: "Material request workflow", action: "Create request" },
  issues: { title: "Posted warehouse issues", action: "Post partial issue" },
  results: { title: "Production result postings", action: "Post result" },
  opname: { title: "Physical reconciliation", action: "Start opname" },
  audit: { title: "Append-only activity history", action: "" },
};
const roles: Record<string, Role[]> = {
  inventory: ["WAREHOUSE", "ADMIN"],
  boms: ["ADMIN"],
  requests: ["PRODUCTION", "SUPERVISOR", "ADMIN"],
  issues: ["WAREHOUSE", "ADMIN"],
  results: ["PRODUCTION", "ADMIN"],
  opname: ["WAREHOUSE", "SUPERVISOR", "ADMIN"],
};
export function OperationalModule({
  view,
  role,
  onNotify,
}: {
  view: View;
  role: Role;
  onNotify: (s: string) => void;
}) {
  const [data, setData] = useState<State>(load);
  useEffect(
    () => localStorage.setItem(storageKey, JSON.stringify(data)),
    [data],
  );
  const rows = (data as unknown as Record<string, Row[]>)[view] || [],
    meta = labels[view];
  if (!meta) return null;
  const update = (next: State) => setData(next);
  const add = () => {
    const stamp = Date.now(),
      seq = String(rows.length + 1).padStart(4, "0"),
      date = "11 Sep 2026";
    let row: Row;
    if (view === "inventory")
      row = {
        id: String(stamp),
        no: `RM-${String(stamp).slice(-6)}`,
        status: "POSTED",
        primary: "RM-ABS-001 · ABS Resin Black",
        detail: "Receiving · Raw Material Warehouse",
        qty: "+100 KG IN",
        date,
      };
    else if (view === "boms")
      row = {
        id: String(stamp),
        no: `BOM-FG-RL-220-V${rows.length + 1}`,
        status: "ACTIVE",
        primary: "Rear Combination Lamp",
        detail: "Copied component standard · editable version",
        qty: "Base 1 PCS",
        date: `Version ${rows.length + 1}`,
      };
    else if (view === "requests")
      row = {
        id: String(stamp),
        no: `MR-20260911-${seq}`,
        status: "REQUESTED",
        primary: "WO-20260912-0001",
        detail: "Calculated from released WO requirement",
        qty: "72 KG remaining",
        date,
      };
    else if (view === "issues")
      row = {
        id: String(stamp),
        no: `MI-20260911-${seq}`,
        status: "POSTED",
        primary: "RM-ABS-001 · RM-260907-A",
        detail: "Partial issue · WO-20260912-0001",
        qty: "24 KG OUT",
        date,
      };
    else if (view === "results")
      row = {
        id: String(stamp),
        no: `PRD-20260911-${seq}`,
        status: "POSTED",
        primary: `FG-RL-220 · FG-20260911-${seq}`,
        detail: "GOOD 96 · REJECT 4 · total validated",
        qty: "96 PCS IN",
        date,
      };
    else
      row = {
        id: String(stamp),
        no: `STO-20260911-${seq}`,
        status: "COUNTING",
        primary: "RM-LED-014 · LED-260911-B",
        detail: "System frozen at 286 · actual count pending",
        qty: "GAP pending",
        date,
      };
    const current = (data as unknown as Record<string, Row[]>)[view];
    update({
      ...data,
      [view]: [row, ...current],
      audit: [
        {
          id: `l${stamp}`,
          no: `CREATE_${view.toUpperCase()}`,
          status: "SUCCESS",
          primary: `${role} demo user`,
          detail: row.no,
          qty: row.qty,
          date: "Just now",
        },
        ...data.audit,
      ],
    });
    onNotify(`${row.no} berhasil diproses`);
  };
  const reverse = (row: Row) => {
    if (!confirm(`Reverse ${row.no}? Transaksi lawan akan dibuat.`)) return;
    update({
      ...data,
      [view]: rows.map((x) =>
        x.id === row.id ? { ...x, status: "REVERSED" } : x,
      ),
      audit: [
        {
          id: `r${Date.now()}`,
          no: `REVERSE_${view.toUpperCase()}`,
          status: "SUCCESS",
          primary: `${role} demo user`,
          detail: row.no,
          qty: row.qty,
          date: "Just now",
        },
        ...data.audit,
      ],
    });
    onNotify(`${row.no} reversed dengan audit trail`);
  };
  const csv = () => {
    const body = [
        "number,status,description,detail,quantity,date",
        ...rows.map((r) =>
          [r.no, r.status, r.primary, r.detail, r.qty, r.date]
            .map((v) => `"${v.replaceAll('"', '""')}"`)
            .join(","),
        ),
      ].join("\n"),
      a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = `msc-${view}.csv`;
    a.click();
    onNotify("CSV berhasil dibuat");
  };
  return (
    <article className="panel operational">
      <div className="toolbar module-toolbar">
        <div>
          <span className="eyebrow">LIVE DEMO WORKFLOW</span>
          <h2>{meta.title}</h2>
        </div>
        <span className="toolbar-spacer" />
        <button className="secondary" onClick={csv}>
          <Download />
          Export CSV
        </button>
        {roles[view]?.includes(role) && meta.action && (
          <button className="primary" onClick={add}>
            <Plus />
            {meta.action}
          </button>
        )}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NUMBER / LOT</th>
              <th>DESCRIPTION</th>
              <th>QUANTITY</th>
              <th>DATE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <b className="mono teal">{row.no}</b>
                </td>
                <td>
                  <b>{row.primary}</b>
                  <small>{row.detail}</small>
                </td>
                <td>
                  <b>{row.qty}</b>
                </td>
                <td>{row.date}</td>
                <td>
                  <span
                    className={`status ${row.status === "REVERSED" ? "low" : "healthy"}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td>
                  {["SUPERVISOR", "ADMIN"].includes(role) &&
                  row.status === "POSTED" ? (
                    <button
                      className="text-button action"
                      onClick={() => reverse(row)}
                    >
                      <RefreshCcw />
                      Reverse
                    </button>
                  ) : (
                    <span className="locked">
                      <CheckCircle2 />
                      Controlled
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="table-footer">
        {rows.length} records · demo tersimpan di browser · production
        menggunakan MySQL API
      </footer>
    </article>
  );
}
export function ReportModule({ onNotify }: { onNotify: (s: string) => void }) {
  const exportReport = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(
        [
          "report,value\nGOOD rate,96.4%\nMaterial consumption,72 KG\nStock variance,-6 PCS",
        ],
        { type: "text/csv" },
      ),
    );
    a.download = "msc-operational-report.csv";
    a.click();
    onNotify("Laporan CSV berhasil dibuat");
  };
  return (
    <>
      <section className="kpis">
        {[
          ["Stock movement", "7", "ledger records"],
          ["Material consumption", "72 KG", "issued to open WOs"],
          ["GOOD rate", "96.4%", "GOOD vs REJECT"],
          ["Stock variance", "-6 PCS", "posted from opname"],
        ].map((c) => (
          <article key={c[0]}>
            <span>{c[0]}</span>
            <b>{c[1]}</b>
            <small>{c[2]}</small>
          </article>
        ))}
      </section>
      <article className="panel report-actions">
        <h2>Operational report center</h2>
        <p>
          Source records can be filtered by period, item, LOT, WO, actor, type,
          and status while retaining audit references.
        </p>
        <button className="primary" onClick={exportReport}>
          <Download />
          Export report
        </button>
      </article>
    </>
  );
}
