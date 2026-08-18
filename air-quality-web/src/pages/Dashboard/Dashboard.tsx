import { useEffect, useState, type CSSProperties } from "react";

import {
  Bell,
  ExternalLink,
  HeartPulse,
  Leaf,
  PersonStanding,
  TriangleAlert,
  Wind,
} from "lucide-react";

import { Link } from "react-router";

import AirQualityChart from "../../components/AirQualityChart/AirQualityChart";
import AirQualityMap from "../../components/AirQualityMap/AirQualityMap";
import DistrictSelect from "../../components/DistrictSelect/DistrictSelect";

import { districts, type DistrictKey } from "../../constants/districts";

import { useDistrict } from "../../context/useDistrict";

import {
  getCurrentAirData,
  getHistoryAirData,
} from "../../services/airService";

import type {
  CurrentAirData,
  DistrictAirData,
  HistoryAirItem,
} from "../../types/air";

import "./Dashboard.scss";

type AirQualityStatus = "Good" | "Moderate" | "Poor";

const districtKeys = Object.keys(districts) as DistrictKey[];

function getAirQualityInfo(aqiValue: number): {
  status: AirQualityStatus;
  recommendation: string;
} {
  if (aqiValue <= 50) {
    return {
      status: "Good",
      recommendation:
        "Air quality is good. Outdoor activities can continue as usual.",
    };
  }

  if (aqiValue <= 80) {
    return {
      status: "Moderate",
      recommendation:
        "Sensitive people should reduce prolonged outdoor activity.",
    };
  }

  return {
    status: "Poor",
    recommendation:
      "Reduce prolonged outdoor activity and avoid strenuous exercise outdoors.",
  };
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const recommendations = [
  {
    icon: PersonStanding,
    text: "Limit prolonged outdoor exercise.",
  },
  {
    icon: Wind,
    text: "Ventilate indoor spaces carefully.",
  },
  {
    icon: HeartPulse,
    text: "Take breaks if you feel discomfort.",
  },
  {
    icon: Bell,
    text: "Check updates before outdoor plans.",
  },
];

function Dashboard() {
  const { selectedDistrict, setSelectedDistrict } = useDistrict();

  const [currentData, setCurrentData] = useState<CurrentAirData | null>(null);

  const [historyData, setHistoryData] = useState<HistoryAirItem[]>([]);

  const [districtData, setDistrictData] = useState<DistrictAirData>({});

  const [currentLoading, setCurrentLoading] = useState(true);

  const [historyLoading, setHistoryLoading] = useState(true);

  const [currentError, setCurrentError] = useState<string | null>(null);

  const [historyError, setHistoryError] = useState<string | null>(null);

  const backendDistrict = districts[selectedDistrict];

  // current district + history

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      const [currentResult, historyResult] = await Promise.allSettled([
        getCurrentAirData(backendDistrict),
        getHistoryAirData(backendDistrict),
      ]);

      if (!isMounted) {
        return;
      }

      if (currentResult.status === "fulfilled") {
        setCurrentData(currentResult.value);

        setCurrentError(null);
      } else {
        console.error("Failed to load current air data:", currentResult.reason);

        setCurrentError("Unable to load current air quality data.");
      }

      if (historyResult.status === "fulfilled") {
        setHistoryData(historyResult.value);

        setHistoryError(null);
      } else {
        console.error(
          "Failed to load air quality history:",
          historyResult.reason,
        );

        setHistoryError("Unable to load air quality history.");
      }

      setCurrentLoading(false);
      setHistoryLoading(false);
    }

    loadDashboardData();

    const intervalId = setInterval(loadDashboardData, 10000);

    return () => {
      isMounted = false;

      clearInterval(intervalId);
    };
  }, [backendDistrict]);

  // all districts for map

  useEffect(() => {
    let isMounted = true;

    async function loadMapData() {
      const results = await Promise.allSettled(
        districtKeys.map(async (districtKey) => {
          const data = await getCurrentAirData(districts[districtKey]);

          return [districtKey, data] as const;
        }),
      );

      if (!isMounted) {
        return;
      }

      setDistrictData((currentDistrictData) => {
        const nextDistrictData = {
          ...currentDistrictData,
        };

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            const [districtKey, data] = result.value;

            nextDistrictData[districtKey] = data;
          } else {
            console.error("Failed to load map data:", result.reason);
          }
        });

        return nextDistrictData;
      });
    }

    loadMapData();

    const intervalId = setInterval(loadMapData, 10000);

    return () => {
      isMounted = false;

      clearInterval(intervalId);
    };
  }, []);

  const hasCurrentData = currentData !== null;

  const hasHistoryData = historyData.length > 0;

  const currentUnavailable = Boolean(currentError && !hasCurrentData);

  const historyUnavailable = Boolean(historyError && !hasHistoryData);

  const hasBlockingError = currentUnavailable || historyUnavailable;

  const hasStaleData = Boolean(
    (currentError && hasCurrentData) || (historyError && hasHistoryData),
  );

  let dataMessage: string | null = null;

  if (currentUnavailable && historyUnavailable) {
    dataMessage =
      "Air quality data is temporarily unavailable. The dashboard will retry automatically.";
  } else if (currentUnavailable) {
    dataMessage =
      "Current air quality data is temporarily unavailable. The dashboard will retry automatically.";
  } else if (historyUnavailable) {
    dataMessage =
      "Historical readings are temporarily unavailable. The dashboard will retry automatically.";
  } else if (hasStaleData) {
    dataMessage =
      "Unable to refresh some data. Showing the last available readings.";
  }

  const aqi = currentData?.airIndex ?? 0;

  const airQualityInfo = currentData
    ? getAirQualityInfo(currentData.airIndex)
    : null;

  const status = airQualityInfo?.status ?? null;

  const statusClass = status?.toLowerCase() ?? "unavailable";

  const recommendation = currentLoading
    ? "Loading current air quality data..."
    : airQualityInfo
      ? airQualityInfo.recommendation
      : "Current air quality data is temporarily unavailable.";

  const gaugeProgress = currentData ? Math.max(0, Math.min(aqi, 100)) : 0;

  const gaugeStyle = {
    "--aqi-progress": `${gaugeProgress}%`,
  } as CSSProperties;

  const recentReadings = historyData.slice(-4).reverse();

  const updatedText = currentLoading
    ? "Updating..."
    : currentData
      ? `${currentError ? "Last updated" : "Updated"} ${formatTime(
          currentData.updatedAt,
        )}`
      : "Updated —";

  function changeDistrict(district: DistrictKey) {
    if (district === selectedDistrict) {
      return;
    }

    // old district data must not be
    // displayed as data for the new district

    setCurrentData(null);
    setHistoryData([]);

    setCurrentError(null);
    setHistoryError(null);

    setCurrentLoading(true);
    setHistoryLoading(true);

    setSelectedDistrict(district);
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>

          <p className="dashboard__subtitle">Real-time air quality overview</p>
        </div>

        <div className="dashboard__location">
          <div className="dashboard__city">
            <span className="dashboard__location-label">City</span>

            <span className="dashboard__city-name">Lviv</span>
          </div>

          <div className="dashboard__location-divider" aria-hidden="true" />

          <div className="dashboard__district">
            <span className="dashboard__location-label">District</span>

            <DistrictSelect
              value={selectedDistrict}
              onChange={changeDistrict}
            />
          </div>
        </div>
      </header>

      {dataMessage && (
        <div
          className={`dashboard__data-message ${
            hasBlockingError
              ? "dashboard__data-message--error"
              : "dashboard__data-message--warning"
          }`}
          role={hasBlockingError ? "alert" : "status"}
        >
          <TriangleAlert size={18} strokeWidth={1.8} aria-hidden="true" />

          <span>{dataMessage}</span>
        </div>
      )}

      <div className="dashboard__top-grid">
        <div className="dashboard__aqi-card">
          <div
            className={`dashboard__gauge dashboard__gauge--${statusClass}`}
            style={gaugeStyle}
          >
            <div className="dashboard__gauge-content">
              <span className="dashboard__gauge-label">AQI</span>

              <strong className="dashboard__gauge-value">
                {currentData ? currentData.airIndex : "—"}
              </strong>

              <span
                className={`dashboard__gauge-status dashboard__gauge-status--${statusClass}`}
              >
                {currentLoading
                  ? "Loading..."
                  : currentData
                    ? status
                    : "Unavailable"}
              </span>
            </div>
          </div>

          <div className="dashboard__pollutants">
            <div className="dashboard__pollutant">
              <span>PM2.5</span>

              <strong>{currentData?.pm25 ?? "—"}</strong>

              <i aria-hidden="true" />
            </div>

            <div className="dashboard__pollutant">
              <span>PM10</span>

              <strong>{currentData?.pm10 ?? "—"}</strong>

              <i aria-hidden="true" />
            </div>
          </div>

          <p className="dashboard__updated">{updatedText}</p>
        </div>

        <article className="dashboard__trend">
          <div className="dashboard__panel-header">
            <h2 className="dashboard__panel-title">AQI Trend</h2>

            <span className="dashboard__range-label">Last 20 readings</span>
          </div>

          {historyError && !hasHistoryData && !historyLoading ? (
            <div
              className="dashboard__chart-message dashboard__chart-message--error"
              role="alert"
            >
              Unable to load history data.
            </div>
          ) : (
            <AirQualityChart
              historyData={historyData}
              loading={historyLoading}
            />
          )}

          <Link className="dashboard__action-link" to="/history">
            Open analytics
            <span aria-hidden="true">›</span>
          </Link>
        </article>
      </div>

      <div className="dashboard__bottom-grid">
        <article className="dashboard__recommendation">
          <h2 className="dashboard__panel-title">Recommendation</h2>

          <div className="dashboard__recommendation-main">
            <div className="dashboard__recommendation-icon" aria-hidden="true">
              <Leaf size={24} strokeWidth={1.8} />
            </div>

            <p className="dashboard__recommendation-message">
              {recommendation}
            </p>
          </div>

          <div className="dashboard__tips">
            {recommendations.map(({ icon: Icon, text }) => (
              <div className="dashboard__tip" key={text}>
                <div className="dashboard__tip-icon" aria-hidden="true">
                  <Icon size={21} strokeWidth={1.7} />
                </div>

                <p>{text}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="dashboard__bottom-right">
          <article className="dashboard__map">
            <div className="dashboard__panel-header">
              <h2 className="dashboard__panel-title">Air Quality Map</h2>

              <Link className="dashboard__small-link" to="/map">
                Explore map
                <ExternalLink size={13} aria-hidden="true" />
              </Link>
            </div>

            <div className="dashboard__map-preview">
              <AirQualityMap districtData={districtData} compact />
            </div>
          </article>

          <article className="dashboard__readings-card">
            <div className="dashboard__panel-header">
              <h2 className="dashboard__panel-title">Recent Readings</h2>

              <Link className="dashboard__small-link" to="/history">
                View all
              </Link>
            </div>

            <div className="dashboard__readings">
              <div className="dashboard__readings-head">
                <span>Time</span>

                <span>AQI</span>

                <span>PM2.5</span>

                <span>PM10</span>

                <span>Status</span>
              </div>

              {historyLoading ? (
                <div className="dashboard__readings-message">
                  Loading readings...
                </div>
              ) : historyError && !hasHistoryData ? (
                <div
                  className="dashboard__readings-message dashboard__readings-message--error"
                  role="alert"
                >
                  Unable to load readings.
                </div>
              ) : recentReadings.length > 0 ? (
                recentReadings.map((reading) => {
                  const readingStatus = getAirQualityInfo(reading.value).status;

                  return (
                    <div className="dashboard__reading" key={reading.id}>
                      <span>{reading.time}</span>

                      <strong>{reading.value}</strong>

                      <span>{reading.pm25 ?? "—"}</span>

                      <span>{reading.pm10 ?? "—"}</span>

                      <span
                        className={`dashboard__reading-status dashboard__reading-status--${readingStatus.toLowerCase()}`}
                      >
                        <i aria-hidden="true" />

                        {readingStatus}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="dashboard__readings-message">
                  No readings available.
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
