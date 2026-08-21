require("dotenv").config();

const { createClient } = require("@libsql/client");

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl || !authToken) {
  throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.");
}

const client = createClient({
  url: databaseUrl,
  authToken,
});

let initializationError = null;

async function initializeDatabase() {
  await client.execute(`
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

  await client.execute(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      primaryDistrict TEXT NOT NULL,
      watchDistricts TEXT NOT NULL DEFAULT '[]',
      threshold INTEGER NOT NULL DEFAULT 80,
      notificationsEnabled INTEGER NOT NULL DEFAULT 1
    )
  `);

  await client.execute(`
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

  // ensure older databases contain fields added in later versions

  const tableInfo = await client.execute("PRAGMA table_info(air_measurements)");

  const columns = new Set(tableInfo.rows.map((row) => row.name));

  if (!columns.has("district")) {
    await client.execute(`
      ALTER TABLE air_measurements
      ADD COLUMN district TEXT NOT NULL DEFAULT 'Сихівський'
    `);
  }

  if (!columns.has("pm25")) {
    await client.execute(`
      ALTER TABLE air_measurements
      ADD COLUMN pm25 INTEGER
    `);
  }

  if (!columns.has("pm10")) {
    await client.execute(`
      ALTER TABLE air_measurements
      ADD COLUMN pm10 INTEGER
    `);
  }

  console.log("Connected to Turso database");
}

const databaseReady = initializeDatabase().catch((error) => {
  initializationError = error;
  console.error("Failed to initialize Turso database:", error.message);
});

async function waitForDatabase() {
  await databaseReady;

  if (initializationError) {
    throw initializationError;
  }
}

function normalizeArguments(params, callback) {
  if (typeof params === "function") {
    return {
      params: [],
      callback: params,
    };
  }

  return {
    params: params ?? [],
    callback,
  };
}

async function executeQuery(query, params) {
  await waitForDatabase();

  return client.execute({
    sql: query,
    args: params,
  });
}

const db = {
  get(query, params, callback) {
    const normalized = normalizeArguments(params, callback);

    const operation = executeQuery(query, normalized.params).then((result) => {
      const row = result.rows[0];

      return row ? { ...row } : undefined;
    });

    if (!normalized.callback) {
      return operation;
    }

    operation
      .then((row) => {
        normalized.callback(null, row);
      })
      .catch((error) => {
        normalized.callback(error);
      });
  },

  all(query, params, callback) {
    const normalized = normalizeArguments(params, callback);

    const operation = executeQuery(query, normalized.params).then((result) =>
      result.rows.map((row) => ({ ...row })),
    );

    if (!normalized.callback) {
      return operation;
    }

    operation
      .then((rows) => {
        normalized.callback(null, rows);
      })
      .catch((error) => {
        normalized.callback(error);
      });
  },

  run(query, params, callback) {
    const normalized = normalizeArguments(params, callback);

    const operation = executeQuery(query, normalized.params).then((result) => ({
      lastID:
        result.lastInsertRowid === undefined
          ? undefined
          : Number(result.lastInsertRowid),
      changes: result.rowsAffected,
    }));

    if (!normalized.callback) {
      return operation;
    }

    operation
      .then((context) => {
        normalized.callback.call(context, null);
      })
      .catch((error) => {
        normalized.callback.call(
          {
            lastID: undefined,
            changes: 0,
          },
          error,
        );
      });
  },

  serialize(callback) {
    callback();
  },
};

module.exports = db;
