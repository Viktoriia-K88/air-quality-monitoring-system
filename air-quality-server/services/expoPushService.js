const db = require("../db/database");

function isExpoPushToken(token) {
  if (typeof token !== "string") {
    return false;
  }

  return (
    ((token.startsWith("ExponentPushToken[") ||
      token.startsWith("ExpoPushToken[")) &&
      token.endsWith("]")) ||
    /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/i.test(token)
  );
}

async function sendExpoPushNotification(token, title, body, data = {}) {
  if (!isExpoPushToken(token)) {
    console.error("Invalid Expo push token.");
    return false;
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

    if (!response.ok) {
      throw new Error(
        `Expo Push request failed with status ${response.status}.`,
      );
    }

    const result = await response.json();

    const ticket = Array.isArray(result.data) ? result.data[0] : result.data;

    if (!ticket || ticket.status !== "ok") {
      const errorMessage =
        ticket?.message ||
        result.errors?.[0]?.message ||
        "Expo Push Service rejected the notification.";

      throw new Error(errorMessage);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("Expo push ticket:", ticket);
    }

    return true;
  } catch (error) {
    console.error("Failed to send Expo push:", error.message);

    return false;
  }
}

function getPushSubscriptions() {
  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT
          token,
          primaryDistrict,
          watchDistricts,
          threshold,
          notificationsEnabled
        FROM push_subscriptions
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

async function processExpoPushNotifications({
  city,
  district,
  airIndex,
  updatedAt,
}) {
  let subscriptions;
  let previousAirIndex;

  try {
    [subscriptions, previousAirIndex] = await Promise.all([
      getPushSubscriptions(),
      getPreviousAirIndex(district),
    ]);
  } catch (error) {
    console.error("Expo Push database error:", error.message);
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

    const title = "Попередження про якість повітря";

    const body = `У районі ${district} рівень забруднення зріс до ${airIndex}.`;

    const sent = await sendExpoPushNotification(row.token, title, body, {
      city,
      district,
      airIndex,
      updatedAt,
    });

    if (sent && process.env.NODE_ENV !== "production") {
      console.log(
        `Expo push accepted. District: ${district}, AQI: ${airIndex}, previous AQI: ${previousAirIndex ?? "none"}, threshold: ${row.threshold}`,
      );
    }
  }
}

module.exports = {
  processExpoPushNotifications,
};
