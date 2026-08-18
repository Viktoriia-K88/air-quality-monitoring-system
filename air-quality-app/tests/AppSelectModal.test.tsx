import { render, screen, userEvent } from "@testing-library/react-native";

import AppSelectModal from "@/components/AppSelectModal";

jest.mock("@/hooks/useAppColors", () => ({
  useAppColors: () => ({
    text: "#111111",
    textSecondary: "#666666",
    primary: "#2563eb",
    primarySoft: "#dbeafe",
    surface: "#ffffff",
    surfaceSecondary: "#f5f5f5",
    cardBorder: "#dddddd",
  }),
}));

const options = [
  {
    label: "Франківський",
    value: "Франківський",
  },
  {
    label: "Галицький",
    value: "Галицький",
  },
];

describe("AppSelectModal", () => {
  test("opens the options list", async () => {
    const user = userEvent.setup();

    await render(
      <AppSelectModal
        label="Обери район"
        value="Франківський"
        options={options}
        onChange={jest.fn()}
      />,
    );

    const trigger = screen.getByLabelText("Обери район. Вибрано: Франківський");

    expect(trigger.props.accessibilityState).toEqual({
      expanded: false,
    });

    await user.press(trigger);

    expect(await screen.findByLabelText("Галицький")).toBeTruthy();

    expect(screen.getByLabelText("Закрити список")).toBeTruthy();
  });

  test("calls onChange when another option is selected", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    await render(
      <AppSelectModal
        label="Обери район"
        value="Франківський"
        options={options}
        onChange={onChange}
      />,
    );

    await user.press(
      screen.getByLabelText("Обери район. Вибрано: Франківський"),
    );

    const option = await screen.findByLabelText("Галицький");

    await user.press(option);

    expect(onChange).toHaveBeenCalledTimes(1);

    expect(onChange).toHaveBeenCalledWith("Галицький");
  });
});
