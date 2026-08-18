import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { HistoryAirItem } from "../../types/air";

import "./AirQualityChart.scss";

type AirQualityChartProps = {
  historyData: HistoryAirItem[];
  loading?: boolean;
};

function AirQualityChart({
  historyData,
  loading = false,
}: AirQualityChartProps) {
  const chartData = historyData.slice(-20).map((item) => ({
    time: item.time,
    aqi: item.value,
  }));

  if (loading) {
    return (
      <div
        className="air-quality-chart air-quality-chart--message"
        role="status"
      >
        Loading chart...
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="air-quality-chart air-quality-chart--message">
        No history data available.
      </div>
    );
  }

  return (
    <div
      className="air-quality-chart"
      role="img"
      aria-label={`AQI trend chart showing the last ${chartData.length} readings`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 12,
            right: 14,
            bottom: 0,
            left: -12,
          }}
        >
          <CartesianGrid
            stroke="var(--chart-grid)"
            strokeDasharray="4 6"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            minTickGap={28}
            tick={{
              fill: "var(--chart-text-muted)",
              fontSize: 11,
            }}
          />

          <YAxis
            domain={[0, 120]}
            ticks={[0, 30, 60, 90, 120]}
            axisLine={false}
            tickLine={false}
            width={38}
            tick={{
              fill: "var(--chart-text-muted)",
              fontSize: 11,
            }}
          />

          <Tooltip
            cursor={{
              stroke: "var(--chart-cursor)",
              strokeDasharray: "4 4",
            }}
            contentStyle={{
              backgroundColor: "var(--chart-tooltip-background)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
            }}
            labelStyle={{
              color: "var(--chart-text-muted)",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "var(--chart-text)",
            }}
            formatter={(value) => [value, "AQI"]}
          />

          <Line
            type="monotone"
            dataKey="aqi"
            stroke="var(--chart-line)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: "var(--chart-line)",
              stroke: "var(--chart-background)",
              strokeWidth: 3,
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AirQualityChart;
