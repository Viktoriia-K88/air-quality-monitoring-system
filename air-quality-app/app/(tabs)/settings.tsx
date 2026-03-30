import { districts, useDistrict } from "@/context/DistrictContext";
import { Picker } from "@react-native-picker/picker";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

const thresholdOptions = [60, 70, 80, 90, 100];

export default function SettingsScreen() {
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
    if (district === selectedDistrict) return;

    if (watchedDistricts.includes(district)) {
      setWatchedDistricts(watchedDistricts.filter((item) => item !== district));
    } else {
      setWatchedDistricts([...watchedDistricts, district]);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Налаштування</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Сповіщення</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      <Text style={styles.info}>
        {notificationsEnabled ? "Сповіщення увімкнені" : "Сповіщення вимкнені"}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Місто</Text>
        <Text style={styles.value}>Львів</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Основний район</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedDistrict}
            onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
          >
            {districts.map((district) => (
              <Picker.Item key={district} label={district} value={district} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Поріг сповіщення</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={notificationThreshold}
            onValueChange={(itemValue) =>
              setNotificationThreshold(Number(itemValue))
            }
          >
            {thresholdOptions.map((value) => (
              <Picker.Item key={value} label={`${value}`} value={value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Райони спостереження</Text>
        <Text style={styles.helperText}>
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
                  style={[
                    styles.watchItem,
                    isSelected && styles.watchItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.watchItemText,
                      isSelected && styles.watchItemTextSelected,
                    ]}
                  >
                    {district}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      </View>
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
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    color: "#111",
    marginBottom: 12,
  },
  value: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  info: {
    fontSize: 15,
    color: "#666",
    marginBottom: 16,
    marginLeft: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 10,
    overflow: "hidden",
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  watchList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  watchItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    backgroundColor: "#f7f7f7",
  },
  watchItemSelected: {
    backgroundColor: "#dceeff",
    borderColor: "#4a90e2",
  },
  watchItemText: {
    fontSize: 15,
    color: "#333",
  },
  watchItemTextSelected: {
    color: "#0f5db8",
    fontWeight: "600",
  },
});
