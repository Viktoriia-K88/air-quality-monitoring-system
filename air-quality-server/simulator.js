let currentAirIndex = 60;
let mode = "normal";

const districts = [
  "Галицький",
  "Залізничний",
  "Личаківський",
  "Сихівський",
  "Франківський",
  "Шевченківський",
];

function getRandomDistrict() {
  const index = Math.floor(Math.random() * districts.length);
  return districts[index];
}

function chooseNextMode() {
  const random = Math.random();

  if (mode === "normal") {
    if (random < 0.15) return "warning";
    return "normal";
  }

  if (mode === "warning") {
    if (random < 0.2) return "critical";
    if (random < 0.5) return "normal";
    return "warning";
  }

  if (mode === "critical") {
    if (random < 0.4) return "warning";
    return "critical";
  }

  return "normal";
}

function getNextAirIndex() {
  mode = chooseNextMode();

  let minStep = 1;
  let maxStep = 4;
  let direction = 1;

  if (mode === "normal") {
    direction = Math.random() < 0.6 ? -1 : 1;
    minStep = 1;
    maxStep = 3;
  }

  if (mode === "warning") {
    direction = 1;
    minStep = 2;
    maxStep = 5;
  }

  if (mode === "critical") {
    direction = Math.random() < 0.7 ? 1 : -1;
    minStep = 3;
    maxStep = 6;
  }

  const step = Math.floor(Math.random() * (maxStep - minStep + 1)) + minStep;
  currentAirIndex += step * direction;

  if (mode === "normal") {
    if (currentAirIndex < 40) currentAirIndex = 40;
    if (currentAirIndex > 75) currentAirIndex = 75;
  }

  if (mode === "warning") {
    if (currentAirIndex < 65) currentAirIndex = 65;
    if (currentAirIndex > 90) currentAirIndex = 90;
  }

  if (mode === "critical") {
    if (currentAirIndex < 85) currentAirIndex = 85;
    if (currentAirIndex > 100) currentAirIndex = 100;
  }

  return currentAirIndex;
}

async function sendAirData() {
  const airIndex = getNextAirIndex();
  const district = getRandomDistrict();

  const now = new Date();
  const updatedAt = now.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const data = {
    city: "Львів",
    district,
    airIndex,
    updatedAt,
  };

  try {
    const response = await fetch("http://localhost:3000/air-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(`Режим: ${mode}`, result.currentAirData);
  } catch (error) {
    console.error("Помилка надсилання:", error.message);
  }
}

sendAirData();

setInterval(() => {
  sendAirData();
}, 10000);
