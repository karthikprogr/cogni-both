import { useState, useEffect, useMemo } from "react";
import { BarChart3, Search, X } from "lucide-react";
import { CHART_TYPES } from "../config/chartTypes";

/**
 * ChartTypeSelector component for Charts page
 * A categorized dropdown with search functionality for selecting from 150+ chart types
 * 
 * @param {Object} props
 * @param {string|null} props.selected - Currently selected chart type ID
 * @param {Function} props.onChange - Callback fired when chart type is selected: (chartTypeId: string) => void
 * @param {boolean} props.disabled - Whether the selector is disabled
 */
export default function ChartTypeSelector({ selected = null, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredType, setHoveredType] = useState(null);

  // Get selected chart type details
  const selectedType = useMemo(() => {
    if (!selected) return null;
    for (const category of CHART_TYPES) {
      const type = category.types.find(t => t.id === selected);
      if (type) return { ...type, category: category.category };
    }
    return null;
  }, [selected]);

  // Filter chart types based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CHART_TYPES;
    
    const query = searchQuery.toLowerCase();
    return CHART_TYPES.map(category => ({
      ...category,
      types: category.types.filter(type => 
        type.name.toLowerCase().includes(query) ||
        type.description.toLowerCase().includes(query) ||
        category.category.toLowerCase().includes(query)
      )
    })).filter(category => category.types.length > 0);
  }, [searchQuery]);

  // Count total filtered results
  const totalResults = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.types.length, 0);
  }, [filteredCategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.chart-type-selector')) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (chartTypeId) => {
    if (disabled) return;
    onChange(chartTypeId);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const displayText = selectedType ? selectedType.name : "Select a chart type...";

  return (
    <div className="chart-type-selector" style={{ position: "relative", width: "100%" }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
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
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          textAlign: "left",
          opacity: disabled ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.target.style.borderColor = "rgba(255,255,255,.2)";
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,.1)";
        }}
      >
        <BarChart3 size={16} style={{ color: "#6366f1", flexShrink: 0 }} />
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
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#18181b",
            border: "1px solid rgba(255,255,255,.15)",
            borderRadius: 8,
            maxHeight: 500,
            overflowY: "hidden",
            zIndex: 1000,
            boxShadow: "0 10px 40px rgba(0,0,0,.5)",
            animation: "slideDown 0.15s ease-out",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Search Header */}
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid rgba(255,255,255,.08)",
              position: "sticky",
              top: 0,
              background: "#18181b",
              zIndex: 1
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#71717a",
                  pointerEvents: "none"
                }}
              />
              <input
                type="text"
                placeholder="Search chart types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 32px 8px 32px",
                  background: "#09090b",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 6,
                  color: "#e4e4e7",
                  fontSize: 12,
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(99,102,241,.5)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,.1)";
                }}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    color: "#71717a"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#e4e4e7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#71717a";
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {/* Results Count */}
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "#71717a",
                textAlign: "center"
              }}
            >
              {searchQuery ? `${totalResults} results` : `${totalResults} chart types available`}
            </div>
          </div>

          {/* Chart Types List */}
          <div
            style={{
              overflowY: "auto",
              maxHeight: 400,
              padding: "8px 0"
            }}
          >
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category.category}>
                  {/* Category Header */}
                  <div
                    style={{
                      padding: "10px 14px",
                      fontSize: 11,
                      color: "#71717a",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: "rgba(255,255,255,.02)",
                      borderTop: "1px solid rgba(255,255,255,.05)",
                      borderBottom: "1px solid rgba(255,255,255,.05)",
                      position: "sticky",
                      top: 0,
                      backdropFilter: "blur(8px)"
                    }}
                  >
                    {category.category}
                    <span style={{ marginLeft: 8, color: "#52525b" }}>
                      ({category.types.length})
                    </span>
                  </div>

                  {/* Chart Types in Category */}
                  {category.types.map((type) => {
                    const isSelected = type.id === selected;
                    const isHovered = type.id === hoveredType;

                    return (
                      <div
                        key={type.id}
                        onClick={() => handleSelect(type.id)}
                        onMouseEnter={() => setHoveredType(type.id)}
                        onMouseLeave={() => setHoveredType(null)}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          fontSize: 13,
                          color: isSelected ? "#818cf8" : "#e4e4e7",
                          background: isSelected
                            ? "rgba(99,102,241,.1)"
                            : isHovered
                            ? "rgba(255,255,255,.05)"
                            : "transparent",
                          borderLeft: isSelected ? "3px solid #6366f1" : "3px solid transparent",
                          transition: "all 0.15s ease",
                          fontWeight: isSelected ? 600 : 400,
                          position: "relative"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {isSelected && <span style={{ fontSize: 12 }}>✓</span>}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{type.name}</div>
                            {/* Show description on hover or if selected */}
                            {(isHovered || isSelected) && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#71717a",
                                  marginTop: 4,
                                  lineHeight: 1.4
                                }}
                              >
                                {type.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              // No Results
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#71717a",
                  fontSize: 13
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>No results found</div>
                <div style={{ fontSize: 11 }}>
                  Try adjusting your search query
                </div>
              </div>
            )}
          </div>
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
        
        /* Custom Scrollbar */
        .chart-type-selector ::-webkit-scrollbar {
          width: 8px;
        }
        
        .chart-type-selector ::-webkit-scrollbar-track {
          background: #18181b;
        }
        
        .chart-type-selector ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.15);
          border-radius: 4px;
        }
        
        .chart-type-selector ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,.25);
        }
      `}</style>
    </div>
  );
}
