import { useState, useEffect } from "react";
import { Database } from "lucide-react";

/**
 * DatasetSelector component for Charts page
 * A controlled dropdown component that allows dataset selection without switching the active dataset
 * 
 * @param {Object} props
 * @param {Array<string>} props.datasets - Array of available dataset names
 * @param {string|null} props.selected - Currently selected dataset name
 * @param {Function} props.onChange - Callback fired when dataset is selected: (datasetName: string) => void
 * @param {boolean} props.disabled - Whether the selector is disabled
 */
export default function ChartDatasetSelector({ datasets = [], selected = null, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.chart-dataset-selector')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (datasetName) => {
    if (disabled) return;
    onChange(datasetName);
    setIsOpen(false);
  };

  const hasDatasets = datasets && datasets.length > 0;
  const displayText = selected || "Select a dataset...";

  return (
    <div className="chart-dataset-selector" style={{ position: "relative", width: "100%" }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && hasDatasets && setIsOpen(!isOpen)}
        disabled={disabled || !hasDatasets}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "#09090b",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 8,
          color: selected ? "#e4e4e7" : "#71717a",
          fontSize: 13,
          fontWeight: 500,
          cursor: disabled || !hasDatasets ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          textAlign: "left",
          opacity: disabled ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (!disabled && hasDatasets) {
            e.target.style.borderColor = "rgba(255,255,255,.2)";
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,.1)";
        }}
      >
        <Database size={16} style={{ color: "#6366f1", flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayText}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            color: "#71717a"
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && hasDatasets && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#18181b",
            border: "1px solid rgba(255,255,255,.15)",
            borderRadius: 8,
            maxHeight: 280,
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 10px 40px rgba(0,0,0,.5)",
            animation: "slideDown 0.15s ease-out"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 14px",
              fontSize: 11,
              color: "#71717a",
              fontWeight: 600,
              borderBottom: "1px solid rgba(255,255,255,.08)",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            Select Dataset
          </div>

          {/* Dataset List */}
          {datasets.map((datasetName) => {
            const isSelected = datasetName === selected;
            return (
              <div
                key={datasetName}
                onClick={() => handleSelect(datasetName)}
                style={{
                  padding: "12px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: isSelected ? "#818cf8" : "#e4e4e7",
                  background: isSelected ? "rgba(99,102,241,.1)" : "transparent",
                  borderLeft: isSelected ? "3px solid #6366f1" : "3px solid transparent",
                  borderBottom: "1px solid rgba(255,255,255,.04)",
                  transition: "all 0.15s ease",
                  fontWeight: isSelected ? 600 : 400
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.background = "rgba(255,255,255,.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.background = "transparent";
                  }
                }}
              >
                {isSelected && "✓ "}
                {datasetName}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State - No Datasets Available */}
      {!hasDatasets && !disabled && (
        <div
          style={{
            marginTop: 8,
            padding: "12px 14px",
            background: "rgba(239, 68, 68, 0.05)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: 8,
            color: "#f87171",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>No datasets available. Please upload a dataset first.</span>
        </div>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
