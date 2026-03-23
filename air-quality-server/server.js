const express = require("express");
const airRoutes = require("./routes/airRoutes");
const db = require("./db/database");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Air Quality API is running");
});

app.use("/", airRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
