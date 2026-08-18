import AppCard from "@/components/AppCard";
import HistoryItemCard from "@/components/HistoryItemCard";
import ScreenContainer from "@/components/ScreenContainer";
import { useDistrict } from "@/context/DistrictContext";
import { useAppColors } from "@/hooks/useAppColors";
import { getHistoryAirData, type HistoryRange } from "@/services/airService";
import type { HistoryAirItem } from "@/types/air";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function HistoryScreen() {
  const colors = useAppColors();

  const { selectedDistrict, isDistrictLoaded } = useDistrict();

  const [historyAirData, setHistoryAirData] = useState<HistoryAirItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState<HistoryRange>("last20");

  // load history

  useEffect(() => {
    if (!isDistrictLoaded) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;

    async function loadData() {
      try {
        const data = await getHistoryAirData(selectedDistrict, activeFilter);

        setHistoryAirData(data);
      } catch (error) {
        console.log("Помилка завантаження history data:", error);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);

    loadData();

    intervalId = setInterval(loadData, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedDistrict, activeFilter, isDistrictLoaded]);

  const chartData = useMemo(() => {
    return historyAirData.map((item) => ({
      value: item.value,
      label: item.time,
    }));
  }, [historyAirData]);

  function openAnalytics() {
    router.push({
      pathname: "/analytics" as any,
      params: {
        district: selectedDistrict,
        data: JSON.stringify(historyAirData),
      },
    });
  }

  if (!isDistrictLoaded || loading) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.message,
            {
              color: colors.textSecondary,
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          Завантаження...
        </Text>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
          accessibilityRole="header"
        >
          Історія
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {selectedDistrict} район
        </Text>
      </View>

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

      <AppCard>
        <Text
          style={[
            styles.cardTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Динаміка airIndex
        </Text>

        {chartData.length > 0 ? (
          <View
            style={styles.chartWrapper}
            accessible
            accessibilityLabel={`Графік динаміки AQI для ${selectedDistrict} району. Кількість вимірювань: ${chartData.length}.`}
          >
            <LineChart
              data={chartData}
              areaChart
              curved
              thickness={2}
              hideDataPoints
              initialSpacing={2}
              endSpacing={2}
              spacing={28}
              adjustToWidth
              noOfSections={4}
              maxValue={120}
              height={120}
              yAxisTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
              }}
              xAxisLabelTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
              }}
              rulesColor={colors.border}
              yAxisColor={colors.border}
              xAxisColor={colors.border}
              color={colors.primary}
              startFillColor={colors.primary}
              endFillColor={colors.primary}
              startOpacity={0.22}
              endOpacity={0.04}
            />
          </View>
        ) : (
          <Text
            style={[
              styles.emptyText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Немає даних для вибраного фільтра
          </Text>
        )}
      </AppCard>

      <Pressable
        style={[
          styles.analyticsButton,
          {
            backgroundColor: colors.primary,
          },
        ]}
        accessibilityRole="button"
        onPress={openAnalytics}
      >
        <Text style={styles.analyticsButtonText}>Відкрити аналітику</Text>
      </Pressable>

      <View style={styles.listBlock}>
        {historyAirData.length > 0 ? (
          historyAirData.map((item) => (
            <HistoryItemCard
              key={item.id}
              time={item.time}
              value={item.value}
            />
          ))
        ) : (
          <Text
            style={[
              styles.emptyText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Історія за цим фільтром відсутня
          </Text>
        )}
      </View>
    </ScreenContainer>
  );
}

type FilterButtonProps = {
  title: string;
  active: boolean;
  onPress: () => void;
};

function FilterButton({ title, active, onPress }: FilterButtonProps) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{
        selected: active,
      }}
      style={[
        styles.filterButton,
        {
          backgroundColor: active ? colors.primarySoft : colors.surface,

          borderColor: active ? colors.primary : colors.cardBorder,
        },
      ]}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: active ? colors.primary : colors.textSecondary,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  message: {
    fontSize: 18,
  },

  header: {
    marginBottom: 8,

    alignItems: "center",
  },

  title: {
    marginBottom: 6,

    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },

  filtersRow: {
    flexDirection: "row",
    gap: 8,

    marginBottom: 14,
  },

  filterButton: {
    flex: 1,

    alignItems: "center",

    paddingVertical: 10,

    borderRadius: 12,
    borderWidth: 1,
  },

  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  cardTitle: {
    marginBottom: 10,

    fontSize: 17,
    fontWeight: "700",
  },

  chartWrapper: {
    overflow: "hidden",

    borderRadius: 14,
  },

  analyticsButton: {
    alignItems: "center",

    marginBottom: 14,
    paddingVertical: 14,

    borderRadius: 16,
  },

  analyticsButtonText: {
    color: "#ffffff",

    fontSize: 16,
    fontWeight: "700",
  },

  listBlock: {
    marginTop: 4,
  },

  emptyText: {
    paddingVertical: 10,

    fontSize: 14,
    textAlign: "center",
  },
});
