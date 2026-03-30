const express = require("express");
const router = express.Router();
const db = require("../db/database");

const MAX_HISTORY_LENGTH = 20;
const ALERT_THRESHOLD = 80;

async function sendExpoPushNotification(token, title, body, data = {}) {
  if (!token || !token.startsWith("ExponentPushToken")) {
    console.log("Невалідний Expo push token:", token);
    return;
  }

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title,
        body,
        data,
      }),
    });

    const result = await response.json();
    console.log("Expo push result:", result);
  } catch (error) {
    console.log("Помилка надсилання push:", error.message);
  }
}

async function processPushNotifications({
  city,
  district,
  airIndex,
  updatedAt,
}) {
  db.all(
    `
    SELECT token, primaryDistrict, watchDistricts, threshold, notificationsEnabled
    FROM push_subscriptions
    `,
    [],
    async (err, rows) => {
      if (err) {
        console.log("Помилка читання push_subscriptions:", err.message);
        return;
      }

      if (!rows || rows.length === 0) {
        console.log("Немає підписок для push.");
        return;
      }

      for (const row of rows) {
        try {
          if (!row.notificationsEnabled) {
            continue;
          }

          const watchDistricts = row.watchDistricts
            ? JSON.parse(row.watchDistricts)
            : [];

          const isMatchingDistrict =
            row.primaryDistrict === district ||
            watchDistricts.includes(district);

          if (!isMatchingDistrict) {
            continue;
          }

          if (airIndex <= row.threshold) {
            continue;
          }

          const title = "Попередження про якість повітря";
          const body = `У районі ${district} рівень забруднення зріс до ${airIndex}.`;

          await sendExpoPushNotification(row.token, title, body, {
            city,
            district,
            airIndex,
            updatedAt,
          });

          console.log(
            `Push надіслано для token ${row.token}, район: ${district}, airIndex: ${airIndex}`,
          );
        } catch (error) {
          console.log("Помилка обробки push subscription:", error.message);
        }
      }
    },
  );
}

router.get("/current", (req, res) => {
  const district = req.query.district;

  let query = `
    SELECT city, district, airIndex, updatedAt, alert, alertMessage
    FROM air_measurements
  `;
  const params = [];

  if (district) {
    query += ` WHERE district = ?`;
    params.push(district);
  }

  query += ` ORDER BY id DESC LIMIT 1`;

  db.get(query, params, (err, row) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (!row) {
      return res.json({
        city: "Львів",
        district: district || "Сихівський",
        airIndex: 67,
        updatedAt: "15:30",
        alert: false,
        alertMessage: "",
      });
    }

    res.json({
      ...row,
      alert: Boolean(row.alert),
    });
  });
});

router.get("/history", (req, res) => {
  const district = req.query.district;

  let query = `
    SELECT id, district, updatedAt as time, airIndex as value
    FROM air_measurements
  `;
  const params = [];

  if (district) {
    query += ` WHERE district = ?`;
    params.push(district);
  }

  query += ` ORDER BY id DESC LIMIT ?`;
  params.push(MAX_HISTORY_LENGTH);

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(rows.reverse());
  });
});

router.post("/air-data", (req, res) => {
  console.log("POST /air-data", req.body);

  const { city, district, airIndex, updatedAt } = req.body;

  if (!city || !district || airIndex === undefined || !updatedAt) {
    return res.status(400).json({
      message: "Missing required fields: city, district, airIndex, updatedAt",
    });
  }

  const isAlert = airIndex > ALERT_THRESHOLD;
  const alertMessage = isAlert
    ? "Увага! Підвищений рівень забруднення повітря."
    : "";

  db.run(
    `
    INSERT INTO air_measurements (city, district, airIndex, updatedAt, alert, alertMessage)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [city, district, airIndex, updatedAt, isAlert ? 1 : 0, alertMessage],
    async function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      await processPushNotifications({
        city,
        district,
        airIndex,
        updatedAt,
      });

      res.status(201).json({
        message: "Air data received successfully",
        currentAirData: {
          city,
          district,
          airIndex,
          updatedAt,
          alert: isAlert,
          alertMessage,
        },
      });
    },
  );
});

router.post("/register-push-token", (req, res) => {
  const {
    token,
    primaryDistrict,
    watchDistricts = [],
    threshold = 80,
    notificationsEnabled = true,
  } = req.body;

  console.log("POST /register-push-token", req.body);

  if (!token || !primaryDistrict) {
    return res.status(400).json({
      message: "Missing required fields: token, primaryDistrict",
    });
  }

  db.run(
    `
    INSERT INTO push_subscriptions (
      token,
      primaryDistrict,
      watchDistricts,
      threshold,
      notificationsEnabled
    )
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(token) DO UPDATE SET
      primaryDistrict = excluded.primaryDistrict,
      watchDistricts = excluded.watchDistricts,
      threshold = excluded.threshold,
      notificationsEnabled = excluded.notificationsEnabled
    `,
    [
      token,
      primaryDistrict,
      JSON.stringify(watchDistricts),
      threshold,
      notificationsEnabled ? 1 : 0,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      res.status(200).json({
        message: "Push settings saved successfully",
      });
    },
  );
});

module.exports = router;
