// src/drawCharts.js
// Some code in this file was generated using AI

import * as d3 from "d3";

// Shared color palette across all views (Required Element 1)
export const COLOR_SCALE = d3
  .scaleOrdinal()
  .domain(["Not Retired", "Completely Retired", "Partly Retired"])
  .range(["#028090", "#F45B69", "#F4A261"]);

// line graph of recall decline and age
export function drawView1(svgElement, data, onBrush) {
  const width = 850;
  const height = 230;
  const margin = { top: 25, right: 30, bottom: 40, left: 55 };

  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();
  svg.attr("width", width).attr("height", height);

  if (!data || data.length === 0) return () => {};

  const x = d3.scaleLinear().domain([50, 90]).range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([4, 16]).range([height - margin.bottom, margin.top]);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(8))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 35)
    .attr("fill", "#000")
    .attr("font-size", "12px")
    .text("Age (Years)");

  // Y Axis
  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y).ticks(5))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -38)
    .attr("fill", "#000")
    .attr("font-size", "12px")
    .text("Mean Word Recall (0–20)");

  // Lines
  const lineRetired = d3.line()
    .defined((d) => d.retiredMean != null)
    .x((d) => x(d.age))
    .y((d) => y(d.retiredMean))
    .curve(d3.curveMonotoneX);

  const lineWorking = d3.line()
    .defined((d) => d.notRetiredMean != null)
    .x((d) => x(d.age))
    .y((d) => y(d.notRetiredMean))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", COLOR_SCALE("Not Retired"))
    .attr("stroke-width", 2.5)
    .attr("d", lineWorking);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", COLOR_SCALE("Completely Retired"))
    .attr("stroke-width", 2.5)
    .attr("d", lineRetired);

  // --- LEGEND (Required Element 1) ---
  const legend = svg.append("g").attr("transform", `translate(${width - 240}, 10)`);
  [
    { label: "Active Workforce", color: COLOR_SCALE("Not Retired") },
    { label: "Completely Retired", color: COLOR_SCALE("Completely Retired") },
  ].forEach((item, i) => {
    const row = legend.append("g").attr("transform", `translate(${i * 120}, 0)`);
    row.append("line").attr("x1", 0).attr("x2", 18).attr("y1", 5).attr("y2", 5)
      .attr("stroke", item.color).attr("stroke-width", 3);
    row.append("text").attr("x", 24).attr("y", 9).attr("font-size", "11px").text(item.label);
  });

  // --- BRUSH (Pair 1 Source) ---
  const brush = d3.brushX()
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("brush end", (event) => {
      // Guard against programmatically triggered events to prevent loops
      if (!event.sourceEvent) return;
      if (!event.selection) {
        onBrush(null);
      } else {
        const [x0, x1] = event.selection;
        onBrush([Math.round(x.invert(x0)), Math.round(x.invert(x1))]);
      }
    });

  const brushGroup = svg.append("g").attr("class", "brush-view1").call(brush);

  // Return cleanup and brush-clear handle
  return () => {
    brushGroup.call(brush.move, null);
    svg.selectAll("*").remove();
  };
}

// Helper to programmatically clear the View 1 brush
export function clearView1Brush(svgElement) {
  d3.select(svgElement).select(".brush-view1").call(d3.brushX().move, null);
}

// horizontal bar chart
export function drawView2(svgElement, data, selectedEducation, onSelect) {
  const width = 400;
  const height = 240;
  const margin = { top: 20, right: 30, bottom: 40, left: 150 };

  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();
  svg.attr("width", width).attr("height", height);

  // Empty state handling
  if (!data || data.length === 0) {
    svg.append("text")
      .attr("x", width / 2).attr("y", height / 2)
      .attr("text-anchor", "middle").attr("fill", "#888")
      .text("No records match current filter");
    return () => {};
  }

  const y = d3.scaleBand().domain(data.map((d) => d.education))
    .range([margin.top, height - margin.bottom]).padding(0.25);
  const x = d3.scaleLinear().domain([0, 16]).range([margin.left, width - margin.right]);

  // Bars with animated transitions
  svg.selectAll("rect")
    .data(data, (d) => d.education)
    .join("rect")
    .attr("y", (d) => y(d.education))
    .attr("x", margin.left)
    .attr("height", y.bandwidth())
    .attr("fill", (d) => selectedEducation === d.education ? "#028090" : "#A8DADC")
    .attr("stroke", (d) => selectedEducation === d.education ? "#1D3557" : "none")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      onSelect(selectedEducation === d.education ? null : d.education);
    })
    .transition().duration(300)
    .attr("width", (d) => Math.max(0, x(d.mean_score) - margin.left));

  // Axes
  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove();

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5))
    .append("text")
    .attr("x", (width + margin.left) / 2)
    .attr("y", 35)
    .attr("fill", "#000")
    .attr("font-size", "11px")
    .text("Mean Memory Score (0–20)");

  return () => svg.selectAll("*").remove();
}

