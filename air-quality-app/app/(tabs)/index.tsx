import AirStatusCard from "@/components/AirStatusCard";
import AlertCard from "@/components/AlertCard";
import RecommendationCard from "@/components/RecommendationCard";
import { useDistrict } from "@/context/DistrictContext";
import { getCurrentAirData } from "@/services/airService";
import { registerForPushNotificationsAsync } from "@/services/registerForPushNotifications";
import { CurrentAirData } from "@/types/air";
import { getAirStatus } from "@/utils/airStatus";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

const API_BASE_URL = "http://192.168.1.102:3000";

export default function HomeScreen() {
  const {
    selectedDistrict,
    watchedDistricts,
    notificationThreshold,
    notificationsEnabled,
    isDistrictLoaded,
  } = useDistrict();

  const [currentAirData, setCurrentAirData] = useState<CurrentAirData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const pushTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isDistrictLoaded) return;

    async function setupPushToken() {
      try {
        const token = await registerForPushNotificationsAsync();
        if (!token) return;

        pushTokenRef.current = token;

        await fetch(`${API_BASE_URL}/register-push-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            primaryDistrict: selectedDistrict,
            watchDistricts: watchedDistricts,
            threshold: notificationThreshold,
            notificationsEnabled,
          }),
        });
      } catch (error) {
        console.log("Помилка реєстрації push token:", error);
      }
    }

    setupPushToken();
  }, [
    isDistrictLoaded,
    selectedDistrict,
    watchedDistricts,
    notificationThreshold,
    notificationsEnabled,
  ]);

  useEffect(() => {
    if (!isDistrictLoaded) return;
    if (!pushTokenRef.current) return;

    async function syncPushSettings() {
      try {
        await fetch(`${API_BASE_URL}/register-push-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: pushTokenRef.current,
            primaryDistrict: selectedDistrict,
            watchDistricts: watchedDistricts,
            threshold: notificationThreshold,
            notificationsEnabled,
          }),
        });
      } catch (error) {
        console.log("Помилка оновлення push settings:", error);
      }
    }

    syncPushSettings();
  }, [
    selectedDistrict,
    watchedDistricts,
    notificationThreshold,
    notificationsEnabled,
    isDistrictLoaded,
  ]);

  useEffect(() => {
    if (!isDistrictLoaded) return;

    let intervalId: ReturnType<typeof setInterval>;

    async function loadData() {
      try {
        const data = await getCurrentAirData(selectedDistrict);
        setCurrentAirData(data);
      } catch (error) {
        console.log("Помилка завантаження current data:", error);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    loadData();

    intervalId = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [selectedDistrict, isDistrictLoaded]);

  if (!isDistrictLoaded || loading) {
    return <Text style={styles.message}>Завантаження...</Text>;
  }

  if (!currentAirData) {
    return <Text style={styles.message}>Не вдалося отримати дані.</Text>;
  }

  const airStatus = getAirStatus(currentAirData.airIndex);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Моніторинг якості повітря</Text>
      <Text style={styles.subtitle}>
        {currentAirData.city}, {currentAirData.district} район
      </Text>

      <AirStatusCard
        city={currentAirData.city}
        airIndex={currentAirData.airIndex}
        statusLabel={airStatus.label}
        statusColor={airStatus.color}
        updatedAt={currentAirData.updatedAt}
      />

      {currentAirData.alert && (
        <AlertCard message={currentAirData.alertMessage} />
      )}

      <RecommendationCard text={airStatus.recommendation} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  message: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    color: "#444",
    backgroundColor: "#f5f7fa",
  },
});
