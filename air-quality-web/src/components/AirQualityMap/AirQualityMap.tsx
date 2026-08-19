import { useEffect, useRef } from "react";
import * as mapboxgl from "mapbox-gl/esm";

import { districtCoordinates } from "../../constants/districtMap";
import type { DistrictKey } from "../../constants/districts";
import { useTheme } from "../../context/useTheme";
import type { DistrictAirData } from "../../types/air";

import "mapbox-gl/dist/mapbox-gl.css";
import "./AirQualityMap.scss";

type AirQualityMapProps = {
  districtData: DistrictAirData;
  compact?: boolean;
  loading?: boolean;
};

type MarkerStatus = "good" | "moderate" | "poor" | "unavailable";

type PopupStatus = MarkerStatus | "loading";

const districtKeys = Object.keys(districtCoordinates) as DistrictKey[];

function getMarkerStatus(value: number | undefined): MarkerStatus {
  if (value === undefined) {
    return "unavailable";
  }

  if (value <= 50) {
    return "good";
  }

  if (value <= 80) {
    return "moderate";
  }

  return "poor";
}

function getStatusLabel(status: PopupStatus) {
  switch (status) {
    case "good":
      return "Good";

    case "moderate":
      return "Moderate";

    case "poor":
      return "Poor";

    case "loading":
      return "Loading...";

    default:
      return "Unavailable";
  }
}

