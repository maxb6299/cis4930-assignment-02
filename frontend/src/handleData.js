// src/handleData.js
// Some code in this file was generated using AI

export const API_URL = "http://127.0.0.1:5001/api/data";

/**
 * Fetch records once on page load from the backend
 */
export async function fetchData() {
  console.log("Fetching data from backend at " + API_URL);
  const response = await fetch(API_URL);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP Error ${response.status}: ${response.statusText}`);
  }
  const json = await response.json();
  return json.data; // Array of respondent objects
}

/**
 * Fast in-memory client filtering (< 2ms)
 */
export function filterData(records, ageExtent, selectedEducation) {
  if (!records || records.length === 0) return [];

  return records.filter((d) => {
    // Condition 1: Age window brush (View 1)
    const matchesAge =
      !ageExtent || (d.age >= ageExtent[0] && d.age <= ageExtent[1]);

    // Condition 2: Education tier click (View 2)
    const matchesEduc =
      !selectedEducation || d.education === selectedEducation;

    return matchesAge && matchesEduc;
  });
}

/**
 * View 1 Transform: Mean memory score by age (50-90) for Retired vs. Not Retired
 */
export function computeTrajectoryData(records) {
  if (!records) return [];
  const ageMap = new Map();

  for (const r of records) {
    const age = r.age;
    if (!ageMap.has(age)) {
      ageMap.set(age, { age, retiredScores: [], notRetiredScores: [] });
    }
    const bucket = ageMap.get(age);
    if (r.work_status === "Completely Retired") {
      bucket.retiredScores.push(r.memory_score);
    } else if (r.work_status === "Not Retired") {
      bucket.notRetiredScores.push(r.memory_score);
    }
  }

  const average = (arr) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  return Array.from(ageMap.values())
    .map((d) => ({
      age: d.age,
      retiredMean: average(d.retiredScores),
      notRetiredMean: average(d.notRetiredScores),
    }))
    .sort((a, b) => a.age - b.age);
}

/**
 * View 2 Transform: Mean memory score and count per education tier
 */
export function computeEducationStats(filteredRecords) {
  if (!filteredRecords || filteredRecords.length === 0) return [];
  const educMap = new Map();

  for (const r of filteredRecords) {
    const educ = r.education || "Unknown";
    if (!educMap.has(educ)) educMap.set(educ, []);
    educMap.get(educ).push(r.memory_score);
  }

  return Array.from(educMap.entries())
    .map(([education, scores]) => ({
      education,
      mean_score: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length,
    }))
    .sort((a, b) => b.mean_score - a.mean_score);
}

/**
 * View 3 Transform: Retired individuals with valid retirement duration
 */
export function computeScatterData(filteredRecords, sampleLimit = 400) {
  if (!filteredRecords) return [];
  const retired = filteredRecords.filter(
    (d) =>
      d.work_status === "Completely Retired" &&
      d.years_retired != null &&
      d.years_retired >= 0
  );
  return retired.slice(0, sampleLimit);
}
