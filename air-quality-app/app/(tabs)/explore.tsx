import HistoryItemCard from "@/components/HistoryItemCard";
import { useDistrict } from "@/context/DistrictContext";
import { getHistoryAirData } from "@/services/airService";
import { HistoryAirItem } from "@/types/air";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function HistoryScreen() {
  const { selectedDistrict, isDistrictLoaded } = useDistrict();
  const [historyAirData, setHistoryAirData] = useState<HistoryAirItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isDistrictLoaded) return;

    let intervalId: ReturnType<typeof setInterval>;

    async function loadData() {
      try {
        const data = await getHistoryAirData(selectedDistrict);
        setHistoryAirData(data);
      } catch (error) {
        console.log("Помилка завантаження history data:", error);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    loadData();

    intervalId = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [selectedDistrict, isDistrictLoaded]);

  const chartData = useMemo(() => {
    return historyAirData.map((item) => ({
      value: item.value,
      label: item.time.slice(0, 5),
    }));
  }, [historyAirData]);

  if (!isDistrictLoaded || loading) {
    return <Text style={styles.message}>Завантаження...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Історія показників</Text>
      <Text style={styles.subtitle}>{selectedDistrict} район</Text>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Графік airIndex</Text>

        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            areaChart
            curved
            thickness={3}
            hideDataPoints={false}
            initialSpacing={10}
            endSpacing={10}
            spacing={50}
            noOfSections={5}
            maxValue={120}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            rulesColor="#d9d9d9"
            yAxisColor="#cfcfcf"
            xAxisColor="#cfcfcf"
            color="#2196f3"
            dataPointsColor="#2196f3"
            textColor1="#666"
            textShiftY={4}
          />
        ) : (
          <Text style={styles.emptyText}>Дані для графіка відсутні</Text>
        )}
      </View>

      <FlatList
        data={historyAirData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItemCard time={item.time} value={item.value} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
  },
  axisText: {
    color: "#666",
    fontSize: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
  },
  listContent: {
    paddingBottom: 30,
  },
  message: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    color: "#444",
    backgroundColor: "#f5f7fa",
  },
});
