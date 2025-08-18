
import React, { useMemo, useState } from "react";

type FlowItem = {
  id: string;
  stage: string;
  company?: string;
  from?: string;
  to?: string;
  date?: string;
  refs?: Record<string, string>;
  metrics?: Record<string, string | number>;
  tags?: string[];
};

type Node = { id: string; label: string; group: string };
type Edge = { id: string; source: string; target: string; label?: string };

const MOCK_FLOW: FlowItem[] = [
  {
    id: "f1",
    stage: "Farm",
    company: "Farm A (PIC NS123456)",
    date: "2025-08-15",
    refs: { NVD: "NVD-2025-08-15-001", PIC: "NS123456" },
    metrics: { head: 48 },
    tags: ["eNVD", "NLIS"],
  },
  {
    id: "f2",
    stage: "Transport",
    company: "Lindsay Transport Pty Ltd",
    from: "Farm A (PIC NS123456)",
    to: "JBS Dinmore (PIC QL654321)",
    date: "2025-08-15",
    metrics: { tempAvgC: 3.1 },
    tags: ["Animal Welfare", "Temp Log"],
  },
  {
    id: "f3",
    stage: "Processor",
    company: "JBS Dinmore (Processor)",
    date: "2025-08-16",
    refs: { CarcaseID: "C-20250816-001…048", MSA_Batch: "MSA-0816-A" },
    metrics: { HSCW_avg_kg: 298, MSA_Index_avg: 63.2 },
    tags: ["MSA", "AUS-MEAT"],
  },
  {
    id: "f4",
    stage: "Case-Ready",
    company: "Hilton Foods Australia",
    date: "2025-08-16",
    refs: {
      ASN: "ASN20250816",
      SSCC: "003934567890123456",
      GTIN: "09345678000012",
      Lot: "BEEF-AUG15-01",
    },
    tags: ["DESADV", "GS1-128"],
  },
  {
    id: "f5",
    stage: "DC",
    company: "Woolworths DC – Minchinbury NSW",
    date: "2025-08-17",
    metrics: { pallets: 48, ssccMatch: "100%", tempArrivalC: 1.8 },
    tags: ["QA", "Vendor Compliance"],
  },
  {
    id: "f6",
    stage: "Store",
    company: "Woolworths Parramatta Store",
    date: "2025-08-17",
    metrics: { posScans: 1324, wastePct: "1.2%" },
    tags: ["POS", "Sales"],
  },
];

const MOCK_GRAPH: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    { id: "FarmA", label: "Farm A\\nPIC NS123456", group: "Farm" },
    { id: "Transport", label: "Lindsay Transport", group: "Transport" },
    { id: "Processor", label: "JBS Dinmore", group: "Processor" },
    { id: "CaseReady", label: "Hilton Foods", group: "Case-Ready" },
    { id: "DC", label: "Woolworths DC\\nMinchinbury", group: "DC" },
    { id: "Store", label: "Woolworths\\nParramatta", group: "Store" },
  ],
  edges: [
    { id: "e1", source: "FarmA", target: "Transport", label: "eNVD/NLIS" },
    { id: "e2", source: "Transport", target: "Processor", label: "Movement" },
    { id: "e3", source: "Processor", target: "CaseReady", label: "MSA/Cartons" },
    { id: "e4", source: "CaseReady", target: "DC", label: "DESADV/SSCC" },
    { id: "e5", source: "DC", target: "Store", label: "QA/POS" },
  ],
};

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

const TabNames = ["Flow", "Graph", "List"] as const;

