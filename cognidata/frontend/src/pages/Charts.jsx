import { useState, useEffect, useCallback, memo, useMemo } from "react";
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
  page:      { padding: "20px 24px", background: "#09090b", minHeight: "100vh", color: "#e4e4e7", overflowY: "auto" },
  header:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title:     { fontSize: 20, fontWeight: 700, color: "#fff" },
  sub:       { fontSize: 12, color: "#71717a", marginTop: 2 },
  card:      { background: "#18181b", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 16, marginBottom: 14 },
  input:     { background: "#09090b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "8px 12px", color: "#e4e4e7", fontSize: 13, width: "100%", boxSizing: "border-box" },
  select:    { background: "#09090b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "8px 12px", color: "#e4e4e7", fontSize: 13, width: "100%", cursor: "pointer" },
  btn:       { padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  empty:     { textAlign: "center", padding: "60px 20px", color: "#52525b", fontSize: 14 },
  chartCard: { background: "#18181b", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, overflow: "hidden" },
  chartTitle:{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,.05)" },
};

// Charts Tab Component
function ChartsTab() {
  const [info, setInfo]      = useState(null);
  const [xCol, setXCol]      = useState("");
  const [yCol, setYCol]      = useState("");
  const [chartType, setType] = useState("Bar");
  const [chart, setChart]    = useState(null);
  const [loading, setLoad]   = useState(false);
  const [error, setError]    = useState("");
  
  // Multi-column selector state
  const [selectedCols, setSelectedCols] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Validation logic with useMemo
  const validation = useMemo(() => {
    if (selectedCols.length === 0) return { valid: true, error: "" };
    if (selectedCols.length === 1) return { valid: false, error: "Select at least 2 columns for multi-column mode" };
    if (selectedCols.length > 10) return { valid: false, error: "Maximum 10 columns allowed" };
    return { valid: true, error: "" };
  }, [selectedCols.length]);
  
  const TYPES = [
    // Classic
    "Bar", "Line", "Scatter", "Pie", "Histogram", "Box", "Heatmap", "Area",
    "Treemap", "Radar", "Waterfall", "Stacked Bar", "Stacked Area",
    "Bubble", "Violin", "Funnel", "Sunburst",
    "Marimekko", "Table with Charts", "3D Area",
    // 2026 Trending
    "Sankey", "Beeswarm", "Bullet", "Small Multiples",
    "Rose", "Time Series", "Infographic",
    "Network Graph", "Gantt",
    // Advanced / AI-Era
    "Parallel Coordinates", "Chord", "Hexbin", "Ridgeline", "Streamgraph", 
    "Dendrogram", "Voronoi", "Uncertainty", "PCA", "SHAP", "Choropleth", "Event Stream",
    // Statistical
    "Q-Q Plot", "ECDF", "KDE", "Rug Plot", "Dot Plot", "Lollipop", 
    "Slope Chart", "Dumbbell", "Diverging Bar",
    // Business & Financial
    "Candlestick", "Pair Plot", "Donut", "Waffle", "Pyramid", "100% Stacked",
    // Time-Series
    "ACF", "Contour", "Run Chart", "Control Chart",
    // Creative
    "Polar Line", "Radial Bar", "Circle Packing", "Arc Diagram", "Spiral", "Funnel Area",
    // ML & AI
    "ROC Curve", "Precision Recall", "Confusion Matrix", "Learning Curve", "Monte Carlo", "Drawdown",
    // Matrix & Correlation
    "Correlogram", "Cluster Heatmap", "Radial Heatmap", "Faceted Heatmap",
    // Hierarchical
    "Icicle", "Surface",
    // Text & Bonus
    "Word Frequency", "Horizon", "Animated Bubble",
  ];

  useEffect(() => {
    api.get("/data/info").then(r => {
      setInfo(r.data);
      const cols = r.data?.columns_info?.map(c => c.name) || [];
      if (cols[0]) setXCol(cols[0]);
      if (cols[1]) setYCol(cols[1]);
    }).catch(() => {});
  }, []);

  const build = async () => {
    if (!xCol) return;
    setLoad(true); setError("");
    try {
      // Map display names to backend chart type strings
      const typeMap = {
        "Stacked Bar": "stacked_bar",
        "Stacked Area": "stacked_area",
        "Table with Charts": "table_sparkline",
        "3D Area": "3d_area",
        "Marimekko": "marimekko",
        "Sankey": "sankey",
        "Beeswarm": "beeswarm",
        "Bullet": "bullet",
        "Small Multiples": "small multiples",
        "Rose": "rose",
        "Time Series": "timeseries",
        "Network Graph": "network",
        "Gantt": "gantt",
        "Parallel Coordinates": "parallel coordinates",
        "Chord": "chord",
        "Hexbin": "hexbin",
        "Ridgeline": "ridgeline",
        "Streamgraph": "streamgraph",
        "Dendrogram": "dendrogram",
        "Voronoi": "voronoi",
        "Uncertainty": "uncertainty",
        "PCA": "pca",
        "SHAP": "shap",
        "Choropleth": "choropleth",
        "Event Stream": "event stream",
        "Q-Q Plot": "qq plot",
        "ECDF": "ecdf",
        "KDE": "kde",
        "Rug Plot": "rug plot",
        "Dot Plot": "dot plot",
        "Lollipop": "lollipop",
        "Slope Chart": "slope chart",
        "Dumbbell": "dumbbell",
        "Diverging Bar": "diverging bar",
        "Candlestick": "candlestick",
        "Pair Plot": "pair plot",
        "Donut": "donut",
        "Waffle": "waffle",
        "Pyramid": "pyramid",
        "100% Stacked": "100% stacked",
        "ACF": "acf",
        "Contour": "contour",
        "Run Chart": "run chart",
        "Control Chart": "control chart",
        "Polar Line": "polar line",
        "Radial Bar": "radial bar",
        "Circle Packing": "circle packing",
        "Arc Diagram": "arc diagram",
        "Spiral": "spiral",
        "Funnel Area": "funnel area",
        "ROC Curve": "roc curve",
        "Precision Recall": "precision recall",
        "Confusion Matrix": "confusion matrix",
        "Learning Curve": "learning curve",
        "Monte Carlo": "monte carlo",
        "Drawdown": "drawdown",
        "Correlogram": "correlogram",
        "Cluster Heatmap": "cluster heatmap",
        "Radial Heatmap": "radial heatmap",
        "Faceted Heatmap": "faceted heatmap",
        "Icicle": "icicle",
        "Surface": "surface",
        "Word Frequency": "word frequency",
        "Horizon": "horizon",
        "Animated Bubble": "animated bubble",
      };
      const effectiveType = typeMap[chartType] || chartType;
      
      // Build request based on mode
      let requestBody;
      if (selectedCols.length >= 2) {
        // Multi-column mode
        requestBody = {
          chart_type: effectiveType,
          columns: selectedCols
        };
      } else {
        // Single-column mode (original behavior)
        const effectiveY = yCol || xCol;
        requestBody = {
          chart_type: effectiveType,
          x_col: xCol,
          y_col: effectiveY
        };
      }
      
      const { data } = await api.post("/viz/custom", requestBody);
      setChart(data?.plotly_json || data);
    } catch(e) {
      const detail = e.response?.data?.detail || e.message || "Chart build failed";
      setError(detail);
    }
    setLoad(false);
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
            <optgroup label="── 2026 Trending ──">
              {["Sankey","Beeswarm","Bullet","Small Multiples","Rose","Time Series","Infographic","Network Graph","Gantt"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Advanced / AI-Era ──">
              {["Parallel Coordinates","Chord","Hexbin","Ridgeline","Streamgraph","Dendrogram","Voronoi","Uncertainty","PCA","SHAP","Choropleth","Event Stream"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Statistical ──">
              {["Q-Q Plot","ECDF","KDE","Rug Plot","Dot Plot","Lollipop","Slope Chart","Dumbbell","Diverging Bar"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Business & Financial ──">
              {["Candlestick","Pair Plot","Donut","Waffle","Pyramid","100% Stacked"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Time-Series ──">
              {["ACF","Contour","Run Chart","Control Chart"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Creative ──">
              {["Polar Line","Radial Bar","Circle Packing","Arc Diagram","Spiral","Funnel Area"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── ML & AI ──">
              {["ROC Curve","Precision Recall","Confusion Matrix","Learning Curve","Monte Carlo","Drawdown"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Matrix & Correlation ──">
              {["Correlogram","Cluster Heatmap","Radial Heatmap","Faceted Heatmap"].map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="── Hierarchical ──">
              {["Icicle","Surface"].map(t => <option key={t}>{t}</option>)}
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
        <div style={{ flex: "1 1 100%", marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "#71717a", marginBottom: 4 }}>
            Additional Columns
          </div>
          {/* Multi-column selector */}
          <div
            style={{
              background: "#09090b",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              padding: "8px 12px",
              minHeight: 42,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              position: "relative"
            }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {/* Selected Column Chips */}
            {selectedCols.map(col => (
              <span
                key={col}
                style={{
                  background: "rgba(99,102,241,.1)",
                  color: "#e4e4e7",
                  fontSize: 13,
                  borderRadius: 6,
                  padding: "4px 8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                {col}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCols(prev => prev.filter(c => c !== col));
                  }}
                  style={{
                    cursor: "pointer",
                    opacity: 0.6,
                    fontSize: 14,
                    lineHeight: 1,
                    transition: "opacity 0.15s"
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 1}
                  onMouseLeave={(e) => e.target.style.opacity = 0.6}
                >
                  ×
                </span>
              </span>
            ))}
            
            {/* Placeholder text when empty */}
            {selectedCols.length === 0 && (
              <span style={{ color: "#52525b", fontSize: 13 }}>
                Select columns for multi-column charts
              </span>
            )}
            
            {/* Dropdown Icon */}
            <span style={{ marginLeft: "auto", color: "#71717a", fontSize: 12 }}>
              {dropdownOpen ? "▲" : "▼"}
            </span>
            
            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 8,
                  maxHeight: 240,
                  overflowY: "auto",
                  zIndex: 1000
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {cols.filter(c => !selectedCols.includes(c)).length === 0 ? (
                  <div style={{ padding: "8px 12px", fontSize: 13, color: "#52525b" }}>
                    No more columns available
                  </div>
                ) : (
                  cols.filter(c => !selectedCols.includes(c)).map(col => (
                    <div
                      key={col}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedCols.length < 10) {
                          setSelectedCols(prev => [...prev, col]);
                        }
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "#e4e4e7",
                        cursor: "pointer",
                        transition: "background 0.15s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,.05)"}
                      onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                      {col}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Validation Error */}
          {!validation.valid && (
            <div style={{ color: "#f87171", fontSize: 13, padding: "8px 12px", background: "rgba(239,68,68,.05)", borderRadius: 8, marginTop: 8 }} role="alert">
              ⚠ {validation.error}
            </div>
          )}
          
          {/* Clear All Button */}
          {selectedCols.length > 0 && (
            <button onClick={() => setSelectedCols([])} style={{ marginTop: 8, fontSize: 12, color: "#71717a", background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}>
              Clear All
            </button>
          )}
        </div>
        <button onClick={build} disabled={loading || !xCol || !validation.valid} style={S.btn}>
          {loading ? "Building…" : "📊 Build Chart"}
        </button>
      </div>
      {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "rgba(239,68,68,.05)", borderRadius: 8 }}>{error}</div>}
      
      {/* Multi-Column Hints */}
      {selectedCols.length === 2 && (
        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 12, padding: "6px 12px", background: "rgba(16,185,129,.05)", borderRadius: 8 }}>
          💡 Recommended for: Scatter, Bubble, Hexbin charts
        </div>
      )}
      {selectedCols.length === 3 && (
        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 12, padding: "6px 12px", background: "rgba(16,185,129,.05)", borderRadius: 8 }}>
          💡 Recommended for: 3D Scatter, Bubble (with size), Surface charts
        </div>
      )}
      {selectedCols.length >= 4 && (
        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 12, padding: "6px 12px", background: "rgba(16,185,129,.05)", borderRadius: 8 }}>
          💡 Recommended for: Parallel Coordinates, Correlogram, Heatmap
        </div>
      )}
      
      {/* Contextual Hints */}
      {chartType === "Pie" && (
        <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 12, padding: "6px 12px", background: "rgba(251,191,36,.05)", borderRadius: 8 }}>
          💡 Pie: X = category, Y = numeric value
        </div>
      )}
      {["Waterfall", "Funnel"].includes(chartType) && (
        <div style={{ fontSize: 12, color: "#0ea5e9", marginBottom: 12, padding: "6px 12px", background: "rgba(14,165,233,.05)", borderRadius: 8 }}>
          💡 {chartType}: X = labels, Y = numeric values
        </div>
      )}
      {["Radar", "Heatmap"].includes(chartType) && (
        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 12, padding: "6px 12px", background: "rgba(16,185,129,.05)", borderRadius: 8 }}>
          💡 {chartType}: uses all numeric columns automatically
        </div>
      )}
      {chartType === "Marimekko" && (
        <div style={{ fontSize: 12, color: "#a855f7", marginBottom: 12, padding: "6px 12px", background: "rgba(168,85,247,.05)", borderRadius: 8 }}>
          💡 Marimekko: X = category, Y = numeric — bar width = share of total
        </div>
      )}
      {chartType === "Table with Charts" && (
        <div style={{ fontSize: 12, color: "#06b6d4", marginBottom: 12, padding: "6px 12px", background: "rgba(6,182,212,.05)", borderRadius: 8 }}>
          💡 Table with Charts: shows data table with sparklines — no column selection needed
        </div>
      )}
      {chartType === "3D Area" && (
        <div style={{ fontSize: 12, color: "#f97316", marginBottom: 12, padding: "6px 12px", background: "rgba(249,115,22,.05)", borderRadius: 8 }}>
          💡 3D Area: uses first 3 numeric columns as X, Y, Z axes automatically
        </div>
      )}
      {chartType === "Sankey" && (
        <div style={{ fontSize: 12, color: "#6366f1", marginBottom: 12, padding: "6px 12px", background: "rgba(99,102,241,.05)", borderRadius: 8 }}>
          🔀 Sankey/Alluvial: X = source category, Y = target category — shows flow between groups
        </div>
      )}
      {chartType === "Beeswarm" && (
        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 12, padding: "6px 12px", background: "rgba(16,185,129,.05)", borderRadius: 8 }}>
          🐝 Beeswarm: X = category (optional), Y = numeric — shows every data point without overlap
        </div>
      )}
      {chartType === "Bullet" && (
        <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 12, padding: "6px 12px", background: "rgba(245,158,11,.05)", borderRadius: 8 }}>
          🎯 Bullet Chart: compact KPI view — actual vs target vs performance range for all numeric columns
        </div>
      )}
      {chartType === "Small Multiples" && (
        <div style={{ fontSize: 12, color: "#8b5cf6", marginBottom: 12, padding: "6px 12px", background: "rgba(139,92,246,.05)", borderRadius: 8 }}>
          🔲 Small Multiples: X = category (facet), Y = numeric — side-by-side comparison grid
        </div>
      )}
      {chartType === "Rose" && (
        <div style={{ fontSize: 12, color: "#ec4899", marginBottom: 12, padding: "6px 12px", background: "rgba(236,72,153,.05)", borderRadius: 8 }}>
          🌹 Rose/Polar Area: X = category — visually appealing alternative to pie charts
        </div>
      )}
      {chartType === "Time Series" && (
        <div style={{ fontSize: 12, color: "#0ea5e9", marginBottom: 12, padding: "6px 12px", background: "rgba(14,165,233,.05)", borderRadius: 8 }}>
          📈 Time Series: X = time/index column — multi-layered with range slider for large datasets
        </div>
      )}
      {chartType === "Infographic" && (
        <div style={{ fontSize: 12, color: "#a855f7", marginBottom: 12, padding: "6px 12px", background: "rgba(168,85,247,.05)", borderRadius: 8 }}>
          📰 Infographic: storytelling summary — KPI cards with delta indicators for all numeric columns
        </div>
      )}
      {chartType === "Network Graph" && (
        <div style={{ fontSize: 12, color: "#6366f1", marginBottom: 12, padding: "6px 12px", background: "rgba(99,102,241,.05)", borderRadius: 8 }}>
          🕸 Network Graph: X = source node, Y = target node (category columns) — node size = connection count
        </div>
      )}
      {chartType === "Gantt" && (
        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 12, padding: "6px 12px", background: "rgba(16,185,129,.05)", borderRadius: 8 }}>
          📅 Gantt: X = task/name column, Y = duration/numeric — auto-detects start/end columns if present
        </div>
      )}
      {chartType === "Parallel Coordinates" && (
        <div style={{ fontSize: 12, color: "#6366f1", marginBottom: 12, padding: "6px 12px", background: "rgba(99,102,241,.05)", borderRadius: 8 }}>
          📐 Parallel Coordinates: uses all numeric columns — each line = one record, great for high-dimensional data
        </div>
      )}
      {chartType === "Hexbin" && (
        <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 12, padding: "6px 12px", background: "rgba(245,158,11,.05)", borderRadius: 8 }}>
          🔷 Hexbin: X + Y = two numeric columns — density heatmap, better than scatter for large datasets
        </div>
      )}
      {chartType === "Ridgeline" && (
        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 12, padding: "6px 12px", background: "rgba(16,185,129,.05)", borderRadius: 8 }}>
          🏔 Ridgeline: X = category, Y = numeric — overlapping distributions per group (Joy Plot)
        </div>
      )}
      {chartType === "PCA" && (
        <div style={{ fontSize: 12, color: "#a855f7", marginBottom: 12, padding: "6px 12px", background: "rgba(168,85,247,.05)", borderRadius: 8 }}>
          🧬 PCA 2D Projection: uses all numeric columns — dimensionality reduction scatter plot
        </div>
      )}
      {chartType === "SHAP" && (
        <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, padding: "6px 12px", background: "rgba(239,68,68,.05)", borderRadius: 8 }}>
          🤖 SHAP/Feature Importance: Y = target column — trains Random Forest and shows feature importances
        </div>
      )}
      {chartType === "Choropleth" && (
        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 12, padding: "6px 12px", background: "rgba(16,185,129,.05)", borderRadius: 8 }}>
          🌍 Choropleth: X = country/region names, Y = numeric value — world map colored by value
        </div>
      )}
      
      {chart && (
        <div style={S.chartCard}>
          <Safe><Chart figure={chart} height={420} /></Safe>
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
