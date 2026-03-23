import { getAirStatus } from "@/utils/airStatus";
import { StyleSheet, Text, View } from "react-native";

type HistoryItemCardProps = {
  time: string;
  value: number;
};

export default function HistoryItemCard({ time, value }: HistoryItemCardProps) {
  const airStatus = getAirStatus(value);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.time}>Час: {time}</Text>
        <Text style={[styles.status, { color: airStatus.color }]}>
          {airStatus.label}
        </Text>
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.indexLabel}>airIndex</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  time: {
    fontSize: 15,
    color: "#666",
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  indexLabel: {
    fontSize: 14,
    color: "#777",
  },
  status: {
    fontSize: 15,
    fontWeight: "700",
  },
});
