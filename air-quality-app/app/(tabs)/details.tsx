import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function DetailsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Деталі про якість повітря</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Що таке AQI</Text>
        <Text style={styles.text}>
          AQI (Air Quality Index) — це індекс якості повітря, який
          використовується для спрощеного відображення рівня забруднення.
          Замість окремого показу багатьох параметрів користувачу подається одне
          узагальнене значення, яке допомагає швидко зрозуміти, наскільки
          безпечним є повітря в поточний момент.
        </Text>
        <Text style={styles.text}>
          Чим вищий показник AQI, тим гірший стан повітря і тим більший можливий
          негативний вплив на самопочуття людини, особливо для дітей, людей
          похилого віку та осіб із захворюваннями дихальної системи.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Які значення вважаються безпечними
        </Text>
        <Text style={styles.text}>
          У цьому застосунку використовується спрощена шкала оцінювання якості
          повітря:
        </Text>

        <Text style={styles.item}>• 0–50 — добрий стан повітря.</Text>
        <Text style={styles.item}>
          • 51–80 — помірний стан, якість повітря прийнятна, але для чутливих
          груп може бути небажаною при тривалому перебуванні надворі.
        </Text>
        <Text style={styles.item}>
          • більше 80 — поганий стан повітря, який може бути небезпечним для
          здоров’я.
        </Text>

        <Text style={styles.text}>
          Якщо значення стає занадто високим, користувач повинен звернути увагу
          на попередження та, за можливості, обмежити тривале перебування на
          відкритому повітрі.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Чому важливо слідкувати за якістю повітря
        </Text>
        <Text style={styles.text}>
          Якість повітря безпосередньо впливає на здоров’я, рівень активності та
          загальне самопочуття людини. Підвищене забруднення може викликати
          втому, головний біль, подразнення слизових оболонок, утруднене дихання
          та погіршення стану в людей із хронічними захворюваннями.
        </Text>
        <Text style={styles.text}>
          Оперативний доступ до таких даних дозволяє краще планувати пересування
          містом, прогулянки, фізичну активність надворі та загалом більш
          свідомо реагувати на екологічну ситуацію в окремих районах.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Що робити при поганому стані повітря
        </Text>
        <Text style={styles.item}>
          • по можливості скоротити час перебування надворі;
        </Text>
        <Text style={styles.item}>
          • уникати тривалих прогулянок та інтенсивних фізичних навантажень;
        </Text>
        <Text style={styles.item}>
          • зачиняти вікна у періоди сильного забруднення;
        </Text>
        <Text style={styles.item}>
          • звертати особливу увагу на стан дітей, людей похилого віку та людей
          із захворюваннями органів дихання;
        </Text>
        <Text style={styles.item}>
          • стежити за оновленням показників у застосунку для вибраного району.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Практичне призначення застосунку
        </Text>
        <Text style={styles.text}>
          Розроблений застосунок дає змогу відстежувати стан повітря в різних
          районах міста Львова, переглядати історію вимірювань, аналізувати
          зміни на графіку та орієнтуватися за мапою районів. Це підвищує
          інформаційну цінність проєкту і робить застосунок корисним не лише як
          технічну демонстрацію, а й як інструмент для ознайомлення користувача
          з екологічною ситуацією.
        </Text>
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
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 6,
  },
});
