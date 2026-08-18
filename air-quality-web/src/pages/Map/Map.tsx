import { useEffect, useRef, useState } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";

import AirQualityMap from "../../components/AirQualityMap/AirQualityMap";
import { districts, type DistrictKey } from "../../constants/districts";
import { getCurrentAirData } from "../../services/airService";
import type { DistrictAirData } from "../../types/air";

import "./Map.scss";

type MapDataState = "loading" | "ready" | "partial" | "error" | "stale";

const districtKeys = Object.keys(districts) as DistrictKey[];

function MapPage() {
  const [districtData, setDistrictData] = useState<DistrictAirData>({});

  const [dataState, setDataState] = useState<MapDataState>("loading");

  const hasLoadedDataRef = useRef(false);

  // load district data

  useEffect(() => {
    let isMounted = true;

    async function loadDistrictData() {
      const results = await Promise.allSettled(
        districtKeys.map(async (districtKey) => {
          const data = await getCurrentAirData(districts[districtKey]);

          return [districtKey, data] as const;
        }),
      );

      if (!isMounted) {
        return;
      }

      const successfulData: DistrictAirData = {};

      let successfulCount = 0;
      let failedCount = 0;

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const [districtKey, data] = result.value;

          successfulData[districtKey] = data;

          successfulCount += 1;

          return;
        }

        failedCount += 1;

        console.error("Failed to load district air data:", result.reason);
      });

      // at least some data received

      if (successfulCount > 0) {
        setDistrictData((currentDistrictData) => ({
          ...currentDistrictData,
          ...successfulData,
        }));

        hasLoadedDataRef.current = true;

        if (failedCount > 0) {
          setDataState("partial");
        } else {
          setDataState("ready");
        }

        return;
      }

      // no data received

      if (hasLoadedDataRef.current) {
        setDataState("stale");
      } else {
        setDataState("error");
      }
    }

    loadDistrictData();

    const intervalId = setInterval(loadDistrictData, 10000);

    return () => {
      isMounted = false;

      clearInterval(intervalId);
    };
  }, []);

  const isLoading = dataState === "loading";

  return (
    <section className="map-page" aria-busy={isLoading}>
      <header className="map-page__header">
        <div>
          <h1 className="map-page__title">Air Quality Map</h1>

          <p className="map-page__subtitle">
            Explore air quality across Lviv districts
          </p>
        </div>
      </header>

      {dataState === "loading" && (
        <div
          className="map-page__data-message map-page__data-message--loading"
          role="status"
        >
          <LoaderCircle size={18} strokeWidth={1.8} aria-hidden="true" />

          <span>Loading district air quality data...</span>
        </div>
      )}

      {dataState === "error" && (
        <div
          className="map-page__data-message map-page__data-message--error"
          role="alert"
        >
          <TriangleAlert size={18} strokeWidth={1.8} aria-hidden="true" />

          <span>
            Air quality data is temporarily unavailable. The map will retry
            automatically.
          </span>
        </div>
      )}

      {dataState === "stale" && (
        <div
          className="map-page__data-message map-page__data-message--warning"
          role="status"
        >
          <TriangleAlert size={18} strokeWidth={1.8} aria-hidden="true" />

          <span>
            Unable to refresh map data. Showing the last available readings.
          </span>
        </div>
      )}

      {dataState === "partial" && (
        <div
          className="map-page__data-message map-page__data-message--warning"
          role="status"
        >
          <TriangleAlert size={18} strokeWidth={1.8} aria-hidden="true" />

          <span>
            Some district readings could not be refreshed. Showing the latest
            available data.
          </span>
        </div>
      )}

      <div className="map-page__map">
        <AirQualityMap districtData={districtData} loading={isLoading} />
      </div>
    </section>
  );
}

export default MapPage;
