import { render, screen, userEvent } from "@testing-library/react-native";

import SettingsScreen from "@/app/(tabs)/settings";
import { useDistrict } from "@/context/DistrictContext";

jest.mock("@/context/DistrictContext", () => ({
  districts: [
    "Галицький",
    "Залізничний",
    "Личаківський",
    "Сихівський",
    "Франківський",
    "Шевченківський",
  ],
  useDistrict: jest.fn(),
}));

jest.mock("@/hooks/useAppColors", () => ({
  useAppColors: () => ({
    background: "#ffffff",
    surface: "#ffffff",
    surfaceSecondary: "#f5f5f5",
    text: "#111111",
    textSecondary: "#666666",
    primary: "#2563eb",
    primarySoft: "#dbeafe",
    border: "#dddddd",
    cardBorder: "#dddddd",
    shadow: "#000000",
  }),
}));

describe("SettingsScreen", () => {
  test("adds a district to watched districts", async () => {
    const user = userEvent.setup();

    const setWatchedDistricts = jest.fn();

    jest.mocked(useDistrict).mockReturnValue({
      selectedDistrict: "Франківський",
      setSelectedDistrict: jest.fn(),
      watchedDistricts: [],
      setWatchedDistricts,
      notificationThreshold: 70,
      setNotificationThreshold: jest.fn(),
      notificationsEnabled: true,
      setNotificationsEnabled: jest.fn(),
      isDistrictLoaded: true,
    });

    await render(<SettingsScreen />);

    const districtButton = screen.getByLabelText("Галицький район");

    await user.press(districtButton);

    expect(setWatchedDistricts).toHaveBeenCalledTimes(1);

    expect(setWatchedDistricts).toHaveBeenCalledWith(["Галицький"]);
  });
});
