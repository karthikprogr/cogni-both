import { useState, useEffect } from "react";
import { ChevronDown, Database, Loader2 } from "lucide-react";
import { api } from "../api/client";

export default function DatasetSelector() {
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
      const response = await api.get("/data/datasets");
      if (response.data?.datasets) {
        setDatasets(response.data.datasets);
        const active = response.data.datasets.find(d => d.is_active);
        if (active) setActiveDataset(active);
      }
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
      if (error.response?.status === 401) {
        console.log("Authentication required - user needs to login");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchDataset = async (dataset) => {
    try {
      setLoading(true);
      const response = await api.post(`/data/datasets/switch?name=${encodeURIComponent(dataset.name)}`);
      if (response.data?.success) {
        setActiveDataset(dataset);
        setIsOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error("Failed to switch dataset:", error);
      alert("Failed to switch dataset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.dataset-selector')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="dataset-selector" style={{ position: "relative", display: "inline-block" }}>
      <div
        onClick={() => !loading && setIsOpen(!isOpen)}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
          background: "#18181b", border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 8, color: "#e4e4e7", fontSize: 13, fontWeight: 500,
          cursor: loading ? "wait" : "pointer", minWidth: 200, userSelect: "none",
          transition: "all 0.2s ease"
        }}
      >
        <Database size={16} style={{ color: "#71717a" }} />
        <span style={{ flex: 1 }}>
          Dataset: {loading ? "Loading..." : (activeDataset?.name || "Select dataset")}
        </span>
        {loading ? (
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <ChevronDown 
            size={14} 
            style={{ 
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease"
            }} 
          />
        )}
      </div>

      {isOpen && !loading && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
          background: "#18181b", border: "1px solid rgba(255,255,255,.15)",
          borderRadius: 8, maxHeight: 300, overflowY: "auto", zIndex: 1000,
          boxShadow: "0 10px 40px rgba(0,0,0,.5)"
        }}>
          <div style={{
            padding: "8px 12px", fontSize: 11, color: "#71717a", fontWeight: 600,
            borderBottom: "1px solid rgba(255,255,255,.08)", textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Available Datasets
          </div>
          
          {datasets.length === 0 ? (
            <div style={{ 
              padding: "20px 16px", textAlign: "center", color: "#52525b", fontSize: 12 
            }}>
              <div style={{ marginBottom: 8 }}>📂</div>
              <div>No datasets available</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
                Upload a dataset to get started
              </div>
            </div>
          ) : (
            datasets.map((dataset) => {
              const isActive = dataset.is_active || activeDataset?.name === dataset.name;
              return (
                <div
                  key={dataset.name}
                  onClick={() => switchDataset(dataset)}
                  style={{
                    padding: "12px 16px", cursor: "pointer", fontSize: 13,
                    color: isActive ? "#818cf8" : "#e4e4e7",
                    background: isActive ? "rgba(99,102,241,.1)" : "transparent",
                    borderLeft: isActive ? "3px solid #6366f1" : "none",
                    borderBottom: "1px solid rgba(255,255,255,.04)",
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
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
