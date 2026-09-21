import { useState, useEffect, useCallback, memo } from "react";
import { api, vizApi } from "../api/client";
import { Component } from "react";
import { CHART_TYPES, getChartTypeCount } from "../config/chartTypes";
import ChartDatasetSelector from "../components/ChartDatasetSelector";
import ChartTypeSelector from "../components/ChartTypeSelector";
import ColumnSelector from "../components/ColumnSelector";
import { validateColumnSelection } from "../lib/chartValidation";

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

// ChartCard Component - wraps individual charts with metadata
const ChartCard = memo(function ChartCard({ 
  chart, 
  compact = false, 
  onExportPNG, 
  onExportHTML 
}) {
  const cardHeight = compact ? 350 : 500;
  const chartHeight = compact ? 300 : 450;
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div style={{
      ...S.card,
      display: "flex",
      flexDirection: "column",
      height: cardHeight
    }}>
      {/* Card Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: "1px solid rgba(255,255,255,.05)"
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#e4e4e7",
            margin: 0,
            marginBottom: 2
          }}>
            {chart.title || "Chart"}
          </h3>
          <p style={{
            fontSize: 11,
            color: "#71717a",
            margin: 0
          }}>
            {chart.chart_type}
          </p>
        </div>
        
        {/* Export Actions */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onExportPNG && onExportPNG(chart)}
            title="Export as PNG"
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,.1)",
              background: "rgba(255,255,255,.04)",
              color: "#a1a1aa",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all .2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.08)";
              e.currentTarget.style.borderColor = "rgba(99,102,241,.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.1)";
            }}
          >
            📸 PNG
          </button>
          <button
            onClick={() => onExportHTML && onExportHTML(chart)}
            title="Export as HTML"
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,.1)",
              background: "rgba(255,255,255,.04)",
              color: "#a1a1aa",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all .2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.08)";
              e.currentTarget.style.borderColor = "rgba(99,102,241,.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.1)";
            }}
          >
            🌐 HTML
          </button>
        </div>
      </div>

      {/* Chart Display */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Chart figure={chart.figure} height={chartHeight} />
      </div>

      {/* Chart Metadata Footer */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 12,
        paddingTop: 8,
        borderTop: "1px solid rgba(255,255,255,.05)",
        fontSize: 11,
        color: "#71717a"
      }}>
        {chart.dataset && (
          <span>
            <strong style={{ color: "#a1a1aa" }}>Dataset:</strong> {chart.dataset}
          </span>
        )}
        {chart.columns && chart.columns.length > 0 && (
          <span>
            <strong style={{ color: "#a1a1aa" }}>Columns:</strong> {chart.columns.join(", ")}
          </span>
        )}
        {chart.generation_time && (
          <span>
            <strong style={{ color: "#a1a1aa" }}>Generated in:</strong> {chart.generation_time.toFixed(1)}s
          </span>
        )}
        {chart.timestamp && (
          <span>
            <strong style={{ color: "#a1a1aa" }}>Created:</strong> {formatTimestamp(chart.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
});

// ChartDisplay Component - container for chart rendering based on display mode
const ChartDisplay = memo(function ChartDisplay({ 
  charts, 
  displayMode, 
  onExportPNG, 
  onExportHTML 
}) {
  // Empty state
  if (!charts || charts.length === 0) {
    return (
      <div style={{
        ...S.card,
        ...S.empty,
        padding: "60px 20px"
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
          No charts generated yet
        </div>
        <div style={{ fontSize: 12, color: "#71717a" }}>
          Select your dataset, chart type, and columns, then click Generate Chart
        </div>
      </div>
    );
  }

  // Single chart mode - show only the most recent chart
  if (displayMode === 'single') {
    const latestChart = charts[charts.length - 1];
    return (
      <div style={{ marginTop: 16 }}>
        <ChartCard 
          chart={latestChart}
          compact={false}
          onExportPNG={onExportPNG}
          onExportHTML={onExportHTML}
        />
      </div>
    );
  }

  // Multi-chart mode - show all charts in responsive grid
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(min(500px, 100%), 1fr))",
      gap: 16,
      marginTop: 16
    }}>
      {charts.map((chart, index) => (
        <ChartCard 
          key={`chart-${index}-${chart.timestamp || Date.now()}`}
          chart={chart}
          compact={true}
          onExportPNG={onExportPNG}
          onExportHTML={onExportHTML}
        />
      ))}
    </div>
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
  const [generating, setGenerating] = useState(false);
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

  // Handler methods
  const handleDatasetChange = useCallback(async (datasetName) => {
    setSelectedDataset(datasetName);
    setSelectedColumns([]);
    setError(null);
    setLoading(true);
    
    try {
      // Switch to the selected dataset
      await api.post("/data/datasets/switch", null, { params: { name: datasetName } });
      
      // Fetch dataset info including columns
      const response = await api.get("/data/info");
      const info = response.data;
      
      // Update columns state
      setColumns(info.column_names || []);
      
      // Store dataset metadata
      setDatasetInfo({
        rows: info.rows,
        columns: info.columns,
        numericColumns: info.numeric_columns || [],
        categoricalColumns: info.categorical_columns || [],
        columnsInfo: info.columns_info || [],
        dtypes: info.dtypes || {},
        memoryMb: info.memory_mb
      });
    } catch (err) {
      console.error("Failed to fetch dataset info:", err);
      setError(
        err.response?.data?.detail || 
        "Failed to load dataset information. Please try again."
      );
      // Reset on error
      setColumns([]);
      setDatasetInfo(null);
    } finally {
      setLoading(false);
    }
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
    if (!selectedDataset || !selectedChartType || selectedColumns.length === 0) {
      setError("Please select a dataset, chart type, and at least one column");
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    try {
      // Prepare request based on number of columns
      const requestData = {
        chart_type: selectedChartType,
        title: `${selectedChartType} - ${selectedDataset}`,
      };
      
      // For single/two column charts, use x_col and y_col
      if (selectedColumns.length === 1) {
        requestData.x_col = selectedColumns[0];
      } else if (selectedColumns.length === 2) {
        requestData.x_col = selectedColumns[0];
        requestData.y_col = selectedColumns[1];
      } else {
        // For multi-column charts, pass all columns
        requestData.columns = selectedColumns;
      }
      
      // Make API call using vizApi.custom
      const response = await vizApi.custom(requestData);
      
      // Extract figure from response
      const figure = response.data?.figure || response.data;
      
      if (!figure) {
        throw new Error("No chart data received from server");
      }
      
      // Create chart object with metadata (matching ChartCard expected structure)
      const newChart = {
        id: Date.now(),
        figure,
        chart_type: selectedChartType,  // ChartCard expects chart_type
        title: `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} - ${selectedDataset}`,  // ChartCard expects title
        dataset: selectedDataset,
        columns: selectedColumns,
        timestamp: new Date().toISOString(),
      };
      
      // Update charts based on display mode
      if (displayMode === 'single') {
        // Replace current chart
        setCharts([newChart]);
      } else {
        // Add to multi-chart view
        setCharts(prev => [...prev, newChart]);
      }
      
    } catch (err) {
      console.error("Chart generation failed:", err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to generate chart. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  }, [selectedDataset, selectedChartType, selectedColumns, displayMode]);

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

  const handleExportPNG = useCallback(async (chart) => {
    // Export implementation will be added in task 9.1
    console.log('Export PNG:', chart);
  }, []);

  const handleExportHTML = useCallback(async (chart) => {
    // Export implementation will be added in task 9.2
    console.log('Export HTML:', chart);
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

        {/* Chart Type Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Chart Type
          </label>
          <ChartTypeSelector
            selected={selectedChartType}
            onChange={handleChartTypeChange}
            disabled={loading || !selectedDataset}
          />
        </div>

        {/* Column Selector and Generate Button */}
        {loading && selectedDataset && !datasetInfo ? (
          <div style={{ ...S.empty, padding: "40px 20px" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div style={{ fontWeight: 600, color: "#6366f1" }}>Loading dataset information...</div>
            <div style={{ fontSize: 12, marginTop: 4, color: "#71717a" }}>Fetching columns and metadata</div>
          </div>
        ) : selectedDataset && selectedChartType && datasetInfo ? (
          <>
            {/* Column Selector */}
            <div style={{ marginBottom: 16 }}>
              <ColumnSelector
                columns={columns}
                datasetInfo={datasetInfo}
                selectedColumns={selectedColumns}
                onChange={handleColumnSelection}
                chartType={selectedChartType}
                disabled={loading || generating}
              />
            </div>

            {/* Generate Chart Button */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <button
                onClick={handleGenerateChart}
                disabled={loading || generating || selectedColumns.length === 0}
                style={{
                  ...(selectedColumns.length > 0 && !loading && !generating ? S.button : S.buttonDisabled),
                  paddingLeft: 24,
                  paddingRight: 24,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  if (selectedColumns.length > 0 && !loading && !generating) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {generating ? (
                  <>
                    <span style={{ 
                      display: "inline-block", 
                      animation: "spin 1s linear infinite",
                      fontSize: 16 
                    }}>⏳</span>
                    <span>Generating Chart...</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 16 }}>✨</span>
                    <span>Generate Chart</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : selectedDataset && datasetInfo ? (
          <div style={{ ...S.empty, padding: "40px 20px", color: "#71717a" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ fontWeight: 600, color: "#a1a1aa" }}>Dataset loaded successfully</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {datasetInfo.rows.toLocaleString()} rows · {columns.length} columns available
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Select a chart type to continue</div>
          </div>
        ) : selectedDataset ? (
          <div style={{ ...S.empty, padding: "40px 20px", color: "#71717a" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ fontWeight: 600, color: "#a1a1aa" }}>Select a chart type</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Choose from 150+ chart types organized by category</div>
          </div>
        ) : (
          <div style={S.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
            <div style={{ fontWeight: 600, color: "#a1a1aa" }}>Select a dataset to begin</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Choose your data, chart type, and columns to generate visualizations</div>
          </div>
        )}

        {/* Add spin animation for loading spinner */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {/* Display Loading State */}
      {loading && (
        <div style={{ ...S.card, marginTop: 16, textAlign: "center", padding: 24 }}>
          <div style={{ color: "#6366f1", fontSize: 14 }}>Generating chart...</div>
        </div>
      )}

      {/* Chart Display Area */}
      <ChartDisplay 
        charts={charts}
        displayMode={displayMode}
        onExportPNG={handleExportPNG}
        onExportHTML={handleExportHTML}
      />
    </div>
  );
}

export default Charts;
