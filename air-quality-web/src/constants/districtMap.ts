import type { DistrictKey } from "./districts";

type DistrictCoordinates = {
  longitude: number;
  latitude: number;
};

export const districtCoordinates: Record<DistrictKey, DistrictCoordinates> = {
  Halytskyi: {
    latitude: 49.8397,
    longitude: 24.0297,
  },

  Zaliznychnyi: {
    latitude: 49.8305,
    longitude: 23.9812,
  },

  Lychakivskyi: {
    latitude: 49.8418,
    longitude: 24.0608,
  },

  Sykhivskyi: {
    latitude: 49.7989,
    longitude: 24.0587,
  },

  Frankivskyi: {
    latitude: 49.8172,
    longitude: 24.0072,
  },

  Shevchenkivskyi: {
    latitude: 49.8673,
    longitude: 24.0221,
  },
};
