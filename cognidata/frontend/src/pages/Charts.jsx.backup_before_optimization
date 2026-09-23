import { useState, useEffect } from "react";
import { api } from "../api/client";
import { Component } from "react";

// Error Boundary
class Safe extends Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return (
      <div style={{ padding: 12, color: "#f87171", fontSize: 12, background: "rgba(239,68,68,.05)", borderRadius: 8 }}>
        ⚠ {this.state.err.message}
      </div>
    );
    return this.props.children;
  }
}

// Chart Component using Plotly
function Chart({ figure, height = 420 }) {
  const [Plot, setPlot] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    import("react-plotly.js").then(m => {
      if (!cancelled) setPlot(() => m.default);
    }).catch(e => {
      if (!cancelled) setErr(e.message);
    });
    return () => { cancelled = true; };
  }, []);

  if (!figure) return null;
  if (err) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#52525b", fontSize: 12 }}>Chart unavailable</div>;
  if (!Plot) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#52525b", fontSize: 12 }}>Loading…</div>;

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
          height,
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%" }}
        useResizeHandler
      />
    </Safe>
  );
}

const S = {
  page:       { padding: "20px 24px", background: "#09090b", minHeight: "100vh", color: "#e4e4e7", overflowY: "auto" },
  header:     { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title:      { fontSize: 20, fontWeight: 700, color: "#fff" },
  sub:        { fontSize: 12, color: "#71717a", marginTop: 2 },
  card:       { background: "#18181b", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 16, marginBottom: 14 },
  select:     { background: "#09090b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "8px 12px", color: "#e4e4e7", fontSize: 13, width: "100%", cursor: "pointer" },
  btn:        { padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  empty:      { textAlign: "center", padding: "60px 20px", color: "#52525b", fontSize: 14 },
  chartCard:  { background: "#18181b", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, overflow: "hidden" },
};

function ChartsTab() {
  const [info, setInfo]      = useState(null);
  const [xCol, setXCol]      = useState("");
  const [yCol, setYCol]      = useState("");
  const [chartType, setType] = useState("Bar");
  const [chart, setChart]    = useState(null);
  const [loading, setLoad]   = useState(false);
  const [error, setError]    = useState("");
  const [explanation, setExplanation] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);

  useEffect(() => {
    api.get("/data/info").then(({ data }) => {
      setInfo(data);
      const firstCol = data?.columns_info?.[0]?.name;
      if (firstCol) { setXCol(firstCol); setYCol(firstCol); }
    });
  }, []);

  const buildChart = async () => {
    setLoad(true);
    setError("");
    setChart(null);
    setExplanation("");
    try {
      const typeMap = {
        "Stacked Bar": "stacked bar",
        "Stacked Area": "stacked area",
        "Table with Charts": "table with charts",
        "3D Area": "3d area",
        "Small Multiples": "small multiples",
        "Time Series": "time series",
        "Network Graph": "network graph",
        "Parallel Coordinates": "parallel coordinates",
        "Q-Q Plot": "qq plot",
        "100% Stacked": "100% stacked",
        "ROC Curve": "roc curve",
        "Precision Recall": "precision recall",
        "Confusion Matrix": "confusion matrix",
        "Learning Curve": "learning curve",
        "Monte Carlo": "monte carlo",
        "Cluster Heatmap": "cluster heatmap",
        "Radial Heatmap": "radial heatmap",
        "Faceted Heatmap": "faceted heatmap",
        "Word Frequency": "word frequency",
        "Animated Bubble": "animated bubble",
      };
      const effectiveType = typeMap[chartType] || chartType.toLowerCase();
      const effectiveY = yCol || xCol;
      const { data } = await api.post("/viz/custom", {
        chart_type: effectiveType,
        x_col: xCol,
        y_col: effectiveY,
      });
      setChart(data?.plotly_json || data);
    } catch(e) {
      const detail = e.response?.data?.detail || e.message || "Chart build failed";
      setError(detail);
    }
    setLoad(false);
  };

  const handleExplain = async () => {
    if (!chart) return;
    setExplainLoading(true);
    setExplanation("");
    try {
      const { data } = await api.post("/ai/explain-chart", {
        chart_type: chartType,
        x_column: xCol,
        y_column: yCol,
      });
      setExplanation(data.explanation || "Chart explanation generated.");
    } catch (e) {
      setExplanation("Unable to generate explanation: " + (e.response?.data?.detail || e.message));
    }
    setExplainLoading(false);
  };

  const cols = info?.columns_info?.map(c => c.name) || [];
  if (!info) return <div style={S.empty}>No dataset loaded</div>;

  return (
    <div>
      <div style={{ ...S.card, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 120px" }}>
          <div style={{ fontSize: 11, color: "#71717a", marginBottom: 4 }}>Chart Type</div>
          <select style={S.select} value={chartType} onChange={e => setType(e.target.value)}>
            <optgroup label="── Classic ──">
              {["Bar","Line","Scatter","Pie","Histogram","Box","Heatmap","Area","Treemap","Radar","Waterfall","Stacked Bar","Stacked Area","Bubble","Violin","Funnel","Sunburst","Marimekko","Table with Charts","3D Area"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Trending ──">
              {["Sankey","Beeswarm","Bullet","Small Multiples","Rose","Time Series","Infographic","Network Graph","Gantt"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Advanced ──">
              {["Parallel Coordinates","Chord","Hexbin","Ridgeline","Streamgraph","Dendrogram","Voronoi","PCA","SHAP","Choropleth"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Statistical ──">
              {["Q-Q Plot","ECDF","KDE","Rug Plot","Dot Plot","Lollipop","Slope Chart","Dumbbell","Diverging Bar"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Business ──">
              {["Candlestick","Pair Plot","Donut","Waffle","Pyramid","100% Stacked"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Creative ──">
              {["Polar Line","Radial Bar","Circle Packing","Arc Diagram","Spiral","Funnel Area"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── ML & AI ──">
              {["ROC Curve","Precision Recall","Confusion Matrix","Learning Curve","Monte Carlo"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Matrix ──">
              {["Correlogram","Cluster Heatmap","Radial Heatmap","Faceted Heatmap"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Text & Bonus ──">
              {["Word Frequency","Horizon","Animated Bubble"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
          </select>
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <div style={{ fontSize: 11, color: "#71717a", marginBottom: 4 }}>X Column</div>
          <select style={S.select} value={xCol} onChange={e => setXCol(e.target.value)}>
            {cols.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <div style={{ fontSize: 11, color: "#71717a", marginBottom: 4 }}>Y Column</div>
          <select style={S.select} value={yCol} onChange={e => setYCol(e.target.value)}>
            <option value="">— same as X —</option>
            {cols.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={buildChart} disabled={loading} style={{...S.btn, opacity: loading ? 0.6 : 1}}>
          {loading ? "⏳ Building..." : "📊 Build Chart"}
        </button>
      </div>

      {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "rgba(239,68,68,.05)", borderRadius: 8 }}>{error}</div>}

      {chart && (
        <div style={S.chartCard}>
          <Safe><Chart figure={chart} height={420} /></Safe>
        </div>
      )}

      {/* Explain Button */}
      {chart && (
        <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
          <button 
            onClick={handleExplain} 
            disabled={explainLoading}
            style={{
              ...S.btn,
              background: explainLoading ? "#52525b" : "linear-gradient(135deg, #10b981, #059669)",
              cursor: explainLoading ? "not-allowed" : "pointer",
              opacity: explainLoading ? 0.6 : 1,
            }}
          >
            {explainLoading ? "⏳ Generating..." : "💡 Explain Chart"}
          </button>
          {explanation && (
            <button 
              onClick={() => setExplanation("")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: "#71717a",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}

      {/* Explanation Display */}
      {explanation && (
        <div style={{
          ...S.card,
          marginTop: 12,
          background: "linear-gradient(135deg, rgba(16,185,129,.05), rgba(5,150,105,.05))",
          border: "1px solid rgba(16,185,129,.2)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#10b981", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            💡 Chart Explanation
          </div>
          <div style={{ fontSize: 13, color: "#e4e4e7", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Charts() {
  return (
    <Safe>
      <div style={S.page}>
        <div style={S.header}>
          <div>
            <div style={S.title}>📊 Charts</div>
            <div style={S.sub}>Build custom visualizations with 100+ chart types</div>
          </div>
        </div>
        <Safe>
          <ChartsTab />
        </Safe>
      </div>
    </Safe>
  );
}