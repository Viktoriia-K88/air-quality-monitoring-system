import { useContext } from "react";

import { DistrictContext } from "./DistrictContext";

export function useDistrict() {
  const context = useContext(DistrictContext);

  if (!context) {
    throw new Error("useDistrict must be used inside DistrictProvider.");
  }

  return context;
}
