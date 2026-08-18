import { StyleSheet, Text, View } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";

type AirStatusCardProps = {
  airIndex: number;
  statusLabel: string;
  statusColor: string;
  updatedAt: string;
  backgroundColor?: string;
};

function formatTime(value: string) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AirStatusCard({
  airIndex,
  statusLabel,
  statusColor,
  updatedAt,
  backgroundColor,
}: AirStatusCardProps) {
  const colors = useAppColors();

  const isLight = colors.background === "#f5f7fa";

  const formattedTime = formatTime(updatedAt);

  return (
    <View
      style={[
        styles.circleCard,
        {
          backgroundColor: backgroundColor || colors.surface,
          borderColor: isLight ? "#dbe7ff" : "#355386",
          shadowColor: colors.shadow,
        },
      ]}
      accessible
      accessibilityLabel={`Індекс якості повітря ${airIndex}. Статус: ${statusLabel}. Оновлено о ${formattedTime}.`}
    >
      <Text
        style={[
          styles.label,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        AQI
      </Text>

      <Text
        style={[
          styles.airIndex,
          {
            color: colors.text,
          },
        ]}
      >
        {airIndex}
      </Text>

      <Text
        style={[
          styles.status,
          {
            color: statusColor,
          },
        ]}
      >
        {statusLabel}
      </Text>

      <Text
        style={[
          styles.updatedAt,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Оновлено: {formattedTime}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circleCard: {
    width: 300,
    height: 300,

    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 24,
    marginBottom: 8,

    borderRadius: 150,
    borderWidth: 1.8,

    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 3,
  },

  label: {
    marginBottom: 10,

    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.4,
  },

  airIndex: {
    fontSize: 84,
    fontWeight: "800",
    lineHeight: 90,
    textAlign: "center",
  },

  status: {
    marginTop: 10,

    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  updatedAt: {
    marginTop: 16,

    fontSize: 16,
    textAlign: "center",
  },
});