export default function App() {
  const [screen, setScreen] = useState<"search" | "results">("search");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<typeof TabNames[number]>("Flow");
  const [selected, setSelected] = useState<FlowItem | null>(null);

  const filtered = useMemo(() => {
    if (!query) return MOCK_FLOW;
    const q = query.toLowerCase();
    return MOCK_FLOW.filter((f) =>
      [f.stage, f.company, f.from, f.to, f.date, ...(f.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
      <Header />
      {screen === "search" ? (
        <SearchScreen
          query={query}
          onChange={setQuery}
          onSubmit={() => setScreen("results")}
        />
      ) : (
        <ResultsScreen
          query={query}
          tab={tab}
          onTabChange={setTab}
          data={filtered}
          onBack={() => setScreen("search")}
          onSelect={setSelected}
          selected={selected}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-2xl bg-black" />
        <span className="font-semibold">Agri Supply Chain</span>
      </div>
      <div className="text-sm text-neutral-500">Demo prototype · static data</div>
    </div>
  );
}

function SearchScreen({
  query,
  onChange,
  onSubmit,
}: {
  query: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pt-20">
      <h1 className="text-3xl font-semibold tracking-tight">Search value chain</h1>
      <p className="text-neutral-600">Type anything (company, PIC, stage, tag) and continue.</p>
      <div className="flex w-full items-center gap-2">
        <input
          autoFocus
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Hilton, NS123456, MSA, Woolworths"
          className="w-full rounded-xl border px-4 py-3 outline-none ring-0 focus:border-neutral-400"
        />
        <button
          onClick={onSubmit}
          className="rounded-xl bg-black px-5 py-3 text-white shadow-sm hover:opacity-90"
        >
          Search
        </button>
      </div>
    </div>
  );
}

function ResultsScreen({
  query,
  tab,
  onTabChange,
  data,
  onBack,
  onSelect,
  selected,
}: {
  query: string;
  tab: typeof TabNames[number];
  onTabChange: (t: typeof TabNames[number]) => void;
  data: FlowItem[];
  onBack: () => void;
  onSelect: (f: FlowItem | null) => void;
  selected: FlowItem | null;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="mr-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            ← New search
          </button>
          <span className="text-neutral-600">Query:</span>{" "}
          <span className="font-medium">{query || "(all)"}</span>
        </div>
        <Tabs value={tab} onChange={onTabChange} />
      </div>

      {tab === "Flow" && <FlowView data={MOCK_FLOW} onSelect={(f) => onSelect(f)} />}
      {tab === "Graph" && <GraphView onSelect={(f) => onSelect(f)} />}
      {tab === "List" && <ListView data={MOCK_FLOW} onSelect={(f) => onSelect(f)} />}

      <SidePanel item={selected} onClose={() => onSelect(null)} />
    </div>
  );
}

function Tabs({
  value,
  onChange,
}: {
  value: typeof TabNames[number];
  onChange: (v: typeof TabNames[number]) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border bg-white p-1">
      {TabNames.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={classNames(
            "rounded-lg px-3 py-1.5 text-sm",
            value === t ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function FlowView({ data, onSelect }: { data: FlowItem[]; onSelect: (f: FlowItem) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {data.map((f) => (
        <div
          key={f.id}
          onClick={() => onSelect(f)}
          className="group cursor-pointer rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
              {f.stage}
            </span>
            <span className="text-xs text-neutral-500">{f.date}</span>
          </div>
          <div className="mb-1 font-semibold leading-tight">{f.company}</div>
          {(f.from || f.to) && (
            <div className="mb-2 text-sm text-neutral-600">
              {f.from && <span className="mr-1">From: {f.from}</span>}
              {f.to && <span>→ To: {f.to}</span>}
            </div>
          )}
          {f.tags && (
            <div className="mt-2 flex flex-wrap gap-1">
              {f.tags.map((t) => (
                <span key={t} className="rounded-lg border px-2 py-0.5 text-xs text-neutral-700">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GraphView({ onSelect }: { onSelect: (f: FlowItem) => void }) {
  const positions: Record<string, { x: number; y: number }> = {
    FarmA: { x: 60, y: 60 },
    Transport: { x: 260, y: 60 },
    Processor: { x: 460, y: 60 },
    CaseReady: { x: 660, y: 60 },
    DC: { x: 860, y: 60 },
    Store: { x: 1060, y: 60 },
  };

  function nodeClick(id: string) {
    const map: Record<string, string> = {
      FarmA: "f1",
      Transport: "f2",
      Processor: "f3",
      CaseReady: "f4",
      DC: "f5",
      Store: "f6",
    };
    const item = MOCK_FLOW.find((f) => f.id === map[id]);
    if (item) onSelect(item);
  }

  return (
    <div className="overflow-auto rounded-2xl border bg-white p-4">
      <svg viewBox="0 0 1150 150" className="h-64 w-[1150px]">
        {MOCK_GRAPH.edges.map((e) => {
          const s = positions[e.source];
          const t = positions[e.target];
          return (
            <g key={e.id}>
              <line x1={s.x + 40} y1={s.y} x2={t.x - 40} y2={t.y} stroke="#bbb" strokeWidth={2} markerEnd="url(#arrow)" />
              {e.label && (
                <text x={(s.x + t.x) / 2} y={s.y - 10} textAnchor="middle" className="fill-neutral-500 text-xs">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}

        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#bbb" />
          </marker>
        </defs>

        {MOCK_GRAPH.nodes.map((n) => {
          const p = positions[n.id];
          return (
            <g key={n.id} onClick={() => nodeClick(n.id)} className="cursor-pointer">
              <rect x={p.x - 40} y={p.y - 20} width={80} height={40} rx={10} className="fill-black/90" />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-white text-xs">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ListView({ data, onSelect }: { data: FlowItem[]; onSelect: (f: FlowItem) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <Th>Stage</Th>
            <Th>Company</Th>
            <Th>Date</Th>
            <Th>From</Th>
            <Th>To</Th>
            <Th>Tags</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((f) => (
            <tr key={f.id} className="hover:bg-neutral-50" onClick={() => onSelect(f)}>
              <Td>{f.stage}</Td>
              <Td>{f.company}</Td>
              <Td>{f.date}</Td>
              <Td>{f.from || "—"}</Td>
              <Td>{f.to || "—"}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {(f.tags || []).map((t) => (
                    <span key={t} className="rounded-lg border px-2 py-0.5 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium text-neutral-700">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-neutral-800">{children}</td>;
}

function SidePanel({ item, onClose }: { item: FlowItem | null; onClose: () => void }) {
  return (
    <div
      className={classNames(
        "fixed right-0 top-0 z-20 h-full w-full max-w-md transform border-l bg-white shadow-2xl transition-transform",
        item ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="font-semibold">Details</div>
        <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">
          Close
        </button>
      </div>
      {item ? (
        <div className="space-y-4 p-4">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Stage</div>
            <div className="text-lg font-semibold">{item.stage}</div>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Company</div>
            <div>{item.company}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {item.date && <InfoCard label="Date" value={item.date} />}
            {item.metrics &&
              Object.entries(item.metrics).map(([k, v]) => <InfoCard key={k} label={k} value={String(v)} />)}
          </div>
          {item.from || item.to ? (
            <div className="grid grid-cols-2 gap-3">
              {item.from && <InfoCard label="From" value={item.from} />}
              {item.to && <InfoCard label="To" value={item.to} />}
            </div>
          ) : null}
          {item.refs && (
            <div>
              <div className="mb-2 text-sm font-semibold">References</div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(item.refs).map(([k, v]) => (
                  <InfoCard key={k} label={k} value={v} />
                ))}
              </div>
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-semibold">Tags</div>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <span key={t} className="rounded-lg border px-2 py-0.5 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
