import HistoryItemCard from "@/components/HistoryItemCard";
import { useDistrict } from "@/context/DistrictContext";
import { getHistoryAirData } from "@/services/airService";
import { HistoryAirItem } from "@/types/air";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type HistoryFilter = "last20" | "today" | "yesterday";

export default function HistoryScreen() {
  const { selectedDistrict, isDistrictLoaded } = useDistrict();
  const [historyAirData, setHistoryAirData] = useState<HistoryAirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("last20");

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

  const filteredHistoryData = useMemo(() => {
    if (activeFilter === "last20") {
      return historyAirData.slice(-20);
    }

    const now = new Date();
    const todayString = now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    return historyAirData.filter((item) => {
      const itemDate = new Date(item.updatedAt);
      if (isNaN(itemDate.getTime())) return false;

      if (activeFilter === "today") {
        return itemDate.toDateString() === todayString;
      }

      if (activeFilter === "yesterday") {
        return itemDate.toDateString() === yesterdayString;
      }

      return true;
    });
  }, [historyAirData, activeFilter]);

  const chartData = useMemo(() => {
    return filteredHistoryData.map((item) => ({
      value: item.value,
      label: item.time,
    }));
  }, [filteredHistoryData]);

  if (!isDistrictLoaded || loading) {
    return <Text style={styles.message}>Завантаження...</Text>;
  }

  function openAnalytics() {
    router.push({
      pathname: "/analytics" as any,
      params: {
        district: selectedDistrict,
        data: JSON.stringify(filteredHistoryData),
      },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Історія показників</Text>
      <Text style={styles.subtitle}>{selectedDistrict} район</Text>

      <View style={styles.filtersRow}>
        <FilterButton
          title="Останні 20"
          active={activeFilter === "last20"}
          onPress={() => setActiveFilter("last20")}
        />
        <FilterButton
          title="Сьогодні"
          active={activeFilter === "today"}
          onPress={() => setActiveFilter("today")}
        />
        <FilterButton
          title="Вчора"
          active={activeFilter === "yesterday"}
          onPress={() => setActiveFilter("yesterday")}
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Короткий графік airIndex</Text>

        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            areaChart
            curved
            thickness={2}
            hideDataPoints
            initialSpacing={8}
            endSpacing={8}
            spacing={28}
            noOfSections={4}
            maxValue={120}
            height={120}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            rulesColor="#e5e5e5"
            yAxisColor="#d9d9d9"
            xAxisColor="#d9d9d9"
            color="#2563eb"
            startFillColor="rgba(37, 99, 235, 0.22)"
            endFillColor="rgba(37, 99, 235, 0.05)"
            startOpacity={0.9}
            endOpacity={0.2}
          />
        ) : (
          <Text style={styles.emptyText}>
            Немає даних для вибраного фільтра
          </Text>
        )}
      </View>

      <Pressable style={styles.analyticsButton} onPress={openAnalytics}>
        <Text style={styles.analyticsButtonText}>Відкрити аналітику</Text>
      </Pressable>

      <FlatList
        data={filteredHistoryData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItemCard time={item.time} value={item.value} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Історія за цим фільтром відсутня</Text>
        }
      />
    </View>
  );
}

type FilterButtonProps = {
  title: string;
  active: boolean;
  onPress: () => void;
};

function FilterButton({ title, active, onPress }: FilterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterButton, active && styles.filterButtonActive]}
    >
      <Text
        style={[
          styles.filterButtonText,
          active && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  message: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    color: "#444",
    backgroundColor: "#f5f7fa",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#dceeff",
    borderColor: "#2563eb",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#0f5db8",
    fontWeight: "700",
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  axisText: {
    fontSize: 10,
    color: "#666",
  },
  analyticsButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  analyticsButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    paddingBottom: 30,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingVertical: 10,
  },
});
