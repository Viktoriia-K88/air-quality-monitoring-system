export function getAirStatus(airIndex: number) {
  if (airIndex <= 50) {
    return {
      label: "Добрий",
      color: "#34a853",
      recommendation: "Повітря в нормі. Можна без обмежень перебувати надворі.",
    };
  }

  if (airIndex > 80) {
    return {
      label: "Поганий",
      color: "#ea4335",
      recommendation:
        "Уникайте довгих прогулянок та зменшіть перебування надворі.",
    };
  }

  return {
    label: "Помірний",
    color: "#f4b400",
    recommendation:
      "Чутливим людям варто зменшити тривале перебування надворі.",
  };
}
