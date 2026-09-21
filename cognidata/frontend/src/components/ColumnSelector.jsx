import { useState, useEffect, useMemo } from "react";
import { getColumnRequirements, validateColumnSelection, COLUMN_TYPES } from "../lib/chartValidation";
import { Check, AlertCircle, Grid3x3, Type, Calendar, Hash } from "lucide-react";

/**
 * ColumnSelector component for Charts page
 * Multi-select column selector with type indicators and validation
 * 
 * @param {Object} props
 * @param {Array<string>} props.columns - Available column names
 * @param {Object} props.datasetInfo - Dataset metadata with column type information
 * @param {Array<string>} props.selectedColumns - Currently selected column names
 * @param {Function} props.onChange - Callback fired when selection changes: (columns: string[]) => void
 * @param {string|null} props.chartType - Selected chart type ID
 * @param {boolean} props.disabled - Whether the selector is disabled
 */
export default function ColumnSelector({ 
  columns = [], 
  datasetInfo = null,
  selectedColumns = [], 
  onChange, 
  chartType = null,
  disabled = false 
}) {
  const [hoveredColumn, setHoveredColumn] = useState(null);

  // Get column requirements for the selected chart type
  const requirements = useMemo(() => {
    return chartType ? getColumnRequirements(chartType) : null;
  }, [chartType]);

  // Map column names to their types
  const columnTypes = useMemo(() => {
    if (!datasetInfo) return {};
    
    const types = {};
    const numericCols = new Set(datasetInfo.numericColumns || []);
    const categoricalCols = new Set(datasetInfo.categoricalColumns || []);
    
    // Check dtypes if available
    const dtypes = datasetInfo.dtypes || {};
    
    columns.forEach(col => {
      // First check if we have explicit dtype information
      if (dtypes[col]) {
        const dtype = dtypes[col].toLowerCase();
        if (dtype.includes('datetime') || dtype.includes('date')) {
          types[col] = COLUMN_TYPES.DATETIME;
        } else if (dtype.includes('int') || dtype.includes('float') || numericCols.has(col)) {
          types[col] = COLUMN_TYPES.NUMERIC;
        } else {
          types[col] = COLUMN_TYPES.CATEGORICAL;
        }
      } else if (numericCols.has(col)) {
        types[col] = COLUMN_TYPES.NUMERIC;
      } else if (categoricalCols.has(col)) {
        types[col] = COLUMN_TYPES.CATEGORICAL;
      } else {
        types[col] = COLUMN_TYPES.ANY;
      }
    });
    
    return types;
  }, [columns, datasetInfo]);

  // Get selected columns with their type information
  const selectedColumnsWithTypes = useMemo(() => {
    return selectedColumns.map(col => ({
      name: col,
      type: columnTypes[col] || COLUMN_TYPES.ANY
    }));
  }, [selectedColumns, columnTypes]);

  // Validate current selection
  const validation = useMemo(() => {
    if (!chartType || selectedColumns.length === 0) {
      return { valid: true, message: null };
    }
    return validateColumnSelection(chartType, selectedColumnsWithTypes);
  }, [chartType, selectedColumnsWithTypes]);

  // Check which columns are compatible with current selection
  const columnCompatibility = useMemo(() => {
    if (!chartType || !requirements) return {};
    
    const compatibility = {};
    const currentCount = selectedColumns.length;
    
    columns.forEach(col => {
      const colType = columnTypes[col] || COLUMN_TYPES.ANY;
      
      // If max columns reached and column not already selected, disable it
      if (requirements.max !== null && currentCount >= requirements.max && !selectedColumns.includes(col)) {
        compatibility[col] = { compatible: false, reason: `Maximum ${requirements.max} columns` };
        return;
      }
      
      // Check if column type matches requirements for the next position
      if (requirements.types && requirements.types.length > 0) {
        const nextPosition = currentCount;
        const requiredType = requirements.types[nextPosition];
        
        // If no specific type requirement at this position, allow any
        if (!requiredType || requiredType === COLUMN_TYPES.ANY) {
          compatibility[col] = { compatible: true, reason: null };
          return;
        }
        
        // Check type compatibility
        if (requiredType === COLUMN_TYPES.NUMERIC && colType !== COLUMN_TYPES.NUMERIC) {
          compatibility[col] = { compatible: false, reason: 'Must be numeric' };
          return;
        }
        
        if (requiredType === COLUMN_TYPES.CATEGORICAL && colType === COLUMN_TYPES.NUMERIC) {
          compatibility[col] = { compatible: false, reason: 'Must be categorical' };
          return;
        }
        
        if (requiredType === COLUMN_TYPES.DATETIME && colType !== COLUMN_TYPES.DATETIME) {
          compatibility[col] = { compatible: false, reason: 'Must be datetime' };
          return;
        }
      }
      
      compatibility[col] = { compatible: true, reason: null };
    });
    
    return compatibility;
  }, [chartType, requirements, selectedColumns, columns, columnTypes]);

  // Handle column toggle
  const handleToggleColumn = (columnName) => {
    if (disabled) return;
    
    const isSelected = selectedColumns.includes(columnName);
    
    if (isSelected) {
      // Remove column
      onChange(selectedColumns.filter(c => c !== columnName));
    } else {
      // Check if we can add this column
      const canAdd = !columnCompatibility[columnName] || columnCompatibility[columnName].compatible;
      if (canAdd) {
        onChange([...selectedColumns, columnName]);
      }
    }
  };

  // Clear all selections
  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  // Get icon for column type
  const getTypeIcon = (type) => {
    switch (type) {
      case COLUMN_TYPES.NUMERIC:
        return <Hash size={12} />;
      case COLUMN_TYPES.CATEGORICAL:
        return <Type size={12} />;
      case COLUMN_TYPES.DATETIME:
        return <Calendar size={12} />;
      default:
        return <Grid3x3 size={12} />;
    }
  };

  // Get color for column type
  const getTypeColor = (type) => {
    switch (type) {
      case COLUMN_TYPES.NUMERIC:
        return "#3b82f6"; // blue
      case COLUMN_TYPES.CATEGORICAL:
        return "#8b5cf6"; // purple
      case COLUMN_TYPES.DATETIME:
        return "#10b981"; // green
      default:
        return "#71717a"; // gray
    }
  };

  // Get type label
  const getTypeLabel = (type) => {
    switch (type) {
      case COLUMN_TYPES.NUMERIC:
        return "Numeric";
      case COLUMN_TYPES.CATEGORICAL:
        return "Categorical";
      case COLUMN_TYPES.DATETIME:
        return "Datetime";
      default:
        return "Any";
    }
  };

  if (columns.length === 0) {
    return (
      <div style={{
        padding: "20px",
        textAlign: "center",
        color: "#71717a",
        fontSize: 13,
        background: "rgba(255,255,255,.02)",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,.05)"
      }}>
        <Grid3x3 size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
        <div>No columns available</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12
      }}>
        <div>
          <label style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "#a1a1aa",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Columns
          </label>
          {requirements && (
            <div style={{
              fontSize: 11,
              color: "#71717a",
              marginTop: 4
            }}>
              {requirements.description}
            </div>
          )}
        </div>
        
        {selectedColumns.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={disabled}
            style={{
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 500,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 6,
              color: "#f87171",
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: disabled ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.target.style.background = "rgba(239, 68, 68, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.1)";
            }}
          >
            Clear All ({selectedColumns.length})
          </button>
        )}
      </div>

      {/* Column Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 8,
        maxHeight: 300,
        overflowY: "auto",
        padding: "8px 0",
        marginBottom: 12
      }}>
        {columns.map((col) => {
          const isSelected = selectedColumns.includes(col);
          const colType = columnTypes[col] || COLUMN_TYPES.ANY;
          const compatibility = columnCompatibility[col] || { compatible: true, reason: null };
          const isHovered = hoveredColumn === col;
          const isDisabled = disabled || (!isSelected && !compatibility.compatible);
          
          return (
            <div
              key={col}
              onClick={() => !isDisabled && handleToggleColumn(col)}
              onMouseEnter={() => setHoveredColumn(col)}
              onMouseLeave={() => setHoveredColumn(null)}
              style={{
                padding: "10px 12px",
                background: isSelected 
                  ? "rgba(99,102,241,.12)" 
                  : isHovered && !isDisabled
                  ? "rgba(255,255,255,.05)"
                  : "rgba(255,255,255,.02)",
                border: `1px solid ${
                  isSelected 
                    ? "rgba(99,102,241,.4)" 
                    : isDisabled
                    ? "rgba(255,255,255,.05)"
                    : "rgba(255,255,255,.1)"
                }`,
                borderRadius: 8,
                cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                opacity: isDisabled && !isSelected ? 0.4 : 1,
                position: "relative"
              }}
            >
              {/* Selection Indicator */}
              <div style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: isSelected ? "#6366f1" : "rgba(255,255,255,.1)",
                border: `2px solid ${isSelected ? "#6366f1" : "rgba(255,255,255,.2)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease"
              }}>
                {isSelected && <Check size={10} color="white" strokeWidth={3} />}
              </div>

              {/* Column Name */}
              <div style={{
                fontSize: 13,
                fontWeight: 500,
                color: isSelected ? "#818cf8" : isDisabled ? "#52525b" : "#e4e4e7",
                marginBottom: 6,
                paddingRight: 24,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {col}
              </div>

              {/* Type Badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px",
                background: `${getTypeColor(colType)}22`,
                border: `1px solid ${getTypeColor(colType)}44`,
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                color: getTypeColor(colType)
              }}>
                {getTypeIcon(colType)}
                <span>{getTypeLabel(colType)}</span>
              </div>

              {/* Incompatibility Warning */}
              {!isSelected && !compatibility.compatible && (
                <div style={{
                  fontSize: 10,
                  color: "#f87171",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <AlertCircle size={10} />
                  <span>{compatibility.reason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation Message */}
      {chartType && selectedColumns.length > 0 && (
        <div style={{
          padding: 10,
          borderRadius: 8,
          background: validation.valid 
            ? "rgba(34, 197, 94, 0.1)" 
            : "rgba(239, 68, 68, 0.1)",
          border: `1px solid ${validation.valid ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          fontSize: 12,
          color: validation.valid ? "#4ade80" : "#f87171"
        }}>
          {validation.valid ? (
            <Check size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          ) : (
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          )}
          <div style={{ flex: 1 }}>
            {validation.message}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedColumns.length > 0 && (
        <div style={{
          marginTop: 12,
          padding: 10,
          background: "rgba(255,255,255,.02)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 8,
          fontSize: 12,
          color: "#a1a1aa"
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: "#e4e4e7" }}>
            Selected: {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selectedColumns.map((col, idx) => (
              <div
                key={col}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  background: "rgba(99,102,241,.15)",
                  border: "1px solid rgba(99,102,241,.3)",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "#818cf8"
                }}
              >
                <span style={{ fontWeight: 600 }}>{idx + 1}.</span>
                <span>{col}</span>
                <span style={{ color: getTypeColor(columnTypes[col]) }}>
                  {getTypeIcon(columnTypes[col])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Scrollbar */}
      <style>{`
        .column-selector-grid::-webkit-scrollbar {
          width: 6px;
        }
        
        .column-selector-grid::-webkit-scrollbar-track {
          background: rgba(255,255,255,.02);
          border-radius: 3px;
        }
        
        .column-selector-grid::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.15);
          border-radius: 3px;
        }
        
        .column-selector-grid::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,.25);
        }
      `}</style>
    </div>
  );
}
