const webpush = require("web-push");
const db = require("../db/database");

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
  throw new Error(
    "Missing VAPID configuration. Check VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT in .env.",
  );
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const districtNames = {
  Галицький: "Halytskyi",
  Залізничний: "Zaliznychnyi",
  Личаківський: "Lychakivskyi",
  Сихівський: "Sykhivskyi",
  Франківський: "Frankivskyi",
  Шевченківський: "Shevchenkivskyi",
};

function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}

async function sendWebPushNotification(subscription, payload) {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

function getWebPushSubscriptions() {
  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT
          endpoint,
          p256dh,
          auth,
          primaryDistrict,
          watchDistricts,
          threshold,
          notificationsEnabled
        FROM web_push_subscriptions
      `,
      [],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows ?? []);
      },
    );
  });
}

function getPreviousAirIndex(district) {
  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT airIndex
        FROM air_measurements
        WHERE district = ?
        ORDER BY id DESC
        LIMIT 2
      `,
      [district],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        if (!rows || rows.length < 2) {
          resolve(null);
          return;
        }

        resolve(rows[1].airIndex);
      },
    );
  });
}

function deleteWebPushSubscription(endpoint) {
  return new Promise((resolve, reject) => {
    db.run(
      `
        DELETE FROM web_push_subscriptions
        WHERE endpoint = ?
      `,
      [endpoint],
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      },
    );
  });
}

function parseWatchDistricts(value) {
  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

async function processWebPushNotifications({
  city,
  district,
  airIndex,
  updatedAt,
}) {
  let subscriptions;
  let previousAirIndex;

  try {
    [subscriptions, previousAirIndex] = await Promise.all([
      getWebPushSubscriptions(),
      getPreviousAirIndex(district),
    ]);
  } catch (error) {
    console.error("Web Push database error:", error.message);
    return;
  }

  if (subscriptions.length === 0) {
    return;
  }

  for (const row of subscriptions) {
    if (!row.notificationsEnabled) {
      continue;
    }

    const watchDistricts = parseWatchDistricts(row.watchDistricts);

    const isWatchedDistrict =
      row.primaryDistrict === district || watchDistricts.includes(district);

    if (!isWatchedDistrict) {
      continue;
    }

    const isAboveThreshold = airIndex > row.threshold;

    const wasAboveThreshold =
      previousAirIndex !== null && previousAirIndex > row.threshold;

    if (!isAboveThreshold || wasAboveThreshold) {
      continue;
    }

    const subscription = {
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    };

    const districtName = districtNames[district] ?? district;

    const payload = {
      title: "Air Quality Alert",
      body: `AQI in ${districtName} district has reached ${airIndex}.`,
      url: "/",
      city,
      district,
      airIndex,
      updatedAt,
    };

    try {
      await sendWebPushNotification(subscription, payload);

      if (process.env.NODE_ENV !== "production") {
        console.log(
          `Web push sent. District: ${district}, AQI: ${airIndex}, previous AQI: ${previousAirIndex ?? "none"}, threshold: ${row.threshold}`,
        );
      }
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        try {
          await deleteWebPushSubscription(row.endpoint);
        } catch (deleteError) {
          console.error(
            "Failed to remove expired Web Push subscription:",
            deleteError.message,
          );
        }

        continue;
      }

      console.error("Web Push error:", error.message);
    }
  }
}

module.exports = {
  getVapidPublicKey,
  sendWebPushNotification,
  processWebPushNotifications,
};
