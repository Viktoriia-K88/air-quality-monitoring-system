process.env.INGEST_API_KEY = "test-ingest-key";

const request = require("supertest");
const express = require("express");

jest.mock("../db/database", () => ({
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn(),
}));

jest.mock("../services/expoPushService", () => ({
  processExpoPushNotifications: jest.fn(),
}));

jest.mock("../services/webPushService", () => ({
  getVapidPublicKey: jest.fn(() => "test-public-key"),
  processWebPushNotifications: jest.fn(),
}));

const db = require("../db/database");

const { processExpoPushNotifications } = require("../services/expoPushService");

const { processWebPushNotifications } = require("../services/webPushService");

const airRoutes = require("../routes/airRoutes");

const app = express();

app.use(express.json());
app.use("/", airRoutes);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /current", () => {
  test("returns current air data for the selected district", async () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(null, {
        city: "Львів",
        district: "Франківський",
        airIndex: 85,
        pm25: 32,
        pm10: 47,
        updatedAt: "2026-08-18T10:00:00.000Z",
        alert: 1,
        alertMessage: "Увага! Підвищений рівень забруднення повітря.",
      });
    });

    const response = await request(app).get("/current").query({
      district: "Франківський",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      city: "Львів",
      district: "Франківський",
      airIndex: 85,
      pm25: 32,
      pm10: 47,
      updatedAt: "2026-08-18T10:00:00.000Z",
      alert: true,
      alertMessage: "Увага! Підвищений рівень забруднення повітря.",
    });
  });

  test("returns fallback data when no measurement exists", async () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(null, undefined);
    });

    const response = await request(app).get("/current").query({
      district: "Франківський",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      city: "Львів",
      district: "Франківський",
      airIndex: 67,
      pm25: null,
      pm10: null,
      updatedAt: expect.any(String),
      alert: false,
      alertMessage: "",
    });
  });
});

describe("GET /history", () => {
  test("returns 400 when district is missing", async () => {
    const response = await request(app).get("/history");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "District is required.",
    });
  });

  test("returns 400 when range is invalid", async () => {
    const response = await request(app).get("/history").query({
      district: "Франківський",
      range: "week",
    });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Invalid range. Use last20, today or yesterday.",
    });
  });

  test("returns history data for the selected district", async () => {
    db.all.mockImplementation((query, params, callback) => {
      callback(null, [
        {
          id: 2,
          district: "Франківський",
          updatedAt: "2026-08-18T10:10:00.000Z",
          value: 72,
          pm25: 25,
          pm10: 40,
        },
        {
          id: 1,
          district: "Франківський",
          updatedAt: "2026-08-18T10:00:00.000Z",
          value: 65,
          pm25: 20,
          pm10: 35,
        },
      ]);
    });

    const response = await request(app).get("/history").query({
      district: "Франківський",
      range: "last20",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);

    expect(response.body[0]).toEqual({
      id: "1",
      district: "Франківський",
      updatedAt: "2026-08-18T10:00:00.000Z",
      time: expect.any(String),
      value: 65,
      pm25: 20,
      pm10: 35,
    });

    expect(response.body[1]).toEqual({
      id: "2",
      district: "Франківський",
      updatedAt: "2026-08-18T10:10:00.000Z",
      time: expect.any(String),
      value: 72,
      pm25: 25,
      pm10: 40,
    });
  });
});

describe("POST /air-data", () => {
  test("returns 401 when API key is missing", async () => {
    const response = await request(app).post("/air-data").send({
      city: "Львів",
      district: "Франківський",
      airIndex: 70,
      pm25: 20,
      pm10: 35,
      updatedAt: "2026-08-18T10:00:00.000Z",
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Unauthorized.",
    });

    expect(db.run).not.toHaveBeenCalled();
  });

  test("returns 400 when a required field is missing", async () => {
    const response = await request(app)
      .post("/air-data")
      .set("x-api-key", "test-ingest-key")
      .send({
        city: "Львів",
        district: "Франківський",
        airIndex: 70,
        pm25: 20,
        updatedAt: "2026-08-18T10:00:00.000Z",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message:
        "Missing required fields: city, district, airIndex, pm25, pm10, updatedAt",
    });

    expect(db.run).not.toHaveBeenCalled();
  });

  test("saves valid air data and returns 201", async () => {
    db.run.mockImplementation((query, params, callback) => {
      callback(null);
    });

    processExpoPushNotifications.mockResolvedValue(undefined);
    processWebPushNotifications.mockResolvedValue(undefined);

    const airData = {
      city: "Львів",
      district: "Франківський",
      airIndex: 81,
      pm25: 32,
      pm10: 47,
      updatedAt: "2026-08-18T10:00:00.000Z",
    };

    const response = await request(app)
      .post("/air-data")
      .set("x-api-key", "test-ingest-key")
      .send(airData);

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      message: "Air data received successfully",
      currentAirData: {
        ...airData,
        alert: true,
        alertMessage: "Увага! Підвищений рівень забруднення повітря.",
      },
    });

    expect(db.run).toHaveBeenCalledTimes(1);

    expect(processExpoPushNotifications).toHaveBeenCalledWith({
      city: airData.city,
      district: airData.district,
      airIndex: airData.airIndex,
      updatedAt: airData.updatedAt,
    });

    expect(processWebPushNotifications).toHaveBeenCalledWith({
      city: airData.city,
      district: airData.district,
      airIndex: airData.airIndex,
      updatedAt: airData.updatedAt,
    });
  });
});
