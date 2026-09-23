import React, { useState, useEffect } from "react";

export default function DatasetDropdown() {
  const [datasets, setDatasets] = useState([]);
  const [activeDataset, setActiveDataset] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/data/datasets", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Datasets response:", data);
        if (data && data.datasets) {
          setDatasets(data.datasets);
          const active = data.datasets.find(d => d.is_active);
          if (active) {
            setActiveDataset(active);
          }
        }
      } else {
        console.log("Failed to fetch datasets:", response.status);
      }
    } catch (error) {
      console.error("Error fetching datasets:", error);
    } finally {
      setLoading(false);
    }
  };

  const switchDataset = async (dataset) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`/api/data/datasets/switch?name=${encodeURIComponent(dataset.name)}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setActiveDataset(dataset);
          setIsOpen(false);
          
          // Show success message and refresh
          alert(`Switched to dataset: ${dataset.name}`);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } else {
        alert("Failed to switch dataset. Please try again.");
      }
    } catch (error) {
      console.error("Error switching dataset:", error);
      alert("Error switching dataset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.dataset-dropdown-container')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const displayText = loading 
    ? "Loading..." 
    : activeDataset 
      ? activeDataset.name 
      : datasets.length > 0 
        ? "Select Dataset"
        : "No datasets available";

  return (
    <div className="dataset-dropdown-container" style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
          background: "#18181b", border: "1px solid rgba(99,102,241,.3)",
          borderRadius: 8, color: "#818cf8", fontSize: 13, fontWeight: 500,
          cursor: loading ? "wait" : "pointer", minWidth: 200, 
          transition: "all 0.2s ease", userSelect: "none"
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.background = "rgba(99,102,241,.1)";
            e.target.style.borderColor = "rgba(99,102,241,.5)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.background = "#18181b";
            e.target.style.borderColor = "rgba(99,102,241,.3)";
          }
        }}
      >
        <span>Dataset: {displayText}</span>
        <span style={{ marginLeft: "auto", fontSize: 10 }}>
          {loading ? "⏳" : isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && !loading && datasets.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
          background: "#18181b", border: "1px solid rgba(255,255,255,.15)",
          borderRadius: 8, maxHeight: 300, overflowY: "auto", zIndex: 1000,
          boxShadow: "0 4px 20px rgba(0,0,0,.3)"
        }}>
          <div style={{
            padding: "8px 12px", fontSize: 11, color: "#71717a", fontWeight: 600,
            borderBottom: "1px solid rgba(255,255,255,.08)", textTransform: "uppercase"
          }}>
            Available Datasets ({datasets.length})
          </div>
          
          {datasets.map((dataset, index) => {
            const isActive = dataset.is_active || (activeDataset && activeDataset.name === dataset.name);
            return (
              <div
                key={dataset.name || index}
                onClick={() => switchDataset(dataset)}
                style={{
                  padding: "12px 16px", cursor: "pointer", fontSize: 13,
                  color: isActive ? "#818cf8" : "#e4e4e7",
                  background: isActive ? "rgba(99,102,241,.1)" : "transparent",
                  borderLeft: isActive ? "3px solid #6366f1" : "none",
                  borderBottom: index < datasets.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = "rgba(255,255,255,.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = "transparent";
                  }
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: 2 }}>
                  {isActive && "✓ "}{dataset.name}
                </div>
                {dataset.rows !== undefined && dataset.columns !== undefined && (
                  <div style={{ fontSize: 11, color: "#71717a" }}>
                    {dataset.rows.toLocaleString()} rows • {dataset.columns} columns
                  </div>
                )}
                {dataset.uploaded_at && (
                  <div style={{ fontSize: 10, color: "#52525b", marginTop: 2 }}>
                    Uploaded: {new Date(dataset.uploaded_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {isOpen && !loading && datasets.length === 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
          background: "#18181b", border: "1px solid rgba(255,255,255,.15)",
          borderRadius: 8, padding: 20, textAlign: "center", zIndex: 1000,
          boxShadow: "0 4px 20px rgba(0,0,0,.3)"
        }}>
          <div style={{ color: "#52525b", fontSize: 12, marginBottom: 8 }}>📂</div>
          <div style={{ color: "#71717a", fontSize: 13, marginBottom: 4 }}>No datasets found</div>
          <div style={{ color: "#52525b", fontSize: 11 }}>
            Upload a CSV, Excel, or JSON file to get started
          </div>
        </div>
      )}
    </div>
  );
}
