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
  db.run(`
    CREATE TABLE IF NOT EXISTS air_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      district TEXT NOT NULL DEFAULT 'Сихівський',
      airIndex INTEGER NOT NULL,
      updatedAt TEXT NOT NULL,
      alert INTEGER NOT NULL,
      alertMessage TEXT
    )
  `);

  db.all(`PRAGMA table_info(air_measurements)`, [], (err, rows) => {
    if (err) {
      console.error("Помилка перевірки структури таблиці:", err.message);
      return;
    }

    const hasDistrict = rows.some((row) => row.name === "district");

    if (!hasDistrict) {
      db.run(
        `ALTER TABLE air_measurements ADD COLUMN district TEXT NOT NULL DEFAULT 'Сихівський'`,
        (alterErr) => {
          if (alterErr) {
            console.error("Помилка додавання поля district:", alterErr.message);
          } else {
            console.log("Поле district додано до таблиці air_measurements");
          }
        },
      );
    }
  });
});

module.exports = db;
