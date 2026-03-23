const currentAirData = {
  city: "Львів",
  airIndex: 67,
  updatedAt: "15:30",
  alert: false,
  alertMessage: "",
};

const historyAirData = [
  { id: "1", time: "10:00", value: 55 },
  { id: "2", time: "11:00", value: 61 },
  { id: "3", time: "12:00", value: 73 },
  { id: "4", time: "13:00", value: 67 },
  { id: "5", time: "14:00", value: 82 },
];

module.exports = {
  currentAirData,
  historyAirData,
};
