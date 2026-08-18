const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "air_quality.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Помилка підключення до SQLite:", err.message);
  } else {
    console.log("Підключено до SQLite");
  }
});

db.serialize(() => {
  // Air quality measurements

  db.run(`
    CREATE TABLE IF NOT EXISTS air_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      district TEXT NOT NULL DEFAULT 'Сихівський',
      airIndex INTEGER NOT NULL,
      pm25 INTEGER,
      pm10 INTEGER,
      updatedAt TEXT NOT NULL,
      alert INTEGER NOT NULL,
      alertMessage TEXT
    )
  `);

  // Expo Push subscriptions for the mobile application

  db.run(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      primaryDistrict TEXT NOT NULL,
      watchDistricts TEXT NOT NULL DEFAULT '[]',
      threshold INTEGER NOT NULL DEFAULT 80,
      notificationsEnabled INTEGER NOT NULL DEFAULT 1
    )
  `);

  // Web Push subscriptions for the browser

  db.run(`
    CREATE TABLE IF NOT EXISTS web_push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      primaryDistrict TEXT NOT NULL,
      watchDistricts TEXT NOT NULL DEFAULT '[]',
      threshold INTEGER NOT NULL DEFAULT 80,
      notificationsEnabled INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL
    )
  `);

  // Ensure older databases contain fields added in later versions

  db.all(`PRAGMA table_info(air_measurements)`, [], (err, rows) => {
    if (err) {
      console.error("Помилка перевірки структури таблиці:", err.message);
      return;
    }

    const hasDistrict = rows.some((row) => row.name === "district");
    const hasPm25 = rows.some((row) => row.name === "pm25");
    const hasPm10 = rows.some((row) => row.name === "pm10");

    if (!hasDistrict) {
      db.run(
        `
          ALTER TABLE air_measurements
          ADD COLUMN district TEXT NOT NULL DEFAULT 'Сихівський'
        `,
        (alterErr) => {
          if (alterErr) {
            console.error("Помилка додавання поля district:", alterErr.message);
          }
        },
      );
    }

    if (!hasPm25) {
      db.run(
        `
          ALTER TABLE air_measurements
          ADD COLUMN pm25 INTEGER
        `,
        (alterErr) => {
          if (alterErr) {
            console.error("Помилка додавання поля pm25:", alterErr.message);
          }
        },
      );
    }

    if (!hasPm10) {
      db.run(
        `
          ALTER TABLE air_measurements
          ADD COLUMN pm10 INTEGER
        `,
        (alterErr) => {
          if (alterErr) {
            console.error("Помилка додавання поля pm10:", alterErr.message);
          }
        },
      );
    }
  });
});

module.exports = db;
