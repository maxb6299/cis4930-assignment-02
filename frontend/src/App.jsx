// Some code in this file was generated using AI

import { useState, useEffect, useRef } from "react";
import {
  fetchData,
  filterData,
  computeTrajectoryData,
  computeEducationStats,
  computeScatterData,
} from "./handleData";
import { drawView1, drawView2, drawView3, clearView1Brush } from "./drawCharts";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Central Selection State (Single Source of Truth)
  const [ageExtent, setAgeExtent] = useState(null); // Driven by View 1
  const [selectedEducation, setSelectedEducation] = useState(null); // Driven by View 2

  // SVG references for the 3 coordinated views
  const svgView1Ref = useRef(null);
  const svgView2Ref = useRef(null);
  const svgView3Ref = useRef(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    fetchData()
      .then((records) => {
        console.log("Fetched records:", records.length);
        setData(records);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. Reactively compute filtered subset (< 2ms in memory)
  const filteredRecords = data
    ? filterData(data, ageExtent, selectedEducation)
    : [];

  // 3. Render View 1 (Population Trajectory + Brush)
  // ONLY runs when initial data arrives so user dragging is never interrupted!
  useEffect(() => {
    if (!data || !svgView1Ref.current) return;
    const trajectoryData = computeTrajectoryData(data);
    const cleanup = drawView1(
      svgView1Ref.current,
      trajectoryData,
      setAgeExtent,
    );
    return cleanup;
  }, [data]);

  // 4. Render View 2 (Education Bar Chart + Click)
  useEffect(() => {
    if (!data || !svgView2Ref.current) return;
    const educData = computeEducationStats(filteredRecords);
    const cleanup = drawView2(
      svgView2Ref.current,
      educData,
      selectedEducation,
      setSelectedEducation,
    );
    return cleanup;
  }, [data, filteredRecords, selectedEducation]);

  // 5. Render View 3 (Post-Retirement Scatterplot)
  useEffect(() => {
    if (!data || !svgView3Ref.current) return;
    const scatterData = computeScatterData(filteredRecords);
    const cleanup = drawView3(svgView3Ref.current, scatterData);
    return cleanup;
  }, [data, filteredRecords]);

  // Reversible selection: Clear all filters
  const handleReset = () => {
    setAgeExtent(null);
    setSelectedEducation(null);
    if (svgView1Ref.current) {
      clearView1Brush(svgView1Ref.current);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {/* Title format with FSU branding */}
      <p style={{ margin: 0, fontWeight: "bold" }}>
        Cognitive Reserve & Memory Decline Across Retirement (mrb22p, Max
        Boyington)
      </p>
      <p
        style={{
          margin: "0.25rem 0 1rem 0",
          color: "#666",
          fontSize: "0.9rem",
        }}
      >
        CIS 4930 Assignment 2 — Memory, Retirement, and Age Study
      </p>

      {/* Filter status & Reset button */}
      {data && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span>
            Showing <strong>{filteredRecords.length.toLocaleString()}</strong>{" "}
            of <strong>{data.length.toLocaleString()}</strong> records
            {ageExtent && ` | Age: ${ageExtent[0]}–${ageExtent[1]}`}
            {selectedEducation && ` | Education: ${selectedEducation}`}
          </span>
          {(ageExtent || selectedEducation) && (
            <button
              onClick={handleReset}
              style={{
                cursor: "pointer",
                padding: "4px 12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {loading && <p>Connecting to backend...</p>}

      {error && (
        <div style={{ color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          <div style={{ gridColumn: "1 / span 2" }}>
            <svg ref={svgView1Ref}></svg>
          </div>
          <div>
            <svg ref={svgView2Ref}></svg>
          </div>
          <div>
            <svg ref={svgView3Ref}></svg>
          </div>
        </div>
      )}

      {/* Tooltip container */}
      <div
        id="chart-tooltip"
        className="tooltip"
        style={{ display: "none" }}
      ></div>
    </main>
  );
}

export default App;
