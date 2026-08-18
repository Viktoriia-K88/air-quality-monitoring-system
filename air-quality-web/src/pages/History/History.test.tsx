import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { districts, type DistrictKey } from "../../constants/districts";

import { useDistrict } from "../../context/useDistrict";
import { getHistoryAirData } from "../../services/airService";
import type { HistoryAirItem } from "../../types/air";

import History from "./History";

vi.mock("../../context/useDistrict", () => ({
  useDistrict: vi.fn(),
}));

vi.mock("../../services/airService", () => ({
  getHistoryAirData: vi.fn(),
}));

vi.mock("../../components/DistrictSelect/DistrictSelect", () => ({
  default: ({ value }: { value: string }) => <div>{value}</div>,
}));

vi.mock("recharts", () => ({
  Area: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,

  AreaChart: ({ children }: { children?: ReactNode }) => <div>{children}</div>,

  ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
}));

const districtKeys = Object.keys(districts) as DistrictKey[];

const selectedDistrict = districtKeys[0];

const setSelectedDistrict = vi.fn();

const historyData: HistoryAirItem[] = [
  {
    id: "1",
    district: districts[selectedDistrict],
    updatedAt: "2026-08-18T10:00:00.000Z",
    time: "13:00",
    value: 45,
    pm25: 18,
    pm10: 30,
  },
  {
    id: "2",
    district: districts[selectedDistrict],
    updatedAt: "2026-08-18T10:10:00.000Z",
    time: "13:10",
    value: 72,
    pm25: 27,
    pm10: 41,
  },
];

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useDistrict).mockReturnValue({
    selectedDistrict,
    setSelectedDistrict,
  });

  vi.mocked(getHistoryAirData).mockResolvedValue(historyData);

  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe("History", () => {
  test("loads history for the selected district", async () => {
    render(<History />);

    await waitFor(() => {
      expect(getHistoryAirData).toHaveBeenCalledWith(
        districts[selectedDistrict],
        "last20",
      );
    });

    const table = await screen.findByRole("table", {
      name: "Air quality measurements",
    });

    expect(within(table).getByText("45")).toBeInTheDocument();

    expect(within(table).getByText("72")).toBeInTheDocument();
  });

  test("loads today history when Today is selected", async () => {
    const user = userEvent.setup();

    render(<History />);

    await waitFor(() => {
      expect(getHistoryAirData).toHaveBeenCalledWith(
        districts[selectedDistrict],
        "last20",
      );
    });

    const todayButton = screen.getByRole("button", {
      name: "Today",
    });

    await user.click(todayButton);

    await waitFor(() => {
      expect(getHistoryAirData).toHaveBeenLastCalledWith(
        districts[selectedDistrict],
        "today",
      );
    });

    expect(todayButton).toHaveAttribute("aria-pressed", "true");
  });

  test("shows an error when history cannot be loaded", async () => {
    vi.mocked(getHistoryAirData).mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<History />);

    expect(
      await screen.findByText(
        "Air quality history is temporarily unavailable. The page will retry automatically.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Unable to load history data."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Unable to load measurements."),
    ).toBeInTheDocument();
  });
});
