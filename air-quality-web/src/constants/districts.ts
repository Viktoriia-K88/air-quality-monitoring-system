export const districts = {
  Halytskyi: "Галицький",
  Zaliznychnyi: "Залізничний",
  Lychakivskyi: "Личаківський",
  Sykhivskyi: "Сихівський",
  Frankivskyi: "Франківський",
  Shevchenkivskyi: "Шевченківський",
} as const;

export type DistrictKey = keyof typeof districts;
