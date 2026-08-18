import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { districts, type DistrictKey } from "../../constants/districts";

import { useDistrict } from "../../context/useDistrict";
import { useTheme } from "../../context/useTheme";

import {
  getWebPushStatus,
  isWebPushSupported,
  syncWebPushPreferences,
} from "../../services/webPushService";

import Settings from "./Settings";

vi.mock("../../context/useTheme", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../context/useDistrict", () => ({
  useDistrict: vi.fn(),
}));

vi.mock("../../services/webPushService", () => ({
  getWebPushStatus: vi.fn(),
  isWebPushSupported: vi.fn(),
  subscribeToWebPush: vi.fn(),
  syncWebPushPreferences: vi.fn(),
  unsubscribeFromWebPush: vi.fn(),
}));

const districtKeys = Object.keys(districts) as DistrictKey[];

const selectedDistrict = districtKeys[0];

const setTheme = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  localStorage.clear();

  vi.mocked(useTheme).mockReturnValue({
    theme: "system",
    resolvedTheme: "light",
    setTheme,
  });

  vi.mocked(useDistrict).mockReturnValue({
    selectedDistrict,
    setSelectedDistrict: vi.fn(),
  });

  vi.mocked(isWebPushSupported).mockReturnValue(true);

  vi.mocked(getWebPushStatus).mockResolvedValue({
    subscribed: true,
    primaryDistrict: districts[selectedDistrict],
    watchDistricts: [],
    threshold: 80,
    notificationsEnabled: true,
  });

  vi.mocked(syncWebPushPreferences).mockResolvedValue(true);

  Object.defineProperty(globalThis, "Notification", {
    value: {
      permission: "default",
    },
    configurable: true,
  });
});

describe("Settings", () => {
  test("changes dashboard theme", async () => {
    const user = userEvent.setup();

    render(<Settings />);

    await user.click(
      screen.getByRole("button", {
        name: "Dark",
      }),
    );

    expect(setTheme).toHaveBeenCalledTimes(1);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  test("changes notification threshold", async () => {
    const user = userEvent.setup();

    render(<Settings />);

    await screen.findByText("Notifications enabled");

    const thresholdTrigger = screen.getByRole("button", {
      name: "Alert threshold AQI 80",
    });

    await user.click(thresholdTrigger);

    await user.click(
      screen.getByRole("button", {
        name: "90",
      }),
    );

    expect(localStorage.getItem("air-quality-notification-threshold")).toBe(
      "90",
    );

    await waitFor(() => {
      expect(syncWebPushPreferences).toHaveBeenCalledWith({
        threshold: 90,
      });
    });
  });

  test("selects an additional watched district", async () => {
    const user = userEvent.setup();

    const districtToWatch = districtKeys.find(
      (district) => district !== selectedDistrict,
    );

    if (!districtToWatch) {
      throw new Error("No additional district available for the test.");
    }

    render(<Settings />);

    await screen.findByText("Notifications enabled");

    const districtButton = screen.getByRole("button", {
      name: districtToWatch,
    });

    await user.click(districtButton);

    expect(districtButton).toHaveAttribute("aria-pressed", "true");

    expect(
      JSON.parse(localStorage.getItem("air-quality-watched-districts") ?? "[]"),
    ).toContain(districtToWatch);

    await waitFor(() => {
      expect(syncWebPushPreferences).toHaveBeenCalledWith({
        watchDistricts: [districts[districtToWatch]],
      });
    });
  });
});
