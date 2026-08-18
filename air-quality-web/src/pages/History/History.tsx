import { useEffect, useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import DistrictSelect from "../../components/DistrictSelect/DistrictSelect";
import { districts, type DistrictKey } from "../../constants/districts";
import { useDistrict } from "../../context/useDistrict";
import {
  getHistoryAirData,
  type HistoryRange,
} from "../../services/airService";
import type { HistoryAirItem } from "../../types/air";

import "./History.scss";

type AirQualityStatus = "Good" | "Moderate" | "Poor";

const PAGE_SIZE = 20;
const MAX_CHART_POINTS = 120;

const ranges: {
  value: HistoryRange;
  label: string;
}[] = [
  {
    value: "last20",
    label: "Last 20",
  },
  {
    value: "today",
    label: "Today",
  },
  {
    value: "yesterday",
    label: "Yesterday",
  },
];

function getAirQualityStatus(value: number): AirQualityStatus {
  if (value <= 50) {
    return "Good";
  }

  if (value <= 80) {
    return "Moderate";
  }

  return "Poor";
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sampleChartData(data: HistoryAirItem[]) {
  if (data.length <= MAX_CHART_POINTS) {
    return data;
  }

  const step = (data.length - 1) / (MAX_CHART_POINTS - 1);

  return Array.from(
    {
      length: MAX_CHART_POINTS,
    },
    (_, index) => {
      const dataIndex = Math.round(index * step);

      return data[dataIndex];
    },
  );
}

function History() {
  const { selectedDistrict, setSelectedDistrict } = useDistrict();

  const [activeRange, setActiveRange] = useState<HistoryRange>("last20");

  const [historyData, setHistoryData] = useState<HistoryAirItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [hasLoadedSuccessfully, setHasLoadedSuccessfully] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const backendDistrict = districts[selectedDistrict];

  // load history

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const data = await getHistoryAirData(backendDistrict, activeRange);

        if (!isMounted) {
          return;
        }

        setHistoryData(data);
        setHasLoadedSuccessfully(true);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load history:", loadError);

        setError("Unable to load air quality history.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    const intervalId = setInterval(loadHistory, 10000);

    return () => {
      isMounted = false;

      clearInterval(intervalId);
    };
  }, [backendDistrict, activeRange]);

  // data states

  const initialLoading = loading && !hasLoadedSuccessfully;

  const blockingError = Boolean(error && !hasLoadedSuccessfully);

  const staleError = Boolean(error && hasLoadedSuccessfully);

  let dataMessage: string | null = null;

  if (blockingError) {
    dataMessage =
      "Air quality history is temporarily unavailable. The page will retry automatically.";
  } else if (staleError) {
    dataMessage =
      "Unable to refresh history. Showing the last available readings.";
  }

  // statistics

  const stats = useMemo(() => {
    if (historyData.length === 0) {
      return {
        average: null,
        minimum: null,
        maximum: null,
        records: 0,
      };
    }

    const values = historyData.map((item) => item.value);

    const total = values.reduce((sum, value) => sum + value, 0);

    return {
      average: Number((total / values.length).toFixed(1)),

      minimum: Math.min(...values),

      maximum: Math.max(...values),

      records: values.length,
    };
  }, [historyData]);

  // chart

  const chartData = useMemo(() => {
    return sampleChartData(historyData).map((item) => ({
      time: item.time,
      aqi: item.value,
    }));
  }, [historyData]);

  // pagination

  const totalPages = Math.max(1, Math.ceil(historyData.length / PAGE_SIZE));

  const activePage = Math.min(currentPage, totalPages);

  const visibleReadings = useMemo(() => {
    const newestFirst = [...historyData].reverse();

    const start = (activePage - 1) * PAGE_SIZE;

    return newestFirst.slice(start, start + PAGE_SIZE);
  }, [historyData, activePage]);

  const unavailableCount = initialLoading || blockingError;

  const chartCount = unavailableCount ? "—" : `${historyData.length} records`;

  const tableCount = unavailableCount ? "—" : `${historyData.length} total`;

  // handlers

  function prepareNewRequest() {
    setHistoryData([]);

    setHasLoadedSuccessfully(false);

    setLoading(true);
    setError(null);
    setCurrentPage(1);
  }

  function changeDistrict(district: DistrictKey) {
    if (district === selectedDistrict) {
      return;
    }

    prepareNewRequest();

    setSelectedDistrict(district);
  }

  function changeRange(range: HistoryRange) {
    if (range === activeRange) {
      return;
    }

    prepareNewRequest();

    setActiveRange(range);
  }

  return (
    <section className="history">
      <header className="history__header">
        <div>
          <h1 className="history__title">History</h1>

          <p className="history__subtitle">Historical air quality analytics</p>
        </div>

        <div className="history__location">
          <div className="history__city">
            <span className="history__location-label">City</span>

            <strong className="history__city-name">Lviv</strong>
          </div>

          <span className="history__location-divider" aria-hidden="true" />

          <div className="history__district">
            <span className="history__location-label">District</span>

            <DistrictSelect
              value={selectedDistrict}
              onChange={changeDistrict}
            />
          </div>
        </div>
      </header>

      <div className="history__toolbar">
        <div className="history__filters">
          {ranges.map((range) => {
            const isActive = activeRange === range.value;

            return (
              <button
                key={range.value}
                className={`history__filter ${
                  isActive ? "history__filter--active" : ""
                }`}
                type="button"
                aria-pressed={isActive}
                onClick={() => changeRange(range.value)}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {dataMessage && (
        <div
          className={`history__data-message ${
            blockingError
              ? "history__data-message--error"
              : "history__data-message--warning"
          }`}
          role={blockingError ? "alert" : "status"}
        >
          <TriangleAlert size={18} strokeWidth={1.8} aria-hidden="true" />

          <span>{dataMessage}</span>
        </div>
      )}

      <div className="history__stats">
        <div className="history__stat">
          <span className="history__stat-label">Average AQI</span>

          <strong className="history__stat-value">
            {unavailableCount ? "—" : (stats.average ?? "—")}
          </strong>

          <span className="history__stat-caption">Selected period</span>
        </div>

        <div className="history__stat">
          <span className="history__stat-label">Minimum</span>

          <strong className="history__stat-value">
            {unavailableCount ? "—" : (stats.minimum ?? "—")}
          </strong>

          <span className="history__stat-caption">Lowest AQI</span>
        </div>

        <div className="history__stat">
          <span className="history__stat-label">Maximum</span>

          <strong className="history__stat-value">
            {unavailableCount ? "—" : (stats.maximum ?? "—")}
          </strong>

          <span className="history__stat-caption">Highest AQI</span>
        </div>

        <div className="history__stat">
          <span className="history__stat-label">Records</span>

          <strong className="history__stat-value">
            {unavailableCount ? "—" : stats.records}
          </strong>

          <span className="history__stat-caption">Measurements</span>
        </div>
      </div>

      <article className="history__chart-card">
        <div className="history__panel-header">
          <div>
            <h2 className="history__panel-title">AQI History</h2>

            <p className="history__panel-subtitle">
              {selectedDistrict} district
            </p>
          </div>

          <span className="history__chart-count">{chartCount}</span>
        </div>

        <div className="history__chart">
          {initialLoading ? (
            <div className="history__message">Loading history...</div>
          ) : blockingError ? (
            <div
              className="history__message history__message--error"
              role="alert"
            >
              Unable to load history data.
            </div>
          ) : chartData.length > 0 ? (
            <div
              className="history__chart-visual"
              role="img"
              aria-label={`AQI history chart for ${selectedDistrict} district`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 18,
                    bottom: 0,
                    left: -10,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="historyAqiGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--history-chart-line)"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="100%"
                        stopColor="var(--history-chart-line)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="var(--history-chart-grid)"
                    strokeDasharray="4 6"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={42}
                    tick={{
                      fill: "var(--history-chart-muted)",
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    domain={[0, 120]}
                    ticks={[0, 30, 60, 90, 120]}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tick={{
                      fill: "var(--history-chart-muted)",
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "var(--history-chart-cursor)",
                      strokeDasharray: "4 4",
                    }}
                    contentStyle={{
                      backgroundColor: "var(--history-tooltip-background)",
                      border: "1px solid var(--history-tooltip-border)",
                      borderRadius: "10px",
                      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
                    }}
                    labelStyle={{
                      color: "var(--history-chart-muted)",
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      color: "var(--history-chart-text)",
                    }}
                    formatter={(value) => [value, "AQI"]}
                  />

                  <Area
                    type="monotone"
                    dataKey="aqi"
                    stroke="var(--history-chart-line)"
                    strokeWidth={2.5}
                    fill="url(#historyAqiGradient)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "var(--history-chart-line)",
                      stroke: "var(--history-chart-background)",
                      strokeWidth: 3,
                    }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="history__message">
              No measurements available for this period.
            </div>
          )}
        </div>
      </article>

      <article className="history__table-card">
        <div className="history__panel-header">
          <div>
            <h2 className="history__panel-title">Measurements</h2>

            <p className="history__panel-subtitle">
              Detailed particulate and AQI readings
            </p>
          </div>

          <span className="history__table-count">{tableCount}</span>
        </div>

        {initialLoading ? (
          <div className="history__table-message">Loading measurements...</div>
        ) : blockingError ? (
          <div
            className="history__table-message history__table-message--error"
            role="alert"
          >
            Unable to load measurements.
          </div>
        ) : visibleReadings.length > 0 ? (
          <>
            <div className="history__table-wrapper">
              <table
                className="history__table"
                aria-label="Air quality measurements"
              >
                <thead>
                  <tr>
                    <th scope="col">Date & Time</th>

                    <th scope="col">AQI</th>

                    <th scope="col">PM2.5</th>

                    <th scope="col">PM10</th>

                    <th scope="col">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleReadings.map((reading) => {
                    const status = getAirQualityStatus(reading.value);

                    const statusClass = status.toLowerCase();

                    return (
                      <tr key={reading.id}>
                        <td>{formatDateTime(reading.updatedAt)}</td>

                        <td>
                          <strong>{reading.value}</strong>
                        </td>

                        <td>{reading.pm25 ?? "—"}</td>

                        <td>{reading.pm10 ?? "—"}</td>

                        <td>
                          <span
                            className={`history__status history__status--${statusClass}`}
                          >
                            <i aria-hidden="true" />

                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav
                className="history__pagination"
                aria-label="History pagination"
              >
                <button
                  className="history__page-button"
                  type="button"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(activePage - 1)}
                >
                  Previous
                </button>

                <span className="history__page-info">
                  Page {activePage} of {totalPages}
                </span>

                <button
                  className="history__page-button"
                  type="button"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(activePage + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="history__table-message">
            No measurements available for this period.
          </div>
        )}
      </article>
    </section>
  );
}

export default History;
