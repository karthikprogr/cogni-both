import { useState, useEffect, useCallback, memo } from "react";
import { api } from "../api/client";
import { Component } from "react";
import { CHART_TYPES, getChartTypeCount } from "../config/chartTypes";
import ChartDatasetSelector from "../components/ChartDatasetSelector";

// Error Boundary
class Safe extends Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return <div style={{ padding: 12, color: "#f87171", fontSize: 12 }}>Error: {this.state.err.message}</div>;
    return this.props.children;
  }
}

// Chart Component (reused from Dashboard.jsx)
const Chart = memo(function Chart({ figure, height = 500 }) {
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

// Styles following Dashboard.jsx patterns
const S = {
  page: { 
    padding: "20px 24px", 
    background: "#09090b", 
    minHeight: "100vh", 
    color: "#e4e4e7" 
  },
  header: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 24 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 700, 
    color: "#fff" 
  },
  subtitle: { 
    fontSize: 12, 
    color: "#71717a", 
    marginTop: 2 
  },
  card: { 
    background: "#18181b", 
    border: "1px solid rgba(255,255,255,.08)", 
    borderRadius: 12, 
    padding: 16 
  },
  button: { 
    padding: "8px 16px", 
    borderRadius: 8, 
    border: "none", 
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)", 
    color: "#fff", 
    fontSize: 13, 
    fontWeight: 600, 
    cursor: "pointer",
    transition: "all .2s"
  },
  buttonDisabled: {
    padding: "8px 16px", 
    borderRadius: 8, 
    border: "none", 
    background: "#27272a", 
    color: "#52525b", 
    fontSize: 13, 
    fontWeight: 600, 
    cursor: "not-allowed"
  },
  input: { 
    background: "#09090b", 
    border: "1px solid rgba(255,255,255,.1)", 
    borderRadius: 8, 
    padding: "8px 12px", 
    color: "#e4e4e7", 
    fontSize: 13, 
    width: "100%" 
  },
  select: {
    background: "#09090b", 
    border: "1px solid rgba(255,255,255,.1)", 
    borderRadius: 8, 
    padding: "8px 12px", 
    color: "#e4e4e7", 
    fontSize: 13, 
    width: "100%",
    cursor: "pointer"
  },
  error: {
    padding: 12,
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: 8,
    color: "#f87171",
    fontSize: 13,
    marginTop: 12
  },
  empty: { 
    textAlign: "center", 
    padding: "60px 20px", 
    color: "#52525b", 
    fontSize: 14 
  },
  controlsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 16,
    marginBottom: 16,
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr"
    }
  },
  controlPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  displayArea: {
    minHeight: 400
  }
};

// DisplayModeToggle Component
const DisplayModeToggle = memo(function DisplayModeToggle({ mode, onChange, disabled = false }) {
  const modes = [
    { value: 'single', label: 'Single Chart', icon: '📊' },
    { value: 'multi', label: 'Multi-Chart', icon: '📈' }
  ];

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {modes.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => !disabled && onChange(value)}
          disabled={disabled}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: disabled ? "not-allowed" : "pointer",
            background: mode === value ? "rgba(99,102,241,.15)" : "rgba(255,255,255,.04)",
            border: `1px solid ${mode === value ? "rgba(99,102,241,.3)" : "rgba(255,255,255,.07)"}`,
            color: mode === value ? "#818cf8" : disabled ? "#3f3f46" : "#71717a",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all .2s",
            opacity: disabled ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!disabled && mode !== value) {
              e.currentTarget.style.borderColor = "rgba(99,102,241,.2)";
              e.currentTarget.style.color = "#a1a1aa";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && mode !== value) {
              e.currentTarget.style.borderColor = "rgba(255,255,255,.07)";
              e.currentTarget.style.color = "#71717a";
            }
          }}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
});

function Charts() {
  // Selection state
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState(null);
  
  // Display state
  const [charts, setCharts] = useState([]);
  const [displayMode, setDisplayMode] = useState('single'); // 'single' | 'multi'
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dataset metadata
  const [datasetInfo, setDatasetInfo] = useState(null);

  // Fetch available datasets on mount
  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = useCallback(async () => {
    try {
      const response = await api.get("/data/datasets");
      // Extract dataset names from the response
      const datasets = response.data?.datasets || [];
      const datasetNames = datasets.map(d => d.name || d);
      setAvailableDatasets(datasetNames);
    } catch (err) {
      console.error("Failed to fetch datasets:", err);
      setError("Failed to load datasets. Please try again.");
    }
  }, []);

  // Handler methods (to be implemented in subsequent tasks)
  const handleDatasetChange = useCallback((datasetName) => {
    setSelectedDataset(datasetName);
    setSelectedColumns([]);
    setError(null);
    // Column fetching will be implemented in later tasks
  }, []);

  const handleChartTypeChange = useCallback((chartType) => {
    setSelectedChartType(chartType);
    setError(null);
  }, []);

  const handleColumnSelection = useCallback((newColumns) => {
    setSelectedColumns(newColumns);
    setError(null);
  }, []);

  const handleGenerateChart = useCallback(async () => {
    // Chart generation will be implemented in later tasks
    setLoading(true);
    setError(null);
    // Placeholder for now
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [selectedDataset, selectedChartType, selectedColumns]);

  const handleClearCharts = useCallback(() => {
    setCharts([]);
    setSelectedDataset(null);
    setSelectedChartType(null);
    setSelectedColumns([]);
    setError(null);
  }, []);

  const handleDisplayModeChange = useCallback((newMode) => {
    setDisplayMode(newMode);
  }, []);

  return (
    <div style={S.page}>
      {/* Page Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Charts</h1>
          <p style={S.subtitle}>Generate custom visualizations from your data · {getChartTypeCount()}+ chart types</p>
        </div>
        
        {/* Display Mode Toggle */}
        <DisplayModeToggle 
          mode={displayMode}
          onChange={handleDisplayModeChange}
          disabled={charts.length === 0}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div style={S.error}>
          {error}
        </div>
      )}

      {/* Main Content Area - Controls and Display */}
      <div style={S.card}>
        {/* Dataset Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Dataset
          </label>
          <ChartDatasetSelector
            datasets={availableDatasets}
            selected={selectedDataset}
            onChange={handleDatasetChange}
            disabled={loading}
          />
        </div>

        {/* Placeholder for other controls */}
        {selectedDataset ? (
          <div style={{ ...S.empty, padding: "40px 20px" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 600, color: "#a1a1aa" }}>Dataset selected: {selectedDataset}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Chart type and column selectors will be added in subsequent tasks</div>
          </div>
        ) : (
          <div style={S.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
            <div style={{ fontWeight: 600, color: "#a1a1aa" }}>Select a dataset to begin</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Choose your data, chart type, and columns to generate visualizations</div>
          </div>
        )}
      </div>

      {/* Display Loading State */}
      {loading && (
        <div style={{ ...S.card, marginTop: 16, textAlign: "center", padding: 24 }}>
          <div style={{ color: "#6366f1", fontSize: 14 }}>Generating chart...</div>
        </div>
      )}
    </div>
  );
}

export default Charts;