// scatterplot
export function drawView3(svgElement, data) {
  const width = 400;
  const height = 240;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();
  svg.attr("width", width).attr("height", height);

  // Empty state handling
  if (!data || data.length === 0) {
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#888")
      .text("No retired records in this selection");
    return () => {};
  }

  const x = d3
    .scaleLinear()
    .domain([0, 30])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, 20])
    .range([height - margin.bottom, margin.top]);

  // X Axis with units
  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6))
    .append("text")
    .attr("x", (width + margin.left) / 2)
    .attr("y", 35)
    .attr("fill", "#000")
    .attr("font-size", "11px")
    .text("Years Retired");

  // Y Axis with units
  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y).ticks(5))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -35)
    .attr("fill", "#000")
    .attr("font-size", "11px")
    .text("Score (0–20)");

  // line of best fit
  const validPoints = data.filter(
    (d) => d.years_retired != null && d.memory_score != null
  );

  if (validPoints.length >= 2) {
    const n = validPoints.length;
    const xMean = d3.mean(validPoints, (d) => d.years_retired);
    const yMean = d3.mean(validPoints, (d) => d.memory_score);

    // Calculate slope (m) and intercept (b): y = m*x + b
    let num = 0;
    let den = 0;
    for (const d of validPoints) {
      const dx = d.years_retired - xMean;
      const dy = d.memory_score - yMean;
      num += dx * dy;
      den += dx * dx;
    }

    const slope = den !== 0 ? num / den : 0;
    const intercept = yMean - slope * xMean;

    // Determine line endpoints spanning the data range
    const xMin = Math.max(0, d3.min(validPoints, (d) => d.years_retired));
    const xMax = Math.min(30, d3.max(validPoints, (d) => d.years_retired));

    const yMin = slope * xMin + intercept;
    const yMax = slope * xMax + intercept;

    // Draw regression line
    svg
      .append("line")
      .attr("x1", x(xMin))
      .attr("y1", y(yMin))
      .attr("x2", x(xMax))
      .attr("y2", y(yMax))
      .attr("stroke", "#B7094C") // Crimson trendline matching Seaborn
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "4,3") // Optional subtle dashed styling
      .style("pointer-events", "none");

    // Small legend tag showing slope direction
    svg
      .append("text")
      .attr("x", width - margin.right - 10)
      .attr("y", margin.top + 10)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "#B7094C")
      .attr("font-weight", "bold")
      .text(`Trend: ${slope >= 0 ? "+" : ""}${slope.toFixed(2)} pts/yr`);
  }

  const tooltip = d3.select("#chart-tooltip");

  svg
    .selectAll("circle")
    .data(validPoints, (d) => d.id)
    .join("circle")
    .attr("cx", (d) => x(d.years_retired))
    .attr("cy", (d) => y(d.memory_score))
    .attr("r", 3.5)
    .attr("fill", COLOR_SCALE("Completely Retired"))
    .attr("opacity", 0.6)
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 25}px`).html(`
          <strong>ID:</strong> ${d.id}<br/>
          <strong>Age:</strong> ${d.age} yrs<br/>
          <strong>Years Retired:</strong> ${d.years_retired}<br/>
          <strong>Memory:</strong> ${d.memory_score} / 20<br/>
          <strong>Education:</strong> ${d.education}
        `);
    })
    .on("mouseout", () => tooltip.style("display", "none"));

  return () => svg.selectAll("*").remove();
}
