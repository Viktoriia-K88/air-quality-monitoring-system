import { StyleSheet, Text, View } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";

type RecommendationCardProps = {
  title: string;
  text: string;
  type?: "success" | "warning";
};

export default function RecommendationCard({
  title,
  text,
  type = "success",
}: RecommendationCardProps) {
  const colors = useAppColors();

  const isWarning = type === "warning";

  const accent = isWarning ? "#f87171" : "#4ade80";
  const bg = colors.surface;
  const border = isWarning
    ? "rgba(248, 113, 113, 0.28)"
    : "rgba(3, 136, 52, 0.28)";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor: border,
        },
      ]}
    >
      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.2,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});
