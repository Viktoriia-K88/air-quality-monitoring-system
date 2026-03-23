import { useDistrict } from "@/context/DistrictContext";
import { getCurrentAirData } from "@/services/airService";
import { CurrentAirData } from "@/types/air";
import { getAirStatus } from "@/utils/airStatus";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";

const districtCoordinates = [
  {
    name: "Галицький",
    latitude: 49.8397,
    longitude: 24.0297,
  },
  {
    name: "Залізничний",
    latitude: 49.8305,
    longitude: 23.9812,
  },
  {
    name: "Личаківський",
    latitude: 49.8418,
    longitude: 24.0608,
  },
  {
    name: "Сихівський",
    latitude: 49.7989,
    longitude: 24.0587,
  },
  {
    name: "Франківський",
    latitude: 49.8172,
    longitude: 24.0072,
  },
  {
    name: "Шевченківський",
    latitude: 49.8673,
    longitude: 24.0221,
  },
];

type DistrictMapData = {
  [district: string]: CurrentAirData | null;
};

export default function MapScreen() {
  const { selectedDistrict, setSelectedDistrict } = useDistrict();
  const [districtData, setDistrictData] = useState<DistrictMapData>({});
  const [loading, setLoading] = useState(true);

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

    if (!data) return "red";

    const status = getAirStatus(data.airIndex);

    if (status.label === "Добрий") return "green";
    if (status.label === "Помірний") return "orange";
    return "red";
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мапа районів Львова</Text>
      <Text style={styles.subtitle}>
        {loading
          ? "Завантаження даних..."
          : `Обраний район: ${selectedDistrict}`}
      </Text>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 49.8397,
          longitude: 24.0297,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
      >
        {districtCoordinates.map((district) => {
          const data = districtData[district.name];
          const airStatus = data ? getAirStatus(data.airIndex) : null;

          return (
            <Marker
              key={district.name}
              coordinate={{
                latitude: district.latitude,
                longitude: district.longitude,
              }}
              pinColor={
                selectedDistrict === district.name
                  ? "blue"
                  : getMarkerColor(district.name)
              }
              onPress={() => setSelectedDistrict(district.name)}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{district.name} район</Text>

                  {data && airStatus ? (
                    <>
                      <Text style={styles.calloutText}>
                        airIndex: {data.airIndex}
                      </Text>
                      <Text style={styles.calloutText}>
                        Статус: {airStatus.label}
                      </Text>
                      <Text style={styles.calloutText}>
                        Оновлено: {data.updatedAt}
                      </Text>
                      <Text style={styles.calloutHint}>
                        Натисни маркер, щоб обрати район
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.calloutText}>Дані недоступні</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
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
  map: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  callout: {
    width: 180,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  calloutText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  calloutHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
});