function formatTime(value?: string) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AirQualityMap({
  districtData,
  compact = false,
  loading = false,
}: AirQualityMapProps) {
  const { resolvedTheme } = useTheme();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<mapboxgl.Map | null>(null);

  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const initialThemeRef = useRef(resolvedTheme);

  // create map

  useEffect(() => {
    const container = mapContainerRef.current;

    const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!container) {
      return;
    }

    if (!accessToken) {
      console.error("VITE_MAPBOX_TOKEN is missing.");

      return;
    }

    const map = new mapboxgl.Map({
      container,
      accessToken,

      style: "mapbox://styles/mapbox/standard",

      center: [24.0266, 49.8326],

      zoom: compact ? 10.6 : 11.3,

      interactive: !compact,

      config: {
        basemap: {
          lightPreset: initialThemeRef.current === "dark" ? "night" : "day",

          theme: "default",

          showPointOfInterestLabels: false,

          showTransitLabels: false,
        },
      },
    });

    if (!compact) {
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    mapRef.current = map;

    return () => {
      map.remove();

      mapRef.current = null;
    };
  }, [compact]);

  // update map theme

  useEffect(() => {
    const mapInstance = mapRef.current;

    if (!mapInstance) {
      return;
    }

    const lightPreset = resolvedTheme === "dark" ? "night" : "day";

    if (mapInstance.isStyleLoaded()) {
      mapInstance.setConfigProperty("basemap", "lightPreset", lightPreset);

      return;
    }

    function handleStyleLoad() {
      const currentMap = mapRef.current;

      if (!currentMap) {
        return;
      }

      currentMap.setConfigProperty("basemap", "lightPreset", lightPreset);
    }

    mapInstance.once("style.load", handleStyleLoad);

    return () => {
      mapInstance.off("style.load", handleStyleLoad);
    };
  }, [resolvedTheme]);

  // create and update markers

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());

    markersRef.current = [];

    districtKeys.forEach((districtKey) => {
      const coordinates = districtCoordinates[districtKey];

      const data = districtData[districtKey];

      const markerStatus = getMarkerStatus(data?.airIndex);

      const isDistrictLoading = loading && !data;

      const popupStatus: PopupStatus = isDistrictLoading
        ? "loading"
        : markerStatus;

      const statusLabel = getStatusLabel(popupStatus);

      // marker

      const markerElement = document.createElement(compact ? "div" : "button");

      if (markerElement instanceof HTMLButtonElement) {
        markerElement.type = "button";
      }

      markerElement.className = `
        air-quality-map__marker
        air-quality-map__marker--${markerStatus}
        ${compact ? "air-quality-map__marker--compact" : ""}
      `;

      if (compact) {
        markerElement.setAttribute("aria-hidden", "true");
      } else {
        const aqiValue = isDistrictLoading
          ? "loading"
          : (data?.airIndex ?? "unavailable");

        markerElement.setAttribute(
          "aria-label",
          `${districtKey} district, AQI ${aqiValue}, ${statusLabel}`,
        );
      }

      const markerValue = document.createElement("strong");

      markerValue.className = "air-quality-map__marker-value";

      markerValue.textContent = data?.airIndex?.toString() ?? "—";

      markerElement.append(markerValue);

      if (!compact) {
        const markerLabel = document.createElement("span");

        markerLabel.className = "air-quality-map__marker-label";

        markerLabel.textContent = districtKey;

        markerElement.append(markerLabel);
      }

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "center",
      }).setLngLat([coordinates.longitude, coordinates.latitude]);

      // popup only on full map

      if (!compact) {
        const popupContent = document.createElement("div");

        popupContent.className = "air-quality-map__popup-content";

        // popup header

        const popupHeader = document.createElement("div");

        popupHeader.className = "air-quality-map__popup-header";

        const popupTitle = document.createElement("h3");

        popupTitle.textContent = `${districtKey} District`;

        popupHeader.append(popupTitle);

        // popup status

        const popupStatusElement = document.createElement("span");

        popupStatusElement.className = `
          air-quality-map__popup-status
          air-quality-map__popup-status--${popupStatus}
        `;

        popupStatusElement.textContent = statusLabel;

        // popup aqi

        const popupAqi = document.createElement("div");

        popupAqi.className = "air-quality-map__popup-aqi";

        const popupAqiMeta = document.createElement("div");

        popupAqiMeta.className = "air-quality-map__popup-aqi-meta";

        const popupAqiLabel = document.createElement("span");

        popupAqiLabel.textContent = "AQI";

        popupAqiMeta.append(popupAqiLabel, popupStatusElement);

        const popupAqiValue = document.createElement("strong");

        popupAqiValue.textContent = data?.airIndex?.toString() ?? "—";

        popupAqi.append(popupAqiMeta, popupAqiValue);

        // pm metrics

        const popupMetrics = document.createElement("div");

        popupMetrics.className = "air-quality-map__popup-metrics";

        // pm2.5

        const pm25 = document.createElement("div");

        const pm25Label = document.createElement("span");

        pm25Label.textContent = "PM2.5";

        const pm25Value = document.createElement("strong");

        pm25Value.textContent = data?.pm25?.toString() ?? "—";

        pm25.append(pm25Label, pm25Value);

        // pm10

        const pm10 = document.createElement("div");

        const pm10Label = document.createElement("span");

        pm10Label.textContent = "PM10";

        const pm10Value = document.createElement("strong");

        pm10Value.textContent = data?.pm10?.toString() ?? "—";

        pm10.append(pm10Label, pm10Value);

        popupMetrics.append(pm25, pm10);

        // updated time

        const popupUpdated = document.createElement("p");

        popupUpdated.className = "air-quality-map__popup-updated";

        popupUpdated.textContent = `Updated ${formatTime(data?.updatedAt)}`;

        popupContent.append(popupHeader, popupAqi, popupMetrics, popupUpdated);

        const popup = new mapboxgl.Popup({
          offset: 24,
          closeButton: true,
          closeOnClick: true,

          className: "air-quality-map__popup",

          maxWidth: "290px",
        }).setDOMContent(popupContent);

        marker.setPopup(popup);
      }

      marker.addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());

      markersRef.current = [];
    };
  }, [districtData, compact, loading]);

  return (
    <div
      className={`air-quality-map ${compact ? "air-quality-map--compact" : ""}`}
      ref={mapContainerRef}
      role={compact ? "img" : "region"}
      aria-label={
        compact
          ? "Air quality map preview"
          : "Interactive air quality map of Lviv districts"
      }
    />
  );
}

export default AirQualityMap;
