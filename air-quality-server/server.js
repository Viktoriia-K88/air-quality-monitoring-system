require("dotenv").config();

const express = require("express");
const cors = require("cors");

const airRoutes = require("./routes/airRoutes");

require("./db/database");

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Air Quality API is running");
});

app.use("/", airRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
