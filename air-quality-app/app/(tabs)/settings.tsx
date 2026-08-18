import AppCard from "@/components/AppCard";
import AppSelectModal from "@/components/AppSelectModal";
import ScreenContainer from "@/components/ScreenContainer";
import { districts, useDistrict } from "@/context/DistrictContext";
import { useAppColors } from "@/hooks/useAppColors";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

const thresholdOptions = [60, 70, 80, 90, 100];

export default function SettingsScreen() {
  const colors = useAppColors();

  const {
    selectedDistrict,
    setSelectedDistrict,
    watchedDistricts,
    setWatchedDistricts,
    notificationThreshold,
    setNotificationThreshold,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useDistrict();

  function toggleWatchedDistrict(district: string) {
    if (district === selectedDistrict) {
      return;
    }

    if (watchedDistricts.includes(district)) {
      setWatchedDistricts(watchedDistricts.filter((item) => item !== district));

      return;
    }

    setWatchedDistricts([...watchedDistricts, district]);
  }

  return (
    <ScreenContainer>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
        accessibilityRole="header"
      >
        Налаштування
      </Text>

      <AppCard>
        <View style={styles.heroTop}>
          <View style={styles.heroTextBlock}>
            <Text
              style={[
                styles.heroTitle,
                {
                  color: colors.text,
                },
              ]}
              accessibilityRole="header"
            >
              Сповіщення
            </Text>

            <Text
              style={[
                styles.heroText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Керуй попередженнями про погіршення якості повітря у вибраних
              районах.
            </Text>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            accessibilityLabel="Сповіщення про якість повітря"
            trackColor={{
              false: colors.border,
              true: colors.primarySoft,
            }}
            thumbColor={notificationsEnabled ? colors.primary : "#f4f4f5"}
          />
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: notificationsEnabled
                ? colors.primarySoft
                : colors.surfaceSecondary,

              borderColor: colors.cardBorder,
            },
          ]}
          accessible
          accessibilityLiveRegion="polite"
          accessibilityLabel={
            notificationsEnabled
              ? "Сповіщення увімкнені"
              : "Сповіщення вимкнені"
          }
        >
          <Text
            style={[
              styles.statusPillText,
              {
                color: notificationsEnabled
                  ? colors.primary
                  : colors.textSecondary,
              },
            ]}
          >
            {notificationsEnabled
              ? "Сповіщення увімкнені"
              : "Сповіщення вимкнені"}
          </Text>
        </View>
      </AppCard>

      <AppCard>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
          accessibilityRole="header"
        >
          Локація
        </Text>

        <View style={styles.infoBlock}>
          <Text
            style={[
              styles.infoLabel,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Місто
          </Text>

          <Text
            style={[
              styles.infoValue,
              {
                color: colors.text,
              },
            ]}
          >
            Львів
          </Text>
        </View>

        <Text
          style={[
            styles.fieldLabel,
            {
              color: colors.text,
            },
          ]}
        >
          Основний район
        </Text>

        <AppSelectModal
          label="Обери район"
          value={selectedDistrict}
          options={districts.map((district) => ({
            label: district,
            value: district,
          }))}
          onChange={(value) => setSelectedDistrict(String(value))}
        />
      </AppCard>

      <AppCard>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
          accessibilityRole="header"
        >
          Поріг сповіщення
        </Text>

        <Text
          style={[
            styles.sectionHelper,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Сповіщення приходитимуть, якщо значення перевищить обраний рівень.
        </Text>

        <AppSelectModal
          label="Обери поріг"
          value={notificationThreshold}
          options={thresholdOptions.map((value) => ({
            label: String(value),
            value,
          }))}
          onChange={(value) => setNotificationThreshold(Number(value))}
        />
      </AppCard>

      <AppCard>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
          accessibilityRole="header"
        >
          Райони спостереження
        </Text>

        <Text
          style={[
            styles.sectionHelper,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Обери додаткові райони, за якими хочеш стежити.
        </Text>

        <View style={styles.watchList}>
          {districts
            .filter((district) => district !== selectedDistrict)
            .map((district) => {
              const isSelected = watchedDistricts.includes(district);

              return (
                <Pressable
                  key={district}
                  onPress={() => toggleWatchedDistrict(district)}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: isSelected,
                  }}
                  accessibilityLabel={`${district} район`}
                  style={[
                    styles.watchItem,
                    {
                      borderColor: isSelected
                        ? colors.primary
                        : colors.cardBorder,

                      backgroundColor: isSelected
                        ? colors.primarySoft
                        : colors.surfaceSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.watchItemText,
                      {
                        color: isSelected ? colors.primary : colors.text,

                        fontWeight: isSelected ? "700" : "500",
                      },
                    ]}
                  >
                    {district}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 20,

    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,

    marginBottom: 14,
  },

  heroTextBlock: {
    flex: 1,
  },

  heroTitle: {
    marginBottom: 8,

    fontSize: 22,
    fontWeight: "800",
  },

  heroText: {
    fontSize: 15,
    lineHeight: 22,
  },

  statusPill: {
    alignSelf: "flex-start",

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderWidth: 1,
    borderRadius: 999,
  },

  statusPillText: {
    fontSize: 14,
    fontWeight: "700",
  },

  sectionTitle: {
    marginBottom: 12,

    fontSize: 20,
    fontWeight: "700",
  },

  sectionHelper: {
    marginBottom: 12,

    fontSize: 14,
    lineHeight: 21,
  },

  infoBlock: {
    marginBottom: 16,
  },

  infoLabel: {
    marginBottom: 6,

    fontSize: 15,
  },

  infoValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  fieldLabel: {
    marginBottom: 10,

    fontSize: 16,
    fontWeight: "600",
  },

  watchList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,

    marginTop: 6,
  },

  watchItem: {
    minHeight: 44,

    justifyContent: "center",

    paddingVertical: 11,
    paddingHorizontal: 14,

    borderWidth: 1,
    borderRadius: 12,
  },

  watchItemText: {
    fontSize: 15,
  },
});
