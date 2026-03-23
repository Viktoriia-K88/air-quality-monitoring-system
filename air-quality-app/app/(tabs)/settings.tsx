import { districts, useDistrict } from "@/context/DistrictContext";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { selectedDistrict, setSelectedDistrict } = useDistrict();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Налаштування</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Сповіщення про поганий стан повітря</Text>
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
        <Text style={styles.label}>Оберіть район</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 20,
    paddingTop: 40,
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
});
