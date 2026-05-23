import AppCard from "@/components/AppCard";
import { MAPBOX_PUBLIC_TOKEN } from "@/constants/mapbox";
import { useDistrict } from "@/context/DistrictContext";
import { useAppColors } from "@/hooks/useAppColors";
import { getCurrentAirData } from "@/services/airService";
import { CurrentAirData } from "@/types/air";
import { getAirStatus } from "@/utils/airStatus";
import Mapbox from "@rnmapbox/maps";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

function formatTime(value: string) {
  const date = new Date(value);

  if (isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MapScreen() {
  const colors = useAppColors();
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
    if (selectedDistrict === districtName) {
      return "#3b82f6";
    }

    return "#ef4444";
  }

  const activeData = activeDistrict ? districtData[activeDistrict] : null;
  const activeStatus =
    activeData && activeDistrict ? getAirStatus(activeData.airIndex) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Мапа</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {loading
            ? "Завантаження даних..."
            : `Обраний район: ${selectedDistrict}`}
        </Text>
      </View>

      <View
        style={[
          styles.mapWrapper,
          {
            borderColor: colors.cardBorder,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
          <Mapbox.Camera
            zoomLevel={10.8}
            centerCoordinate={[24.0297, 49.8397]}
          />

          {districtCoordinates.map((district) => (
            <Mapbox.MarkerView
              key={`${district.name}-${selectedDistrict}-${districtData[district.name]?.airIndex ?? "no-data"}`}
              id={district.name}
              coordinate={[district.longitude, district.latitude]}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Pressable
                onPress={() => {
                  setSelectedDistrict(district.name);
                  setActiveDistrict(district.name);
                }}
              >
                <View
                  style={[
                    styles.marker,
                    selectedDistrict === district.name && styles.markerSelected,
                    {
                      backgroundColor: getMarkerColor(district.name),
                    },
                  ]}
                />
              </Pressable>
            </Mapbox.MarkerView>
          ))}
        </Mapbox.MapView>
      </View>

      {activeDistrict && (
        <AppCard>
          <View style={styles.infoHeader}>
            <View style={styles.infoHeaderLeft}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                {activeDistrict} район
              </Text>
              <Text style={[styles.infoSub, { color: colors.textSecondary }]}>
                Львів
              </Text>
            </View>
          </View>

          {activeData && activeStatus ? (
            <>
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  airIndex
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {activeData.airIndex}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  Статус
                </Text>
                <Text
                  style={[styles.infoValueSmall, { color: activeStatus.color }]}
                >
                  {activeStatus.label}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  Оновлено
                </Text>
                <Text style={[styles.infoValueSmall, { color: colors.text }]}>
                  {formatTime(activeData.updatedAt)}
                </Text>
              </View>

              <Text style={[styles.infoHint, { color: colors.textSecondary }]}>
                Натисни інший маркер, щоб змінити район
              </Text>
            </>
          ) : (
            <Text style={[styles.infoHint, { color: colors.textSecondary }]}>
              Дані недоступні
            </Text>
          )}
        </AppCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  markerSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  infoHeader: {
    marginBottom: 14,
    alignItems: "center",
  },
  infoHeaderLeft: {
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  infoSub: {
    fontSize: 14,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 32,
    fontWeight: "800",
  },
  infoValueSmall: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoHint: {
    fontSize: 13,
    marginTop: 6,
  },
});
