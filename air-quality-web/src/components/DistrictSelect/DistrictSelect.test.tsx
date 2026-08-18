import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { districts } from "../../constants/districts";
import type { DistrictKey } from "../../constants/districts";

import DistrictSelect from "./DistrictSelect";

const districtKeys = Object.keys(districts) as DistrictKey[];

describe("DistrictSelect", () => {
  test("opens district options", async () => {
    const user = userEvent.setup();

    render(<DistrictSelect value={districtKeys[0]} onChange={vi.fn()} />);

    const trigger = screen.getByRole("button", {
      name: "Select district",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    expect(
      screen.getByRole("button", {
        name: districtKeys[1],
      }),
    ).toBeInTheDocument();
  });

  test("calls onChange when another district is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DistrictSelect value={districtKeys[0]} onChange={onChange} />);

    await user.click(
      screen.getByRole("button", {
        name: "Select district",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: districtKeys[1],
      }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(districtKeys[1]);
  });
});
