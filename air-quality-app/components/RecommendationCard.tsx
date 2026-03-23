import { StyleSheet, Text, View } from "react-native";

type RecommendationCardProps = {
  text: string;
};

export default function RecommendationCard({ text }: RecommendationCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Рекомендація</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
});
