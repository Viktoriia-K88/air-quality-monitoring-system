import { createContext } from "react";

import type { DistrictKey } from "../constants/districts";

export type DistrictContextValue = {
  selectedDistrict: DistrictKey;
  setSelectedDistrict: (district: DistrictKey) => void;
};

export const DistrictContext = createContext<DistrictContextValue | null>(null);
