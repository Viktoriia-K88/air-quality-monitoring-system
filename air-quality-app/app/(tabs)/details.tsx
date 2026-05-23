import AppCard from "@/components/AppCard";
import ScreenContainer from "@/components/ScreenContainer";
import { useAppColors } from "@/hooks/useAppColors";
import { StyleSheet, Text, View } from "react-native";

function LevelRow({
  range,
  title,
  description,
  color,
  colors,
}: {
  range: string;
  title: string;
  description: string;
  color: string;
  colors: ReturnType<typeof useAppColors>;
}) {
  return (
    <View
      style={[
        styles.levelRow,
        {
          borderColor: colors.cardBorder,
          backgroundColor: colors.surfaceSecondary,
        },
      ]}
    >
      <View style={styles.levelLeft}>
        <Text style={[styles.levelRange, { color }]}>{range}</Text>
        <Text style={[styles.levelTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.levelDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

function BulletItem({
  text,
  colors,
}: {
  text: string;
  colors: ReturnType<typeof useAppColors>;
}) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
      <Text style={[styles.bulletText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

export default function DetailsScreen() {
  const colors = useAppColors();

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Деталі</Text>

      <AppCard>
        <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
          AIR QUALITY INDEX
        </Text>
        <Text style={[styles.heroTitle, { color: colors.text }]}>
          Що таке AQI
        </Text>
        <Text style={[styles.heroText, { color: colors.text }]}>
          AQI — це індекс якості повітря, який дозволяє одним числом показати,
          наскільки безпечним або небезпечним є повітря в поточний момент.
        </Text>
        <Text style={[styles.heroText, { color: colors.textSecondary }]}>
          Чим вищий показник, тим гірший стан повітря і тим сильніший можливий
          вплив на самопочуття людини.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Рівні якості повітря
        </Text>

        <LevelRow
          range="0–50"
          title="Добрий"
          description="Повітря в нормі, ризик для здоров’я мінімальний."
          color={colors.success}
          colors={colors}
        />
        <LevelRow
          range="51–80"
          title="Помірний"
          description="Якість прийнятна, але чутливим людям варто бути уважнішими."
          color={colors.warning}
          colors={colors}
        />
        <LevelRow
          range="80+"
          title="Поганий"
          description="Повітря може бути небезпечним, варто обмежити перебування надворі."
          color={colors.danger}
          colors={colors}
        />
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Чому це важливо
        </Text>
        <Text style={[styles.text, { color: colors.text }]}>
          Якість повітря безпосередньо впливає на самопочуття, витривалість і
          загальний стан здоров’я. Підвищене забруднення може викликати втому,
          головний біль, подразнення слизових оболонок та утруднене дихання.
        </Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Особливо уважними мають бути діти, люди похилого віку та люди із
          хронічними захворюваннями органів дихання.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Що робити при поганому стані повітря
        </Text>

        <BulletItem text="Скоротити час перебування надворі." colors={colors} />
        <BulletItem
          text="Уникати довгих прогулянок та інтенсивних фізичних навантажень."
          colors={colors}
        />
        <BulletItem
          text="Зачиняти вікна в періоди сильного забруднення."
          colors={colors}
        />
        <BulletItem
          text="Особливо стежити за станом дітей і людей із захворюваннями дихальної системи."
          colors={colors}
        />
        <BulletItem
          text="Регулярно перевіряти оновлення показників у застосунку."
          colors={colors}
        />
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Практичне призначення застосунку
        </Text>
        <Text style={[styles.text, { color: colors.text }]}>
          Застосунок допомагає відстежувати стан повітря в різних районах
          Львова, переглядати історію змін, аналізувати графік і орієнтуватися
          за мапою районів.
        </Text>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 12,
  },
  heroText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  levelRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  levelLeft: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 6,
  },
  levelRange: {
    fontSize: 18,
    fontWeight: "800",
  },
  levelTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  levelDescription: {
    fontSize: 14,
    lineHeight: 21,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
  },
});
