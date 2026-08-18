import AirStatusCard from "@/components/AirStatusCard";
import RecommendationCard from "@/components/RecommendationCard";
import ScreenContainer from "@/components/ScreenContainer";
import { useDistrict } from "@/context/DistrictContext";
import { useAppColors } from "@/hooks/useAppColors";
import { getCurrentAirData } from "@/services/airService";
import { registerForPushNotificationsAsync } from "@/services/registerForPushNotifications";
import type { CurrentAirData } from "@/types/air";
import { getAirStatus } from "@/utils/airStatus";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const API_BASE_URL = "http://192.168.1.101:3000";

export default function HomeScreen() {
  const colors = useAppColors();

  const isLight = colors.background === "#f5f7fa";

  const homeColors = {
    circleBg: isLight ? "#ffffff" : "#182a4a",
    metricBg: isLight ? "#ffffff" : "#1b2f52",
  };

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

  // sync expo push settings

  useEffect(() => {
    if (!isDistrictLoaded) {
      return;
    }

    async function syncPushSettings() {
      try {
        let token = pushTokenRef.current;

        if (!token) {
          token = await registerForPushNotificationsAsync();

          if (!token) {
            return;
          }

          pushTokenRef.current = token;
        }

        const response = await fetch(`${API_BASE_URL}/register-push-token`, {
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

        if (!response.ok) {
          throw new Error(
            `Failed to sync Expo Push settings. Status: ${response.status}.`,
          );
        }
      } catch (error) {
        console.log("Помилка синхронізації push settings:", error);
      }
    }

    syncPushSettings();
  }, [
    isDistrictLoaded,
    selectedDistrict,
    watchedDistricts,
    notificationThreshold,
    notificationsEnabled,
  ]);

  // load current air data

  useEffect(() => {
    if (!isDistrictLoaded) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;

    async function loadData() {
      try {
        const data = await getCurrentAirData(selectedDistrict);

        setCurrentAirData(data);
      } catch (error) {
        console.log("Помилка завантаження current data:", error);

        setCurrentAirData(null);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);

    loadData();

    intervalId = setInterval(loadData, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedDistrict, isDistrictLoaded]);

  if (!isDistrictLoaded || loading) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel="Завантаження даних"
        />

        <Text
          style={[
            styles.loadingText,
            {
              color: colors.textSecondary,
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          Завантаження даних...
        </Text>
      </View>
    );
  }

  if (!currentAirData) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.errorText,
            {
              color: colors.danger,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          Не вдалося отримати дані
        </Text>
      </View>
    );
  }

  const airStatus = getAirStatus(currentAirData.airIndex);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text
          style={[
            styles.screenTitle,
            {
              color: colors.text,
            },
          ]}
          accessibilityRole="header"
        >
          Якість повітря
        </Text>

        <Text
          style={[
            styles.screenSubtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {currentAirData.city}, {currentAirData.district} район
        </Text>
      </View>

      <AirStatusCard
        airIndex={currentAirData.airIndex}
        statusLabel={airStatus.label}
        statusColor={airStatus.color}
        updatedAt={currentAirData.updatedAt}
        backgroundColor={homeColors.circleBg}
      />

      <View style={styles.metricsRow}>
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: homeColors.metricBg,
              borderColor: isLight ? "#dbe7ff" : "#355386",
              shadowColor: colors.shadow,
            },
          ]}
          accessible
          accessibilityLabel={`PM2.5: ${
            currentAirData.pm25 ?? "дані відсутні"
          }`}
        >
          <Text
            style={[
              styles.metricLabel,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            PM2.5
          </Text>

          <Text
            style={[
              styles.metricValue,
              {
                color: colors.text,
              },
            ]}
          >
            {currentAirData.pm25 ?? "—"}
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: homeColors.metricBg,
              borderColor: isLight ? "#dbe7ff" : "#355386",
              shadowColor: colors.shadow,
            },
          ]}
          accessible
          accessibilityLabel={`PM10: ${currentAirData.pm10 ?? "дані відсутні"}`}
        >
          <Text
            style={[
              styles.metricLabel,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            PM10
          </Text>

          <Text
            style={[
              styles.metricValue,
              {
                color: colors.text,
              },
            ]}
          >
            {currentAirData.pm10 ?? "—"}
          </Text>
        </View>
      </View>

      <View style={styles.recommendationWrap}>
        <RecommendationCard
          title={currentAirData.alert ? "Попередження" : "Рекомендація"}
          text={
            currentAirData.alert
              ? currentAirData.alertMessage
              : airStatus.recommendation
          }
          type={currentAirData.alert ? "warning" : "success"}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,

    fontSize: 16,
  },

  errorText: {
    fontSize: 18,
    fontWeight: "600",
  },

  header: {
    marginBottom: 18,

    alignItems: "center",
  },

  screenTitle: {
    marginBottom: 6,

    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  screenSubtitle: {
    fontSize: 17,
    textAlign: "center",
  },

  metricsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,

    marginTop: 12,
  },

  metricCard: {
    flex: 1,

    maxWidth: 128,
    minHeight: 76,

    justifyContent: "center",
    alignItems: "center",

    paddingVertical: 10,
    paddingHorizontal: 8,

    borderWidth: 1.5,
    borderRadius: 18,

    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 2,
  },

  metricLabel: {
    marginBottom: 5,

    fontSize: 12,
    textAlign: "center",
  },

  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  recommendationWrap: {
    marginTop: 22,
  },
});
