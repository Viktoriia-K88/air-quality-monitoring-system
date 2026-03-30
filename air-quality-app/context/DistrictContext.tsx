import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type DistrictContextType = {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  watchedDistricts: string[];
  setWatchedDistricts: (districts: string[]) => void;
  notificationThreshold: number;
  setNotificationThreshold: (value: number) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  isDistrictLoaded: boolean;
};

const DistrictContext = createContext<DistrictContextType | undefined>(
  undefined,
);

export const districts = [
  "Галицький",
  "Залізничний",
  "Личаківський",
  "Сихівський",
  "Франківський",
  "Шевченківський",
];

const SETTINGS_STORAGE_KEY = "airQualitySettings";

type StoredSettings = {
  selectedDistrict: string;
  watchedDistricts: string[];
  notificationThreshold: number;
  notificationsEnabled: boolean;
};

export function DistrictProvider({ children }: { children: ReactNode }) {
  const [selectedDistrict, setSelectedDistrictState] = useState("Сихівський");
  const [watchedDistricts, setWatchedDistrictsState] = useState<string[]>([]);
  const [notificationThreshold, setNotificationThresholdState] = useState(80);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [isDistrictLoaded, setIsDistrictLoaded] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

        if (savedSettings) {
          const parsed: StoredSettings = JSON.parse(savedSettings);

          if (
            parsed.selectedDistrict &&
            districts.includes(parsed.selectedDistrict)
          ) {
            setSelectedDistrictState(parsed.selectedDistrict);
          }

          if (Array.isArray(parsed.watchedDistricts)) {
            setWatchedDistrictsState(
              parsed.watchedDistricts.filter((district) =>
                districts.includes(district),
              ),
            );
          }

          if (
            typeof parsed.notificationThreshold === "number" &&
            parsed.notificationThreshold >= 50 &&
            parsed.notificationThreshold <= 100
          ) {
            setNotificationThresholdState(parsed.notificationThreshold);
          }

          if (typeof parsed.notificationsEnabled === "boolean") {
            setNotificationsEnabledState(parsed.notificationsEnabled);
          }
        }
      } catch (error) {
        console.log("Помилка завантаження налаштувань:", error);
      } finally {
        setIsDistrictLoaded(true);
      }
    }

    loadSettings();
  }, []);

  async function saveSettings(updatedSettings: StoredSettings) {
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(updatedSettings),
      );
    } catch (error) {
      console.log("Помилка збереження налаштувань:", error);
    }
  }

  async function setSelectedDistrict(district: string) {
    setSelectedDistrictState(district);

    const updatedWatchedDistricts = watchedDistricts.filter(
      (item) => item !== district,
    );
    setWatchedDistrictsState(updatedWatchedDistricts);

    await saveSettings({
      selectedDistrict: district,
      watchedDistricts: updatedWatchedDistricts,
      notificationThreshold,
      notificationsEnabled,
    });
  }

  async function setWatchedDistricts(districtsList: string[]) {
    setWatchedDistrictsState(districtsList);

    await saveSettings({
      selectedDistrict,
      watchedDistricts: districtsList,
      notificationThreshold,
      notificationsEnabled,
    });
  }

  async function setNotificationThreshold(value: number) {
    setNotificationThresholdState(value);

    await saveSettings({
      selectedDistrict,
      watchedDistricts,
      notificationThreshold: value,
      notificationsEnabled,
    });
  }

  async function setNotificationsEnabled(value: boolean) {
    setNotificationsEnabledState(value);

    await saveSettings({
      selectedDistrict,
      watchedDistricts,
      notificationThreshold,
      notificationsEnabled: value,
    });
  }

  return (
    <DistrictContext.Provider
      value={{
        selectedDistrict,
        setSelectedDistrict,
        watchedDistricts,
        setWatchedDistricts,
        notificationThreshold,
        setNotificationThreshold,
        notificationsEnabled,
        setNotificationsEnabled,
        isDistrictLoaded,
      }}
    >
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrict() {
  const context = useContext(DistrictContext);

  if (!context) {
    throw new Error("useDistrict must be used within DistrictProvider");
  }

  return context;
}
