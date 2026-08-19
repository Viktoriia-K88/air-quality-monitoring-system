const express = require("express");
const router = express.Router();

const db = require("../db/database");

const { processExpoPushNotifications } = require("../services/expoPushService");

const {
  getVapidPublicKey,
  processWebPushNotifications,
} = require("../services/webPushService");

const ALERT_THRESHOLD = 80;

const ALLOWED_DISTRICTS = [
  "Галицький",
  "Залізничний",
  "Личаківський",
  "Сихівський",
  "Франківський",
  "Шевченківський",
];

function isValidDistrict(value) {
  return typeof value === "string" && ALLOWED_DISTRICTS.includes(value);
}

function isValidAirValue(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isValidDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isValidThreshold(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isValidWatchDistricts(value) {
  return (
    Array.isArray(value) && value.every((district) => isValidDistrict(district))
  );
}

function formatTime(value) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

router.get("/current", (req, res) => {
  const district = req.query.district;

  let query = `
    SELECT
      city,
      district,
      airIndex,
      pm25,
      pm10,
      updatedAt,
      alert,
      alertMessage
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
      return res.status(500).json({
        message: err.message,
      });
    }

    if (!row) {
      return res.json({
        city: "Львів",
        district: district || "Сихівський",
        airIndex: 67,
        pm25: null,
        pm10: null,
        updatedAt: new Date().toISOString(),
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
  const range = req.query.range || "last20";

  if (!district) {
    return res.status(400).json({
      message: "District is required.",
    });
  }

  const allowedRanges = ["last20", "today", "yesterday"];

  if (!allowedRanges.includes(range)) {
    return res.status(400).json({
      message: "Invalid range. Use last20, today or yesterday.",
    });
  }

  let query = `
    SELECT
      id,
      district,
      updatedAt,
      airIndex AS value,
      pm25,
      pm10
    FROM air_measurements
    WHERE district = ?
  `;

  const params = [district];

  if (range === "today" || range === "yesterday") {
    const now = new Date();
    const targetDate = new Date(now);

    if (range === "yesterday") {
      targetDate.setDate(targetDate.getDate() - 1);
    }

    const start = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0,
      0,
      0,
      0,
    );

    const end = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1,
      0,
      0,
      0,
      0,
    );

    query += `
      AND updatedAt >= ?
      AND updatedAt < ?
    `;

    params.push(start.toISOString(), end.toISOString());
  }

  query += ` ORDER BY id DESC`;

  if (range === "last20") {
    query += ` LIMIT 20`;
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    const formattedRows = rows.reverse().map((row) => ({
      id: String(row.id),
      district: row.district,
      updatedAt: row.updatedAt,
      time: formatTime(row.updatedAt),
      value: row.value,
      pm25: row.pm25,
      pm10: row.pm10,
    }));

    res.json(formattedRows);
  });
});

router.post("/air-data", (req, res) => {
  const ingestApiKey = process.env.INGEST_API_KEY;
  const requestApiKey = req.get("x-api-key");

  if (!ingestApiKey) {
    console.error("Missing INGEST_API_KEY configuration.");

    return res.status(500).json({
      message: "Server configuration error.",
    });
  }

  if (!requestApiKey || requestApiKey !== ingestApiKey) {
    return res.status(401).json({
      message: "Unauthorized.",
    });
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("POST /air-data", req.body);
  }

  const { city, district, airIndex, pm25, pm10, updatedAt } = req.body;

  if (
    !city ||
    !district ||
    airIndex === undefined ||
    pm25 === undefined ||
    pm10 === undefined ||
    !updatedAt
  ) {
    return res.status(400).json({
      message:
        "Missing required fields: city, district, airIndex, pm25, pm10, updatedAt",
    });
  }

  if (city !== "Львів") {
    return res.status(400).json({
      message: "Invalid city.",
    });
  }

  if (!isValidDistrict(district)) {
    return res.status(400).json({
      message: "Invalid district.",
    });
  }

  if (
    !isValidAirValue(airIndex) ||
    !isValidAirValue(pm25) ||
    !isValidAirValue(pm10)
  ) {
    return res.status(400).json({
      message: "airIndex, pm25 and pm10 must be valid non-negative numbers.",
    });
  }

  if (!isValidDate(updatedAt)) {
    return res.status(400).json({
      message: "updatedAt must be a valid date.",
    });
  }

  const isAlert = airIndex > ALERT_THRESHOLD;

  const alertMessage = isAlert
    ? "Увага! Підвищений рівень забруднення повітря."
    : "";

  db.run(
    `
      INSERT INTO air_measurements (
        city,
        district,
        airIndex,
        pm25,
        pm10,
        updatedAt,
        alert,
        alertMessage
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      city,
      district,
      airIndex,
      pm25,
      pm10,
      updatedAt,
      isAlert ? 1 : 0,
      alertMessage,
    ],
    async function (err) {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      await Promise.allSettled([
        processExpoPushNotifications({
          city,
          district,
          airIndex,
          updatedAt,
        }),

        processWebPushNotifications({
          city,
          district,
          airIndex,
          updatedAt,
        }),
      ]);

      res.status(201).json({
        message: "Air data received successfully",

        currentAirData: {
          city,
          district,
          airIndex,
          pm25,
          pm10,
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

  if (!token || !primaryDistrict) {
    return res.status(400).json({
      message: "Missing required fields: token, primaryDistrict",
    });
  }

  if (typeof token !== "string" || !token.trim()) {
    return res.status(400).json({
      message: "token must be a non-empty string.",
    });
  }

  if (!isValidDistrict(primaryDistrict)) {
    return res.status(400).json({
      message: "Invalid primaryDistrict.",
    });
  }

  if (!isValidWatchDistricts(watchDistricts)) {
    return res.status(400).json({
      message: "watchDistricts contains an invalid district.",
    });
  }

  if (!isValidThreshold(threshold)) {
    return res.status(400).json({
      message: "threshold must be a valid non-negative number.",
    });
  }

  if (typeof notificationsEnabled !== "boolean") {
    return res.status(400).json({
      message: "notificationsEnabled must be a boolean.",
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
        return res.status(500).json({
          message: err.message,
        });
      }

      res.status(201).json({
        message: "Push token registered successfully",
        subscriptionId: this.lastID,
      });
    },
  );
});

router.get("/web-push/public-key", (req, res) => {
  res.json({
    publicKey: getVapidPublicKey(),
  });
});

router.post("/web-push/subscribe", (req, res) => {
  const {
    subscription,
    primaryDistrict,
    watchDistricts = [],
    threshold = 80,
    notificationsEnabled = true,
  } = req.body;

  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (!endpoint || !p256dh || !auth || !primaryDistrict) {
    return res.status(400).json({
      message: "Missing required Web Push subscription fields.",
    });
  }

  if (
    typeof endpoint !== "string" ||
    typeof p256dh !== "string" ||
    typeof auth !== "string"
  ) {
    return res.status(400).json({
      message: "Invalid Web Push subscription fields.",
    });
  }

  if (!isValidDistrict(primaryDistrict)) {
    return res.status(400).json({
      message: "Invalid primaryDistrict.",
    });
  }

  if (!isValidWatchDistricts(watchDistricts)) {
    return res.status(400).json({
      message: "watchDistricts contains an invalid district.",
    });
  }

  if (!isValidThreshold(threshold)) {
    return res.status(400).json({
      message: "threshold must be a valid non-negative number.",
    });
  }

  if (typeof notificationsEnabled !== "boolean") {
    return res.status(400).json({
      message: "notificationsEnabled must be a boolean.",
    });
  }

  const createdAt = new Date().toISOString();

  db.run(
    `
      INSERT INTO web_push_subscriptions (
        endpoint,
        p256dh,
        auth,
        primaryDistrict,
        watchDistricts,
        threshold,
        notificationsEnabled,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(endpoint) DO UPDATE SET
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        primaryDistrict = excluded.primaryDistrict,
        watchDistricts = excluded.watchDistricts,
        threshold = excluded.threshold,
        notificationsEnabled = excluded.notificationsEnabled
    `,
    [
      endpoint,
      p256dh,
      auth,
      primaryDistrict,
      JSON.stringify(watchDistricts),
      threshold,
      notificationsEnabled ? 1 : 0,
      createdAt,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.status(201).json({
        message: "Web Push subscription registered successfully",
      });
    },
  );
});

router.patch("/web-push/preferences", (req, res) => {
  const {
    endpoint,
    primaryDistrict,
    watchDistricts,
    threshold,
    notificationsEnabled,
  } = req.body;

  if (!endpoint) {
    return res.status(400).json({
      message: "Web Push endpoint is required.",
    });
  }

  if (typeof endpoint !== "string") {
    return res.status(400).json({
      message: "Web Push endpoint must be a string.",
    });
  }

  const updates = [];
  const params = [];

  if (primaryDistrict !== undefined) {
    if (!isValidDistrict(primaryDistrict)) {
      return res.status(400).json({
        message: "Invalid primaryDistrict.",
      });
    }

    updates.push("primaryDistrict = ?");
    params.push(primaryDistrict);
  }

  if (watchDistricts !== undefined) {
    if (!isValidWatchDistricts(watchDistricts)) {
      return res.status(400).json({
        message: "watchDistricts contains an invalid district.",
      });
    }

    updates.push("watchDistricts = ?");
    params.push(JSON.stringify(watchDistricts));
  }

  if (threshold !== undefined) {
    if (!isValidThreshold(threshold)) {
      return res.status(400).json({
        message: "threshold must be a valid non-negative number.",
      });
    }

    updates.push("threshold = ?");
    params.push(threshold);
  }

  if (notificationsEnabled !== undefined) {
    if (typeof notificationsEnabled !== "boolean") {
      return res.status(400).json({
        message: "notificationsEnabled must be a boolean.",
      });
    }

    updates.push("notificationsEnabled = ?");
    params.push(notificationsEnabled ? 1 : 0);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      message: "No Web Push preferences were provided.",
    });
  }

  params.push(endpoint);

  db.run(
    `
      UPDATE web_push_subscriptions
      SET ${updates.join(", ")}
      WHERE endpoint = ?
    `,
    params,
    function (err) {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Web Push subscription was not found.",
        });
      }

      res.json({
        message: "Web Push preferences updated successfully",
      });
    },
  );
});

router.post("/web-push/status", (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({
      message: "Web Push endpoint is required.",
    });
  }

  if (typeof endpoint !== "string") {
    return res.status(400).json({
      message: "Web Push endpoint must be a string.",
    });
  }

  db.get(
    `
      SELECT
        primaryDistrict,
        watchDistricts,
        threshold,
        notificationsEnabled
      FROM web_push_subscriptions
      WHERE endpoint = ?
    `,
    [endpoint],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (!row) {
        return res.json({
          subscribed: false,
        });
      }

      let watchDistricts = [];

      try {
        watchDistricts = row.watchDistricts
          ? JSON.parse(row.watchDistricts)
          : [];
      } catch {
        watchDistricts = [];
      }

      res.json({
        subscribed: true,
        primaryDistrict: row.primaryDistrict,
        watchDistricts,
        threshold: row.threshold,
        notificationsEnabled: Boolean(row.notificationsEnabled),
      });
    },
  );
});

router.post("/web-push/unsubscribe", (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({
      message: "Web Push endpoint is required.",
    });
  }

  if (typeof endpoint !== "string") {
    return res.status(400).json({
      message: "Web Push endpoint must be a string.",
    });
  }

  db.run(
    `
      DELETE FROM web_push_subscriptions
      WHERE endpoint = ?
    `,
    [endpoint],
    function (err) {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json({
        message: "Web Push subscription removed successfully",
        removed: this.changes > 0,
      });
    },
  );
});

module.exports = router;
