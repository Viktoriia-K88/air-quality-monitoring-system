process.env.VAPID_PUBLIC_KEY = "test-public-key";
process.env.VAPID_PRIVATE_KEY = "test-private-key";
process.env.VAPID_SUBJECT = "mailto:test@example.com";

jest.mock("../db/database", () => ({
  all: jest.fn(),
  run: jest.fn(),
}));

jest.mock("web-push", () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
}));

const db = require("../db/database");
const webpush = require("web-push");

const { processWebPushNotifications } = require("../services/webPushService");

const subscription = {
  endpoint: "https://example.com/push",
  p256dh: "test-p256dh",
  auth: "test-auth",
  primaryDistrict: "Франківський",
  watchDistricts: "[]",
  threshold: 70,
  notificationsEnabled: 1,
};

function mockDatabase(currentAirIndex, previousAirIndex) {
  db.all.mockImplementation((query, params, callback) => {
    if (query.includes("FROM web_push_subscriptions")) {
      callback(null, [subscription]);
      return;
    }

    if (query.includes("FROM air_measurements")) {
      callback(null, [
        { airIndex: currentAirIndex },
        { airIndex: previousAirIndex },
      ]);
    }
  });
}

beforeEach(() => {
  jest.clearAllMocks();

  webpush.sendNotification.mockResolvedValue({});
});

describe("Web Push threshold logic", () => {
  test("sends notification when AQI crosses the threshold", async () => {
    mockDatabase(71, 69);

    await processWebPushNotifications({
      city: "Львів",
      district: "Франківський",
      airIndex: 71,
      updatedAt: "2026-08-18T10:00:00.000Z",
    });

    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
  });

  test("does not send another notification while AQI stays above the threshold", async () => {
    mockDatabase(75, 71);

    await processWebPushNotifications({
      city: "Львів",
      district: "Франківський",
      airIndex: 75,
      updatedAt: "2026-08-18T10:10:00.000Z",
    });

    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  test("does not send notification when AQI falls below the threshold", async () => {
    mockDatabase(68, 75);

    await processWebPushNotifications({
      city: "Львів",
      district: "Франківський",
      airIndex: 68,
      updatedAt: "2026-08-18T10:20:00.000Z",
    });

    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  test("sends notification again after AQI drops and crosses the threshold again", async () => {
    mockDatabase(72, 68);

    await processWebPushNotifications({
      city: "Львів",
      district: "Франківський",
      airIndex: 72,
      updatedAt: "2026-08-18T10:30:00.000Z",
    });

    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
  });
});
