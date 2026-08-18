import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppColors } from "@/hooks/useAppColors";

type Option = {
  label: string;
  value: string | number;
};

type AppSelectModalProps = {
  label: string;
  value: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
};

export default function AppSelectModal({
  label,
  value,
  options,
  onChange,
}: AppSelectModalProps) {
  const colors = useAppColors();

  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((item) => item.value === value);

  const selectedLabel = selectedOption?.label ?? String(value);

  function selectOption(option: Option) {
    onChange(option.value);

    setVisible(false);
  }

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}. Вибрано: ${selectedLabel}`}
        accessibilityState={{
          expanded: visible,
        }}
        style={[
          styles.trigger,
          {
            borderColor: colors.cardBorder,
            backgroundColor: colors.surfaceSecondary,
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.triggerLabel,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {label}
          </Text>

          <Text
            style={[
              styles.triggerValue,
              {
                color: colors.text,
              },
            ]}
          >
            {selectedLabel}
          </Text>
        </View>

        <Text
          style={[
            styles.chevron,
            {
              color: colors.textSecondary,
            },
          ]}
          accessible={false}
        >
          ⌄
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setVisible(false)}
            accessible={false}
          />

          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text,
                  },
                ]}
                accessibilityRole="header"
              >
                {label}
              </Text>

              <Pressable
                style={styles.closeButton}
                onPress={() => setVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Закрити список"
              >
                <Text
                  style={[
                    styles.closeText,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  Закрити
                </Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={String(option.value)}
                    onPress={() => selectOption(option)}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: isSelected,
                    }}
                    accessibilityLabel={option.label}
                    style={[
                      styles.optionItem,
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
                        styles.optionText,
                        {
                          color: isSelected ? colors.primary : colors.text,

                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 58,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderWidth: 1,
    borderRadius: 12,
  },

  triggerLabel: {
    marginBottom: 4,

    fontSize: 12,
  },

  triggerValue: {
    fontSize: 17,
    fontWeight: "600",
  },

  chevron: {
    fontSize: 22,
    lineHeight: 22,
  },

  overlay: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    padding: 20,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "72%",

    padding: 20,

    borderWidth: 1,
    borderRadius: 24,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  closeButton: {
    minWidth: 44,
    minHeight: 44,

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 6,
  },

  closeText: {
    fontSize: 15,
    fontWeight: "600",
  },

  optionItem: {
    minHeight: 48,

    justifyContent: "center",

    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,

    borderWidth: 1,
    borderRadius: 14,
  },

  optionText: {
    fontSize: 16,
  },
});
