import { ReactNode } from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";

type ScreenContainerProps = {
  children: ReactNode;
  contentStyle?: ViewStyle;
};

export default function ScreenContainer({
  children,
  contentStyle,
}: ScreenContainerProps) {
  const colors = useAppColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, contentStyle]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },
});
