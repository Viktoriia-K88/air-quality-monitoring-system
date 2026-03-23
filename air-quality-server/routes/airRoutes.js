const express = require("express");
const router = express.Router();
const db = require("../db/database");

const MAX_HISTORY_LENGTH = 20;
const ALERT_THRESHOLD = 80;

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
    function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

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

module.exports = router;
