import type { DistrictKey } from "../constants/districts";

export type CurrentAirData = {
  city: string;
  district: string;
  airIndex: number;
  pm25: number | null;
  pm10: number | null;
  updatedAt: string;
  alert: boolean;
  alertMessage: string;
};

export type HistoryAirItem = {
  id: string;
  district: string;
  updatedAt: string;
  time: string;
  value: number;
  pm25: number | null;
  pm10: number | null;
};

export type DistrictAirData = Partial<Record<DistrictKey, CurrentAirData>>;
