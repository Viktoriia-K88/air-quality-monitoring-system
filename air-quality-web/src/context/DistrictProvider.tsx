import { useState, type ReactNode } from "react";

import { districts, type DistrictKey } from "../constants/districts";
import { DistrictContext } from "./DistrictContext";

type DistrictProviderProps = {
  children: ReactNode;
};

const DISTRICT_STORAGE_KEY = "air-quality-selected-district";

const INITIAL_DISTRICT: DistrictKey = "Frankivskyi";

function getSavedDistrict(): DistrictKey {
  const savedDistrict = localStorage.getItem(DISTRICT_STORAGE_KEY);

  if (savedDistrict && savedDistrict in districts) {
    return savedDistrict as DistrictKey;
  }

  return INITIAL_DISTRICT;
}

export function DistrictProvider({ children }: DistrictProviderProps) {
  const [selectedDistrict, setSelectedDistrictState] =
    useState<DistrictKey>(getSavedDistrict);

  function setSelectedDistrict(district: DistrictKey) {
    setSelectedDistrictState(district);

    localStorage.setItem(DISTRICT_STORAGE_KEY, district);
  }

  return (
    <DistrictContext.Provider
      value={{
        selectedDistrict,
        setSelectedDistrict,
      }}
    >
      {children}
    </DistrictContext.Provider>
  );
}
