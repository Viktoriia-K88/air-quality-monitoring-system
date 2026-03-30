import { useDistrict } from "@/context/DistrictContext";
import { MAPBOX_PUBLIC_TOKEN } from "@/constants/mapbox";
import { getCurrentAirData } from "@/services/airService";
import { CurrentAirData } from "@/types/air";
import { getAirStatus } from "@/utils/airStatus";
import Mapbox from "@rnmapbox/maps";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

const districtCoordinates = [
  { name: "Галицький", latitude: 49.8397, longitude: 24.0297 },
  { name: "Залізничний", latitude: 49.8305, longitude: 23.9812 },
  { name: "Личаківський", latitude: 49.8418, longitude: 24.0608 },
  { name: "Сихівський", latitude: 49.7989, longitude: 24.0587 },
  { name: "Франківський", latitude: 49.8172, longitude: 24.0072 },
  { name: "Шевченківський", latitude: 49.8673, longitude: 24.0221 },
];

type DistrictMapData = {
  [district: string]: CurrentAirData | null;
};

export default function MapScreen() {
  const { selectedDistrict, setSelectedDistrict } = useDistrict();
  const [districtData, setDistrictData] = useState<DistrictMapData>({});
  const [loading, setLoading] = useState(true);
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAllDistricts() {
      try {
        const results = await Promise.all(
          districtCoordinates.map(async (district) => {
            try {
              const data = await getCurrentAirData(district.name);
              return { district: district.name, data };
            } catch (error) {
              console.log(
                `Помилка завантаження району ${district.name}:`,
                error,
              );
              return { district: district.name, data: null };
            }
          }),
        );

        if (!isMounted) return;

        const mappedData: DistrictMapData = {};
        results.forEach(({ district, data }) => {
          mappedData[district] = data;
        });

        setDistrictData(mappedData);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAllDistricts();

    const intervalId = setInterval(() => {
      loadAllDistricts();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  function getMarkerColor(districtName: string) {
    const data = districtData[districtName];

    if (!data) return "#ef4444";

    const status = getAirStatus(data.airIndex);

    if (status.label === "Добрий") return "#22c55e";
    if (status.label === "Помірний") return "#f59e0b";
    return "#ef4444";
  }

  const activeData = activeDistrict ? districtData[activeDistrict] : null;
  const activeStatus =
    activeData && activeDistrict ? getAirStatus(activeData.airIndex) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мапа районів Львова</Text>
      <Text style={styles.subtitle}>
        {loading
          ? "Завантаження даних..."
          : `Обраний район: ${selectedDistrict}`}
      </Text>

      <View style={styles.mapWrapper}>
        <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
          <Mapbox.Camera
            zoomLevel={10.8}
            centerCoordinate={[24.0297, 49.8397]}
          />

          {districtCoordinates.map((district) => (
            <Mapbox.PointAnnotation
              key={district.name}
              id={district.name}
              coordinate={[district.longitude, district.latitude]}
              onSelected={() => {
                setSelectedDistrict(district.name);
                setActiveDistrict(district.name);
              }}
            >
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor:
                      selectedDistrict === district.name
                        ? "#2563eb"
                        : getMarkerColor(district.name),
                  },
                ]}
              />
            </Mapbox.PointAnnotation>
          ))}
        </Mapbox.MapView>
      </View>

      {activeDistrict && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{activeDistrict} район</Text>

          {activeData && activeStatus ? (
            <>
              <Text style={styles.infoText}>
                airIndex: {activeData.airIndex}
              </Text>
              <Text style={styles.infoText}>Статус: {activeStatus.label}</Text>
              <Text style={styles.infoText}>
                Оновлено: {activeData.updatedAt}
              </Text>
              <Text style={styles.infoHint}>
                Натисни інший маркер, щоб змінити район
              </Text>
            </>
          ) : (
            <Text style={styles.infoText}>Дані недоступні</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingTop: 40,
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
    marginBottom: 12,
  },
  mapWrapper: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  infoHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
});
