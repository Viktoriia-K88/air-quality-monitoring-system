import { StyleSheet, Text, View } from "react-native";

type AlertCardProps = {
  message: string;
};

export default function AlertCard({ message }: AlertCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Попередження</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fdecea",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ea4335",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#b3261e",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#7a1c17",
  },
});
