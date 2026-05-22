import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type AnalyticsItem = {
  id: string;
  time: string;
  value: number;
  updatedAt: string;
  district: string;
};

export default function AnalyticsScreen() {
  const params = useLocalSearchParams();

  const district = typeof params.district === "string" ? params.district : "";
  const rawData = typeof params.data === "string" ? params.data : "[]";

  const historyData: AnalyticsItem[] = useMemo(() => {
    try {
      return JSON.parse(rawData);
    } catch {
      return [];
    }
  }, [rawData]);

  const chartData = useMemo(() => {
    return historyData.map((item) => ({
      value: item.value,
      label: item.time,
    }));
  }, [historyData]);

  const stats = useMemo(() => {
    if (!historyData.length) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        count: 0,
      };
    }

    const values = historyData.map((item) => item.value);
    const sum = values.reduce((acc, item) => acc + item, 0);

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: Number((sum / values.length).toFixed(1)),
      count: values.length,
    };
  }, [historyData]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Аналітика</Text>
      <Text style={styles.subtitle}>{district} район</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Графік airIndex</Text>

        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            areaChart
            curved
            thickness={3}
            hideDataPoints={false}
            initialSpacing={10}
            endSpacing={10}
            spacing={42}
            noOfSections={5}
            maxValue={120}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            rulesColor="#d9d9d9"
            yAxisColor="#cfcfcf"
            xAxisColor="#cfcfcf"
            color="#2563eb"
            dataPointsColor="#2563eb"
            textColor1="#666"
            textShiftY={4}
          />
        ) : (
          <Text style={styles.emptyText}>Дані для графіка відсутні</Text>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avg}</Text>
          <Text style={styles.statLabel}>Середнє</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.min}</Text>
          <Text style={styles.statLabel}>Мінімум</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.max}</Text>
          <Text style={styles.statLabel}>Максимум</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.count}</Text>
          <Text style={styles.statLabel}>Записи</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  axisText: {
    fontSize: 11,
    color: "#666",
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
});
