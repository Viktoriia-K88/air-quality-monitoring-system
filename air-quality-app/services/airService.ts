import { CurrentAirData, HistoryAirItem } from "@/types/air";
import { Platform } from "react-native";

const API_BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.102:3000"
    : "http://192.168.1.102:3000";

export async function getCurrentAirData(
  district?: string,
): Promise<CurrentAirData> {
  const url = district
    ? `${API_BASE_URL}/current?district=${encodeURIComponent(district)}`
    : `${API_BASE_URL}/current`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function getHistoryAirData(
  district?: string,
): Promise<HistoryAirItem[]> {
  const url = district
    ? `${API_BASE_URL}/history?district=${encodeURIComponent(district)}`
    : `${API_BASE_URL}/history`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
}
