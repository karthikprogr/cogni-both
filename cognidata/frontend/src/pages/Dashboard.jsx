import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { api } from "../api/client";
import { Component } from "react";

// Error Boundary
class Safe extends Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return <div style={{ padding: 12, color: "#f87171", fontSize: 12 }}>Error: {this.state.err.message}</div>;
    return this.props.children;
  }
}

// Chart Component
const Chart = memo(function Chart({ figure, height = 260 }) {
  const [Plot, setPlot] = useState(null);
  useEffect(() => {
    import("react-plotly.js").then(m => setPlot(() => m.default)).catch(() => {});
  }, []);
  if (!Plot || !figure) return <div style={{ height, background: "rgba(255,255,255,.02)", borderRadius: 8 }} />;
  return (
    <Safe>
      <Plot
        data={figure.data || []}
        layout={{
          ...figure.layout,
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: "#a1a1aa", family: "Inter,sans-serif", size: 11 },
          margin: { l: 40, r: 16, t: 30, b: 40 },
          height
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%" }}
        useResizeHandler
      />
    </Safe>
  );
});

// Styles
const S = {
  page: { padding: "20px 24px", background: "#09090b", minHeight: "100vh", color: "#e4e4e7" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 700, color: "#fff" },
  sub: { fontSize: 12, color: "#71717a", marginTop: 2 },
  tabs: { display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,.06)" },
  tab: (active) => ({
    padding: "8px 16px", background: "transparent", border: "none", fontSize: 13,
    fontWeight: 500, cursor: "pointer",
    borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
    color: active ? "#818cf8" : "#71717a", transition: "all .2s"
  }),
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 20 },
  kpi: { background: "#18181b", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "16px 18px" },
  kpiVal: { fontSize: 26, fontWeight: 700 },
  kpiLbl: { fontSize: 11, color: "#71717a", marginTop: 4 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  chartCard: { background: "#18181b", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, overflow: "hidden" },
  chartTitle: { fontSize: 12, fontWeight: 600, color: "#a1a1aa", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,.05)" },
  btn: { padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  empty: { textAlign: "center", padding: "60px 20px", color: "#52525b", fontSize: 14 },
  card: { background: "#18181b", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 16, marginBottom: 14 },
  input: { background: "#09090b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "8px 12px", color: "#e4e4e7", fontSize: 13, width: "100%" }
};

// Overview Tab
const OverviewTab = memo(function OverviewTab() {
  const [palette, setPalette] = useState("Indigo");
  const [charts, setCharts] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/data/info").then(r => {
      if (r.data && typeof r.data.rows === "number") setInfo(r.data);
    }).catch(() => {});

    api.get(`/viz/overview?max_charts=6&palette=${palette}`)
      .then(r => setCharts(r.data?.charts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [palette]);

  if (!info && !loading) {
    return (
      <div style={S.empty}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📤</div>
        <div style={{ fontWeight: 600, color: "#a1a1aa" }}>No dataset loaded</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>Upload a CSV, Excel, or JSON file to get started</div>
      </div>
    );
  }

  const numericCount = Array.isArray(info?.numeric_columns) ? info.numeric_columns.length : (info?.numeric_columns || 0);
  const categoricalCount = Array.isArray(info?.categorical_columns) ? info.categorical_columns.length : (info?.categorical_columns || 0);
  const missing = typeof info?.missing_values === 'number' 
    ? info.missing_values 
    : (info?.missing_values && typeof info.missing_values === 'object')
      ? Object.values(info.missing_values).reduce((a, b) => a + (Number(b) || 0), 0)
      : 0;

  const kpis = info ? [
    ["Rows", info.rows?.toLocaleString(), "#6366f1"],
    ["Columns", info.columns, "#10b981"],
    ["Numeric", numericCount, "#f59e0b"],
    ["Categorical", categoricalCount, "#0ea5e9"],
    ["Missing", missing, missing > 0 ? "#ef4444" : "#22c55e"]
  ] : [];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#71717a" }}>Palette:</span>
        {["Indigo", "Emerald", "Sunset", "Ocean"].map(p => (
          <button key={p} onClick={() => setPalette(p)}
            style={{
              padding: "4px 12px", borderRadius: 20, border: "1px solid", fontSize: 11, cursor: "pointer",
              background: palette === p ? "rgba(99,102,241,.2)" : "transparent",
              borderColor: palette === p ? "rgba(99,102,241,.5)" : "rgba(255,255,255,.1)",
              color: palette === p ? "#818cf8" : "#71717a", transition: "all .2s"
            }}>
            {p}
          </button>
        ))}
      </div>

      {kpis.length > 0 && (
        <div style={S.kpiGrid}>
          {kpis.map(([label, val, color]) => (
            <div key={label} style={S.kpi}>
              <div style={{ ...S.kpiVal, color }}>{val ?? "—"}</div>
              <div style={S.kpiLbl}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {charts.length > 0 && (
        <div style={S.grid2}>
          {charts.map((c, i) => (
            <div key={i} style={S.chartCard}>
              <div style={S.chartTitle}>{c.title}</div>
              <Safe><Chart figure={c.plotly_json} height={260} /></Safe>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Charts Tab
const ChartsTab = memo(function ChartsTab() {
  const [info, setInfo] = useState(null);
  
  useEffect(() => {
    api.get("/data/info").then(r => setInfo(r.data)).catch(() => {});
  }, []);

  if (!info) {
    return <div style={S.empty}>No dataset loaded</div>;
  }

  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, marginBottom: 12 }}>Charts tab - Custom chart builder coming soon</div>
      <div style={{ fontSize: 12, color: "#71717a" }}>Create custom visualizations with your data</div>
    </div>
  );
});

// Data Doctor Tab
const DoctorTab = memo(function DoctorTab() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = useCallback(() => {
    setLoading(true);
    api.get("/data/doctor")
      .then(r => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!report) {
    return (
      <div style={S.card}>
        <div style={{ fontSize: 14, marginBottom: 12 }}>Data Health Check</div>
        <div style={{ fontSize: 12, color: "#71717a", marginBottom: 16 }}>
          Analyze your dataset for quality issues, missing values, and recommendations
        </div>
        <button onClick={runCheck} disabled={loading} style={S.btn}>
          {loading ? "Checking..." : "Run Health Check"}
        </button>
      </div>
    );
  }

  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Health Report</div>
      <pre style={{ fontSize: 12, color: "#e4e4e7", whiteSpace: "pre-wrap" }}>
        {JSON.stringify(report, null, 2)}
      </pre>
    </div>
  );
});

// Main Dashboard - 3 TABS: Overview, Charts, Data Doctor
const TABS = ["📊 Overview", "📈 Charts", "🩺 Data Doctor"];

export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.get("/data/info").then(r => {
      if (r.data && typeof r.data.rows === "number") setInfo(r.data);
    }).catch(() => {});
  }, []);

  const handleClean = useCallback(() => {
    api.post("/data/clean").catch(() => {});
  }, []);

  const handleExport = useCallback(() => {
    api.get("/reports/export/csv").then(r => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([r.data]));
      a.download = "export.csv";
      a.click();
    }).catch(() => {});
  }, []);

  const summary = info
    ? `${info.rows?.toLocaleString()} rows • ${info.columns} columns`
    : "Upload a dataset to get started";

  return (
    <Safe>
      <div style={S.page}>
        <div style={S.header}>
          <div>
            <div style={S.title}>Dashboard</div>
            <div style={S.sub}>{summary}</div>
          </div>
          {info && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleClean} style={S.btn}>🧹 Clean</button>
              <button onClick={handleExport} style={S.btn}>⬇ Export</button>
            </div>
          )}
        </div>

        <div style={S.tabs}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={S.tab(tab === i)}>{t}</button>
          ))}
        </div>

        <Safe>
          {tab === 0 && <OverviewTab />}
          {tab === 1 && <ChartsTab />}
          {tab === 2 && <DoctorTab />}
        </Safe>
      </div>
    </Safe>
  );
}