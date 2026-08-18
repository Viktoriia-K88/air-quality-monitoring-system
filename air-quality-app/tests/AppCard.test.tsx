import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import AppCard from "@/components/AppCard";

jest.mock("@/hooks/useAppColors", () => ({
  useAppColors: () => ({
    surface: "#ffffff",
    shadow: "#000000",
    cardBorder: "#dddddd",
  }),
}));

describe("AppCard", () => {
  test("renders its content", async () => {
    await render(
      <AppCard>
        <Text>Test content</Text>
      </AppCard>,
    );

    expect(screen.getByText("Test content")).toBeTruthy();
  });
});
