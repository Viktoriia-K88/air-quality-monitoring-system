import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useAppColors() {
  const colorScheme = useColorScheme() ?? "light";
  return Colors[colorScheme];
}
