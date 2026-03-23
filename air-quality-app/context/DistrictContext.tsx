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

const DISTRICT_STORAGE_KEY = "selectedDistrict";

export function DistrictProvider({ children }: { children: ReactNode }) {
  const [selectedDistrict, setSelectedDistrictState] = useState("Сихівський");
  const [isDistrictLoaded, setIsDistrictLoaded] = useState(false);

  useEffect(() => {
    async function loadDistrict() {
      try {
        const savedDistrict = await AsyncStorage.getItem(DISTRICT_STORAGE_KEY);

        if (savedDistrict && districts.includes(savedDistrict)) {
          setSelectedDistrictState(savedDistrict);
        }
      } catch (error) {
        console.log("Помилка завантаження району:", error);
      } finally {
        setIsDistrictLoaded(true);
      }
    }

    loadDistrict();
  }, []);

  async function setSelectedDistrict(district: string) {
    try {
      setSelectedDistrictState(district);
      await AsyncStorage.setItem(DISTRICT_STORAGE_KEY, district);
    } catch (error) {
      console.log("Помилка збереження району:", error);
    }
  }

  return (
    <DistrictContext.Provider
      value={{ selectedDistrict, setSelectedDistrict, isDistrictLoaded }}
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
