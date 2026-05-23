import { StyleSheet, Text, View } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";

type HistoryItemCardProps = {
  time: string;
  value: number;
};

export default function HistoryItemCard({ time, value }: HistoryItemCardProps) {
  const colors = useAppColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View>
        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
          Час
        </Text>
        <Text style={[styles.timeValue, { color: colors.text }]}>{time}</Text>
      </View>

      <View style={styles.valueBlock}>
        <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
          airIndex
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  timeLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  valueBlock: {
    alignItems: "flex-end",
  },
  valueLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
  },
});
