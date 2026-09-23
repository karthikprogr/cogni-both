import React, { useState, useEffect } from "react";

export default function SimpleDatasetDropdown() {
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
        setLoading(false);
        return;
      }

      const response = await fetch("/api/data/datasets", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.datasets) {
          setDatasets(data.datasets);
          const active = data.datasets.find(d => d.is_active);
          if (active) setActiveDataset(active);
        }
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
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        setActiveDataset(dataset);
        setIsOpen(false);
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      console.error("Error switching dataset:", error);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement("div", {
    style: { position: "relative", display: "inline-block" }
  }, [
    React.createElement("div", {
      key: "trigger",
      onClick: () => !loading && setIsOpen(!isOpen),
      style: {
        display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
        background: "#18181b", border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 8, color: "#e4e4e7", fontSize: 13, fontWeight: 500,
        cursor: loading ? "wait" : "pointer", minWidth: 200, userSelect: "none"
      }
    }, [
      React.createElement("span", { key: "icon" }, "📊"),
      React.createElement("span", { key: "text", style: { flex: 1 } }, 
        `Dataset: ${loading ? "Loading..." : (activeDataset?.name || "Select dataset")}`
      ),
      React.createElement("span", { key: "arrow" }, isOpen ? "▲" : "▼")
    ]),
    
    isOpen && !loading && React.createElement("div", {
      key: "dropdown",
      style: {
        position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
        background: "#18181b", border: "1px solid rgba(255,255,255,.15)",
        borderRadius: 8, maxHeight: 200, overflowY: "auto", zIndex: 1000,
        boxShadow: "0 4px 20px rgba(0,0,0,.3)"
      }
    }, datasets.length === 0 ? 
      React.createElement("div", {
        style: { padding: "16px", textAlign: "center", color: "#71717a", fontSize: 12 }
      }, "No datasets available") :
      datasets.map((dataset, i) => 
        React.createElement("div", {
          key: i,
          onClick: () => switchDataset(dataset),
          style: {
            padding: "12px 16px", cursor: "pointer", fontSize: 13,
            color: dataset.is_active ? "#818cf8" : "#e4e4e7",
            background: dataset.is_active ? "rgba(99,102,241,.1)" : "transparent",
            borderBottom: i < datasets.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none"
          }
        }, `${dataset.is_active ? "✓ " : ""}${dataset.name}`)
      )
    )
  ]);
}
