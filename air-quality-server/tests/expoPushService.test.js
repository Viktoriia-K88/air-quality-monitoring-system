jest.mock("../db/database", () => ({
  all: jest.fn(),
}));

const db = require("../db/database");

const { processExpoPushNotifications } = require("../services/expoPushService");

const subscription = {
  token: "ExpoPushToken[test-token]",
  primaryDistrict: "Франківський",
  watchDistricts: "[]",
  threshold: 70,
  notificationsEnabled: 1,
};

function mockDatabase(currentAirIndex, previousAirIndex) {
  db.all.mockImplementation((query, params, callback) => {
    if (query.includes("FROM push_subscriptions")) {
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

function mockSuccessfulPush() {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({
      data: {
        status: "ok",
      },
    }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSuccessfulPush();
});

describe("Expo Push threshold logic", () => {
  test("sends notification when AQI crosses the threshold", async () => {
    mockDatabase(71, 69);

    await processExpoPushNotifications({
      city: "Львів",
      district: "Франківський",
      airIndex: 71,
      updatedAt: "2026-08-18T10:00:00.000Z",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("does not send another notification while AQI stays above the threshold", async () => {
    mockDatabase(75, 71);

    await processExpoPushNotifications({
      city: "Львів",
      district: "Франківський",
      airIndex: 75,
      updatedAt: "2026-08-18T10:10:00.000Z",
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("does not send notification when AQI falls below the threshold", async () => {
    mockDatabase(68, 75);

    await processExpoPushNotifications({
      city: "Львів",
      district: "Франківський",
      airIndex: 68,
      updatedAt: "2026-08-18T10:20:00.000Z",
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("sends notification again after AQI drops and crosses the threshold again", async () => {
    mockDatabase(72, 68);

    await processExpoPushNotifications({
      city: "Львів",
      district: "Франківський",
      airIndex: 72,
      updatedAt: "2026-08-18T10:30:00.000Z",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
