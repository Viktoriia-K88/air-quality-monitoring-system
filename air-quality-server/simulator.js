require("dotenv").config();

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const UPDATE_INTERVAL_MS = 10_000;

const districts = [
  {
    name: "Галицький",
    airIndex: 60,
    pm25: 28,
    pm10: 45,
    mode: "normal",
  },
  {
    name: "Залізничний",
    airIndex: 55,
    pm25: 24,
    pm10: 40,
    mode: "normal",
  },
  {
    name: "Личаківський",
    airIndex: 64,
    pm25: 30,
    pm10: 50,
    mode: "normal",
  },
  {
    name: "Сихівський",
    airIndex: 70,
    pm25: 34,
    pm10: 56,
    mode: "warning",
  },
  {
    name: "Франківський",
    airIndex: 62,
    pm25: 27,
    pm10: 46,
    mode: "normal",
  },
  {
    name: "Шевченківський",
    airIndex: 58,
    pm25: 25,
    pm10: 42,
    mode: "normal",
  },
];

function getRandomStep(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseNextMode(currentMode) {
  const random = Math.random();

  if (currentMode === "normal") {
    if (random < 0.15) {
      return "warning";
    }

    return "normal";
  }

  if (currentMode === "warning") {
    if (random < 0.2) {
      return "critical";
    }

    if (random < 0.5) {
      return "normal";
    }

    return "warning";
  }

  if (currentMode === "critical") {
    if (random < 0.4) {
      return "warning";
    }

    return "critical";
  }

  return "normal";
}

function updateAirIndex(district) {
  district.mode = chooseNextMode(district.mode);

  let minStep = 1;
  let maxStep = 4;
  let direction = 1;

  if (district.mode === "normal") {
    direction = Math.random() < 0.6 ? -1 : 1;
    minStep = 1;
    maxStep = 3;
  }

  if (district.mode === "warning") {
    direction = 1;
    minStep = 2;
    maxStep = 5;
  }

  if (district.mode === "critical") {
    direction = Math.random() < 0.7 ? 1 : -1;
    minStep = 3;
    maxStep = 6;
  }

  const step = getRandomStep(minStep, maxStep);

  district.airIndex += step * direction;

  if (district.mode === "normal") {
    district.airIndex = Math.max(40, Math.min(district.airIndex, 75));
  }

  if (district.mode === "warning") {
    district.airIndex = Math.max(65, Math.min(district.airIndex, 90));
  }

  if (district.mode === "critical") {
    district.airIndex = Math.max(85, Math.min(district.airIndex, 100));
  }
}

function updatePm25(district) {
  let target;

  if (district.mode === "normal") {
    target = getRandomStep(12, 35);
  } else if (district.mode === "warning") {
    target = getRandomStep(30, 55);
  } else {
    target = getRandomStep(50, 80);
  }

  const difference = target - district.pm25;

  if (Math.abs(difference) <= 3) {
    district.pm25 = target;
  } else {
    district.pm25 += Math.sign(difference) * getRandomStep(1, 3);
  }
}

function updatePm10(district) {
  let target;

  if (district.mode === "normal") {
    target = getRandomStep(25, 60);
  } else if (district.mode === "warning") {
    target = getRandomStep(55, 95);
  } else {
    target = getRandomStep(90, 140);
  }

  const difference = target - district.pm10;

  if (Math.abs(difference) <= 4) {
    district.pm10 = target;
  } else {
    district.pm10 += Math.sign(difference) * getRandomStep(2, 4);
  }
}

function updateDistrictData(district) {
  updateAirIndex(district);
  updatePm25(district);
  updatePm10(district);
}

async function sendDistrictData(district, updatedAt) {
  updateDistrictData(district);

  const data = {
    city: "Львів",
    district: district.name,
    airIndex: district.airIndex,
    pm25: district.pm25,
    pm10: district.pm10,
    updatedAt,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/air-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`${district.name}:`, result);
      return;
    }

    console.log(`Режим: ${district.mode}`, result.currentAirData);
  } catch (error) {
    console.error(
      `Помилка надсилання даних для району ${district.name}:`,
      error.message,
    );
  }
}

async function sendAllDistricts() {
  const updatedAt = new Date().toISOString();

  await Promise.all(
    districts.map((district) => sendDistrictData(district, updatedAt)),
  );

  console.log("----------------------------------------");
}

sendAllDistricts();

setInterval(sendAllDistricts, UPDATE_INTERVAL_MS);
