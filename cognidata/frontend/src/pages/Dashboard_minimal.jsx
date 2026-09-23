import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../api/client";

// Simple, fast Dashboard - NO complex components, NO infinite loops
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simple initial load
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#e4e4e7" }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#09090b", minHeight: "100vh", color: "#e4e4e7" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "#71717a", marginTop: 8 }}>
          Upload a dataset to get started
        </p>
      </div>

      {/* Simple message */}
      <div style={{
        background: "#18181b",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 12,
        padding: 40,
        textAlign: "center"
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h2 style={{ fontSize: 20, color: "#e4e4e7", marginBottom: 12 }}>
          Welcome to CogniData Dashboard
        </h2>
        <p style={{ fontSize: 14, color: "#71717a", marginBottom: 24 }}>
          Upload a dataset to see visualizations and analytics
        </p>
        <button
          onClick={() => window.location.href = "/upload-dataset"}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Upload Dataset
        </button>
      </div>
    </div>
  );
}
