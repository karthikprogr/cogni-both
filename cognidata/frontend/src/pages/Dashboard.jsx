import { useEffect, useState, useCallback, memo } from "react";
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
  btn: { padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  empty: { textAlign: "center", padding: "60px 20px", color: "#52525b", fontSize: 14 },
  card: { background: "#18181b", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 16, marginBottom: 14 }
};

// Overview Tab - NO CHARTS, just KPIs
const OverviewTab = memo(function OverviewTab() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/data/info")
      .then(r => {
        if (r.data && typeof r.data.rows === "number") setInfo(r.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
  const missing = typeof info?.missing_values === "number" 
    ? info.missing_values 
    : (info?.missing_values && typeof info.missing_values === "object")
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

      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Dataset Summary</div>
        <div style={{ fontSize: 12, color: "#71717a" }}>
          Charts have been removed to improve performance. Use the Charts page from the sidebar for custom visualizations.
        </div>
      </div>
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

// Main Dashboard - 2 TABS ONLY: Overview, Data Doctor (NO CHARTS TAB)
const TABS = ["📊 Overview", "🩺 Data Doctor"];

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
          {tab === 1 && <DoctorTab />}
        </Safe>
      </div>
    </Safe>
  );
}
