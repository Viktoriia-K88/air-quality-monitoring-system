import type { CurrentAirData, HistoryAirItem } from "@/types/air";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_URL.");
}

export type HistoryRange = "last20" | "today" | "yesterday";

export async function getCurrentAirData(
  district?: string,
): Promise<CurrentAirData> {
  const url = district
    ? `${API_BASE_URL}/current?district=${encodeURIComponent(district)}`
    : `${API_BASE_URL}/current`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to load current air quality data. Status: ${response.status}.`,
    );
  }

  return response.json();
}

export async function getHistoryAirData(
  district?: string,
  range: HistoryRange = "last20",
): Promise<HistoryAirItem[]> {
  const url = district
    ? `${API_BASE_URL}/history?district=${encodeURIComponent(
        district,
      )}&range=${range}`
    : `${API_BASE_URL}/history?range=${range}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to load air quality history. Status: ${response.status}.`,
    );
  }

  return response.json();
}
