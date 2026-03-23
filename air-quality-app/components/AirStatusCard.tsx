import { StyleSheet, Text, View } from "react-native";

type AirStatusCardProps = {
  city: string;
  airIndex: number;
  statusLabel: string;
  statusColor: string;
  updatedAt: string;
};

export default function AirStatusCard({
  city,
  airIndex,
  statusLabel,
  statusColor,
  updatedAt,
}: AirStatusCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Місто</Text>
      <Text style={styles.value}>{city}</Text>

      <Text style={styles.label}>Індекс якості повітря</Text>
      <Text style={styles.airIndex}>{airIndex}</Text>

      <Text style={styles.label}>Стан повітря</Text>
      <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>

      <Text style={styles.label}>Останнє оновлення</Text>
      <Text style={styles.value}>{updatedAt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  value: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
    marginTop: 4,
  },
  airIndex: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111",
    marginTop: 4,
  },
  status: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
});
