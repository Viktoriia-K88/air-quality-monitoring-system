import type { CurrentAirData, HistoryAirItem } from "../types/air";

const API_URL = import.meta.env.VITE_API_URL;

export type HistoryRange = "last20" | "today" | "yesterday";

export async function getCurrentAirData(
  district: string,
): Promise<CurrentAirData> {
  const response = await fetch(
    `${API_URL}/current?district=${encodeURIComponent(district)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load current air quality data.");
  }

  return response.json();
}

export async function getHistoryAirData(
  district: string,
  range: HistoryRange = "last20",
): Promise<HistoryAirItem[]> {
  const response = await fetch(
    `${API_URL}/history?district=${encodeURIComponent(
      district,
    )}&range=${range}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load air quality history.");
  }

  return response.json();
}
