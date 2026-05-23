import AppCard from "@/components/AppCard";
import ScreenContainer from "@/components/ScreenContainer";
import { useAppColors } from "@/hooks/useAppColors";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type AnalyticsItem = {
  id: string;
  time: string;
  value: number;
  updatedAt: string;
  district: string;
};

export default function AnalyticsScreen() {
  const colors = useAppColors();
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
    <ScreenContainer>
      <View style={styles.header}>
        <Text
          style={[styles.subtitleCentered, { color: colors.textSecondary }]}
        >
          {district} район
        </Text>
      </View>

      <AppCard>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Графік airIndex
        </Text>

        {chartData.length > 0 ? (
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              areaChart
              curved
              thickness={3}
              hideDataPoints={false}
              initialSpacing={2}
              endSpacing={2}
              spacing={42}
              adjustToWidth
              noOfSections={5}
              maxValue={120}
              yAxisTextStyle={{ color: colors.textSecondary, fontSize: 11 }}
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
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Дані для графіка відсутні
          </Text>
        )}
      </AppCard>

      <View style={styles.statsGrid}>
        <View style={styles.half}>
          <AppCard>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.avg}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Середнє
            </Text>
          </AppCard>
        </View>

        <View style={styles.half}>
          <AppCard>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.min}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Мінімум
            </Text>
          </AppCard>
        </View>

        <View style={styles.half}>
          <AppCard>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.max}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Максимум
            </Text>
          </AppCard>
        </View>

        <View style={styles.half}>
          <AppCard>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.count}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Записи
            </Text>
          </AppCard>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
    alignItems: "center",
  },
  subtitleCentered: {
    fontSize: 18,
    textAlign: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  chartWrapper: {
    overflow: "hidden",
    borderRadius: 14,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 10,
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
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
  },
});
