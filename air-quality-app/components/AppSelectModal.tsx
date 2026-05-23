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

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={[
          styles.trigger,
          {
            borderColor: colors.cardBorder,
            backgroundColor: colors.surfaceSecondary,
          },
        ]}
      >
        <View>
          <Text style={[styles.triggerLabel, { color: colors.textSecondary }]}>
            {label}
          </Text>
          <Text style={[styles.triggerValue, { color: colors.text }]}>
            {selectedOption?.label ?? String(value)}
          </Text>
        </View>

        <Text style={[styles.chevron, { color: colors.textSecondary }]}>⌄</Text>
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {label}
              </Text>

              <Pressable onPress={() => setVisible(false)}>
                <Text style={[styles.closeText, { color: colors.primary }]}>
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
                    onPress={() => {
                      onChange(option.value);
                      setVisible(false);
                    }}
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
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  triggerLabel: {
    fontSize: 12,
    marginBottom: 4,
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
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
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
  closeText: {
    fontSize: 15,
    fontWeight: "600",
  },
  optionItem: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
  },
});
