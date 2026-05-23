import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";

type AppCardProps = {
  children: ReactNode;
};

export default function AppCard({ children }: AppCardProps) {
  const colors = useAppColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.shadow,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});
