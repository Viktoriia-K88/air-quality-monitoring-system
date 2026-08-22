import AppCard from "@/components/AppCard";
import ScreenContainer from "@/components/ScreenContainer";
import { useAppColors } from "@/hooks/useAppColors";
import { getHistoryAirData, type HistoryRange } from "@/services/airService";
import type { HistoryAirItem } from "@/types/air";

import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const MAX_CHART_POINTS = 120;

export default function AnalyticsScreen() {
  const colors = useAppColors();
  const params = useLocalSearchParams();

  const district = typeof params.district === "string" ? params.district : "";

  const range: HistoryRange =
    params.range === "today" ||
    params.range === "yesterday" ||
    params.range === "last20"
      ? params.range
      : "last20";

  const [historyData, setHistoryData] = useState<HistoryAirItem[]>([]);
  const [loading, setLoading] = useState(true);

  // load analytics data

  useEffect(() => {
    if (!district) {
      setLoading(false);
      return;
    }

    let isActive = true;

    async function loadData() {
      try {
        const data = await getHistoryAirData(district, range);

        if (isActive) {
          setHistoryData(data);
        }
      } catch (error) {
        console.log("Помилка завантаження analytics data:", error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [district, range]);

  // reduce chart points

  const chartData = useMemo(() => {
    if (historyData.length === 0) {
      return [];
    }

    let dataForChart = historyData;

    if (historyData.length > MAX_CHART_POINTS) {
      const step = (historyData.length - 1) / (MAX_CHART_POINTS - 1);

      dataForChart = Array.from({ length: MAX_CHART_POINTS }, (_, index) => {
        const itemIndex = Math.round(index * step);

        return historyData[itemIndex];
      });
    }

    return dataForChart.map((item, index) => ({
      value: item.value,
      label: dataForChart.length > 30 && index % 10 !== 0 ? "" : item.time,
    }));
  }, [historyData]);

  // calculate statistics

  const stats = useMemo(() => {
    if (historyData.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        count: 0,
      };
    }

    let min = historyData[0].value;
    let max = historyData[0].value;
    let sum = 0;

    for (const item of historyData) {
      if (item.value < min) {
        min = item.value;
      }

      if (item.value > max) {
        max = item.value;
      }

      sum += item.value;
    }

    return {
      min,
      max,
      avg: Number((sum / historyData.length).toFixed(1)),
      count: historyData.length,
    };
  }, [historyData]);

  if (loading) {
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
            styles.subtitleCentered,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {district} район
        </Text>
      </View>

      <AppCard>
        <Text
          style={[
            styles.cardTitle,
            {
              color: colors.text,
            },
          ]}
          accessibilityRole="header"
        >
          Графік airIndex
        </Text>

        {chartData.length > 0 ? (
          <View
            style={styles.chartWrapper}
            accessible
            accessibilityLabel={`Графік AQI для ${district} району. Кількість вимірювань: ${historyData.length}.`}
          >
            <LineChart
              data={chartData}
              areaChart
              curved
              thickness={3}
              hideDataPoints={chartData.length > 30}
              initialSpacing={2}
              endSpacing={2}
              spacing={42}
              adjustToWidth
              noOfSections={5}
              maxValue={120}
              yAxisTextStyle={{
                color: colors.textSecondary,
                fontSize: 11,
              }}
              xAxisLabelTextStyle={{
                color: colors.textSecondary,
                fontSize: 11,
              }}
              rulesColor={colors.border}
              yAxisColor={colors.border}
              xAxisColor={colors.border}
              color={colors.primary}
              dataPointsColor={colors.primary}
              startFillColor={colors.primary}
              endFillColor={colors.primary}
              startOpacity={0.2}
              endOpacity={0.03}
              textColor1={colors.textSecondary}
              textShiftY={4}
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
            Дані для графіка відсутні
          </Text>
        )}
      </AppCard>

      <View style={styles.statsGrid}>
        <View
          style={styles.half}
          accessible
          accessibilityLabel={`Середнє AQI: ${stats.avg}`}
        >
          <AppCard>
            <Text
              style={[
                styles.statValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {stats.avg}
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Середнє
            </Text>
          </AppCard>
        </View>

        <View
          style={styles.half}
          accessible
          accessibilityLabel={`Мінімальне AQI: ${stats.min}`}
        >
          <AppCard>
            <Text
              style={[
                styles.statValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {stats.min}
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Мінімум
            </Text>
          </AppCard>
        </View>

        <View
          style={styles.half}
          accessible
          accessibilityLabel={`Максимальне AQI: ${stats.max}`}
        >
          <AppCard>
            <Text
              style={[
                styles.statValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {stats.max}
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Максимум
            </Text>
          </AppCard>
        </View>

        <View
          style={styles.half}
          accessible
          accessibilityLabel={`Кількість записів: ${stats.count}`}
        >
          <AppCard>
            <Text
              style={[
                styles.statValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {stats.count}
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Записи
            </Text>
          </AppCard>
        </View>
      </View>
    </ScreenContainer>
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
    alignItems: "center",
    marginBottom: 8,
  },

  subtitleCentered: {
    fontSize: 18,
    textAlign: "center",
  },

  cardTitle: {
    marginBottom: 14,
    fontSize: 18,
    fontWeight: "700",
  },

  chartWrapper: {
    overflow: "hidden",
    borderRadius: 14,
  },

  emptyText: {
    paddingVertical: 10,
    fontSize: 15,
    textAlign: "center",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  half: {
    width: "50%",
    paddingHorizontal: 6,
  },

  statValue: {
    marginBottom: 6,
    fontSize: 30,
    fontWeight: "800",
  },

  statLabel: {
    fontSize: 14,
  },
});
