import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Database, Loader2, AlertCircle, RefreshCw } from "lucide-react";

// Styles matching the existing Dashboard component theme
const S = {
  container: {
    position: "relative",
    display: "inline-block",
  },
  trigger: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "#18181b",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 8,
    color: "#e4e4e7",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all .2s",
    minWidth: 200,
    userSelect: "none",
  },
  triggerHover: {
    background: "#1f1f23",
    borderColor: "rgba(255,255,255,.12)",
  },
  triggerDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  icon: {
    width: 16,
    height: 16,
    color: "#71717a",
  },
  chevron: {
    width: 14,
    height: 14,
    color: "#71717a",
    transition: "transform .2s",
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    background: "#18181b",
    border: "1px solid rgba(255,255,255,.15)",
    borderRadius: 8,
    maxHeight: 320,
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 10px 40px rgba(0,0,0,.5)",
  },
  label: {
    padding: "8px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  item: {
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: 13,
    color: "#e4e4e7",
    borderBottom: "1px solid rgba(255,255,255,.04)",
    transition: "all .15s",
  },
  itemHover: {
    background: "rgba(255,255,255,.05)",
  },
  itemActive: {
    background: "rgba(99,102,241,.1)",
    borderLeft: "3px solid #6366f1",
    color: "#818cf8",
  },
  itemName: {
    fontWeight: 500,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 11,
    color: "#71717a",
  },
  emptyState: {
    padding: "20px 16px",
    textAlign: "center",
    color: "#52525b",
    fontSize: 12,
  },
  loadingState: {
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    color: "#71717a",
    fontSize: 12,
  },
  errorState: {
    padding: "16px",
    color: "#ef4444",
    fontSize: 12,
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  retryButton: {
    background: "rgba(239,68,68,.1)",
    border: "1px solid rgba(239,68,68,.3)",
    borderRadius: 6,
    color: "#ef4444",
    padding: "4px 8px",
    fontSize: 11,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  networkErrorBadge: {
    background: "rgba(251,146,60,.1)",
    color: "#fb923c",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 500,
    textTransform: "uppercase",
  },
  spinner: {
    width: 14,
    height: 14,
    animation: "spin 1s linear infinite",
  },
};

// Add spinner animation to document if not already present
if (typeof document !== "undefined" && !document.getElementById("spinner-animation")) {
  const style = document.createElement("style");
  style.id = "spinner-animation";
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default function DatasetDropdown({ 
  datasets = [], 
  activeDataset = null, 
  onDatasetSelect,
  loading = false,
  disabled = false,
  error = null,
  networkError = false,
  isRetrying = false,
  canRetry = false,
  onRetry,
  onErrorDismiss
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [triggerHovered, setTriggerHovered] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  // Keyboard navigation state
  const [navigatingWithKeyboard, setNavigatingWithKeyboard] = useState(false);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
        setNavigatingWithKeyboard(true);
      }
      return;
    }

    setNavigatingWithKeyboard(true);

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
        
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex(prev => {
          const next = prev < datasets.length - 1 ? prev + 1 : 0;
          // Scroll item into view
          if (itemRefs.current[next]) {
            itemRefs.current[next].scrollIntoView({ 
              block: 'nearest',
              behavior: 'smooth'
            });
          }
          return next;
        });
        break;
        
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex(prev => {
          const next = prev > 0 ? prev - 1 : datasets.length - 1;
          // Scroll item into view
          if (itemRefs.current[next]) {
            itemRefs.current[next].scrollIntoView({ 
              block: 'nearest', 
              behavior: 'smooth'
            });
          }
          return next;
        });
        break;
        
      case "Enter":
      case " ":
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < datasets.length) {
          handleDatasetSelect(datasets[focusedIndex]);
        }
        break;
        
      case "Home":
        event.preventDefault();
        setFocusedIndex(0);
        if (itemRefs.current[0]) {
          itemRefs.current[0].scrollIntoView({ 
            block: 'nearest', 
            behavior: 'smooth' 
          });
        }
        break;
        
      case "End":
        event.preventDefault();
        const lastIndex = datasets.length - 1;
        setFocusedIndex(lastIndex);
        if (itemRefs.current[lastIndex]) {
          itemRefs.current[lastIndex].scrollIntoView({ 
            block: 'nearest',
            behavior: 'smooth' 
          });
        }
        break;
    }
  }, [isOpen, focusedIndex, datasets]);

  // Handle mouse interactions (reset keyboard navigation)
  const handleMouseMove = useCallback(() => {
    if (navigatingWithKeyboard) {
      setNavigatingWithKeyboard(false);
    }
  }, [navigatingWithKeyboard]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleTriggerClick = () => {
    if (disabled || loading) return;
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      // When opening, set focus to first item or active item
      const activeIndex = datasets.findIndex(d => 
        activeDataset && (
          (typeof activeDataset === 'string' && activeDataset === d.name) ||
          (typeof activeDataset === 'object' && activeDataset.name === d.name)
        )
      );
      setFocusedIndex(activeIndex >= 0 ? activeIndex : 0);
    } else {
      setFocusedIndex(-1);
    }
  };

  const handleDatasetSelect = (dataset) => {
    if (onDatasetSelect) {
      onDatasetSelect(dataset);
    }
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleErrorDismiss = () => {
    if (onErrorDismiss) {
      onErrorDismiss();
    }
  };

  const getTriggerStyle = () => {
    let style = { ...S.trigger };
    if (triggerHovered && !disabled && !loading) {
      style = { ...style, ...S.triggerHover };
    }
    if (disabled) {
      style = { ...style, ...S.triggerDisabled };
    }
    return style;
  };

  const getItemStyle = (index, isActive) => {
    let style = { ...S.item };
    
    if (isActive) {
      style = { ...style, ...S.itemActive };
    }
    
    // Keyboard focus takes priority over mouse hover
    if (navigatingWithKeyboard && focusedIndex === index) {
      style = { 
        ...style, 
        background: isActive ? "rgba(99,102,241,.2)" : "rgba(255,255,255,.1)",
        outline: "2px solid rgba(99,102,241,.5)",
        outlineOffset: "-2px"
      };
    }
    
    return style;
  };

  const getDisplayText = () => {
    if (loading || isRetrying) return "Loading...";
    if (error) return "Error loading";
    if (!activeDataset) return "Select dataset";
    return activeDataset.name || activeDataset;
  };

  const getAriaLabel = () => {
    if (error) return `Dataset selector - Error: ${error.userFriendlyMessage}`;
    if (loading) return "Dataset selector - Loading datasets";
    if (!activeDataset) return "Dataset selector - No dataset selected";
    return `Dataset selector - Current: ${activeDataset.name || activeDataset}`;
  };

  return (
    <div style={S.container} ref={dropdownRef}>
      <div
        ref={triggerRef}
        style={getTriggerStyle()}
        onClick={handleTriggerClick}
        onMouseEnter={() => setTriggerHovered(true)}
        onMouseLeave={() => setTriggerHovered(false)}
        role="combobox"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={getAriaLabel()}
        aria-invalid={!!error}
        aria-describedby={error ? "dataset-dropdown-error" : undefined}
      >
        <Database style={S.icon} />
        <span style={{ flex: 1, textAlign: "left" }}>
          Dataset: {getDisplayText()}
        </span>
        {error && !loading && !isRetrying && (
          <AlertCircle style={{ ...S.icon, color: "#ef4444", width: 14, height: 14 }} />
        )}
        {(loading || isRetrying) ? (
          <Loader2 style={{ ...S.spinner }} />
        ) : (
          <ChevronDown 
            style={{
              ...S.chevron,
              ...(isOpen ? S.chevronOpen : {})
            }} 
          />
        )}
        {networkError && (
          <div style={S.networkErrorBadge}>
            Offline
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          style={S.dropdown} 
          role="listbox"
          aria-label="Available datasets"
          onMouseMove={handleMouseMove}
        >
          {error ? (
            <div style={S.errorState} id="dataset-dropdown-error">
              <div style={S.errorMessage}>
                <AlertCircle style={{ width: 14, height: 14, color: "#ef4444" }} />
                <span>{error.userFriendlyMessage}</span>
              </div>
              {canRetry && (
                <button
                  style={S.retryButton}
                  onClick={handleRetry}
                  aria-label="Retry loading datasets"
                >
                  <RefreshCw style={{ width: 12, height: 12 }} />
                  Retry
                </button>
              )}
              {!canRetry && onErrorDismiss && (
                <button
                  style={{ ...S.retryButton, color: "#71717a", borderColor: "rgba(255,255,255,.2)" }}
                  onClick={handleErrorDismiss}
                  aria-label="Dismiss error"
                >
                  Dismiss
                </button>
              )}
            </div>
          ) : loading || isRetrying ? (
            <div style={S.loadingState}>
              <Loader2 style={S.spinner} />
              <span>{isRetrying ? 'Retrying...' : 'Loading datasets...'}</span>
            </div>
          ) : datasets.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ marginBottom: 8 }}>📂</div>
              <div>No datasets available</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
                Upload a dataset to get started
              </div>
            </div>
          ) : (
            <>
              <div style={S.label}>Available Datasets</div>
              {datasets.map((dataset, index) => {
                const isActive = activeDataset && (
                  (typeof activeDataset === 'string' && activeDataset === dataset.name) ||
                  (typeof activeDataset === 'object' && activeDataset.name === dataset.name)
                );

                return (
                  <div
                    key={dataset.name || index}
                    ref={(el) => (itemRefs.current[index] = el)}
                    style={getItemStyle(index, isActive)}
                    onClick={() => handleDatasetSelect(dataset)}
                    onMouseEnter={() => {
                      if (!navigatingWithKeyboard) {
                        setFocusedIndex(index);
                      }
                    }}
                    role="option"
                    aria-selected={isActive}
                    aria-current={focusedIndex === index ? "true" : undefined}
                    tabIndex={-1}
                  >
                    <div style={S.itemName}>
                      {isActive && "✓ "}
                      {dataset.name}
                    </div>
                    {dataset.rows !== undefined && dataset.columns !== undefined && (
                      <div style={S.itemMeta}>
                        {dataset.rows.toLocaleString()} rows • {dataset.columns} columns
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}