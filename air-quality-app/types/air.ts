export type CurrentAirData = {
  city: string;
  district: string;
  airIndex: number;
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
};
