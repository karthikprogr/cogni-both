import { useState } from "react";

// Styles matching the Dashboard theme
const S = {
  item: {
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: 13,
    color: "#e4e4e7",
    borderBottom: "1px solid rgba(255,255,255,.04)",
    transition: "all .15s",
    display: "flex",
    flexDirection: "column",
    gap: 2,
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
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  activeIndicator: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: 600,
  },
  itemMeta: {
    fontSize: 11,
    color: "#71717a",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  uploadDate: {
    fontSize: 10,
    color: "#52525b",
    fontStyle: "italic",
  },
};

export default function DatasetItem({ 
  dataset, 
  isActive = false, 
  onClick,
  style = {} 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(dataset);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return null;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getItemStyle = () => {
    let itemStyle = { ...S.item, ...style };
    
    if (isActive) {
      itemStyle = { ...itemStyle, ...S.itemActive };
    } else if (isHovered) {
      itemStyle = { ...itemStyle, ...S.itemHover };
    }
    
    return itemStyle;
  };

  return (
    <div
      style={getItemStyle()}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="option"
      aria-selected={isActive}
      title={`${dataset.name} - ${dataset.rows?.toLocaleString()} rows, ${dataset.columns} columns`}
    >
      <div style={S.itemName}>
        {isActive && <span style={S.activeIndicator}>✓</span>}
        <span>{dataset.name}</span>
      </div>
      
      <div style={S.itemMeta}>
        {dataset.rows !== undefined && dataset.columns !== undefined && (
          <div style={S.metaItem}>
            <span>{dataset.rows.toLocaleString()} rows</span>
            <span>•</span>
            <span>{dataset.columns} columns</span>
          </div>
        )}
        
        {dataset.file_size && (
          <>
            <span>•</span>
            <div style={S.metaItem}>
              <span>{formatFileSize(dataset.file_size)}</span>
            </div>
          </>
        )}
        
        {dataset.uploaded_at && (
          <>
            <span>•</span>
            <div style={S.uploadDate}>
              {formatDate(dataset.uploaded_at)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}